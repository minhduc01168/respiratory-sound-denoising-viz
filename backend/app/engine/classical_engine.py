import time
from typing import Any, Optional
import numpy as np

from .base import BaseDenoisingEngine, DenoiseResult
from .filters import apply_bandpass_filter
from .audio_io import normalize_audio
from .profiles import AudioProfileConfig, get_profile_config
from .spectral_gating import reduce_noise_spectral_gating
from .vad import trim_silence


class ClassicalDspEngine(BaseDenoisingEngine):
    """
    Classical DSP Denoising Engine:
    Zero-phase Butterworth Bandpass Filtering + Adaptive Acoustic VAD + Soft Wiener Spectral Gating.
    """
    algorithm_name: str = "classical_dsp"
    description: str = "Classical DSP (Zero-phase Butterworth + Adaptive Spectral Gating)"

    def process(
        self,
        audio: np.ndarray,
        sr: int,
        profile_config: Optional[AudioProfileConfig] = None,
        lowcut: Optional[float] = None,
        highcut: Optional[float] = None,
        trim_silence_flag: bool = True,
        spectral_gating_flag: bool = True,
        **kwargs: Any,
    ) -> DenoiseResult:
        start_time = time.time()
        cfg = profile_config or get_profile_config("respiratory")

        eff_lowcut = lowcut if lowcut is not None else cfg.lowcut
        eff_highcut = highcut if highcut is not None else cfg.highcut

        # 1. Zero-phase Butterworth Bandpass Filter
        bandpassed = apply_bandpass_filter(
            audio,
            lowcut=eff_lowcut,
            highcut=eff_highcut,
            sr=sr,
            order=cfg.filter_order,
        )

        # 2. VAD Trimming with Profile-specific margins
        silence_trimmed_sec = 0.0
        active_segments = []
        if trim_silence_flag:
            trimmed, active_segments, silence_trimmed_sec = trim_silence(
                bandpassed,
                sr=sr,
                pre_pad_ms=cfg.vad_pre_pad_ms,
                post_pad_ms=cfg.vad_post_pad_ms,
                min_speech_ms=cfg.vad_min_speech_ms,
                min_silence_ms=cfg.vad_min_silence_ms,
            )
            current_audio = trimmed
        else:
            current_audio = bandpassed

        # 3. Adaptive Spectral Gating
        if spectral_gating_flag:
            denoised = reduce_noise_spectral_gating(
                current_audio,
                sr=sr,
                alpha=cfg.spectral_alpha,
                spectral_floor=cfg.spectral_floor,
                smooth_time_frames=cfg.smooth_time_frames,
                smooth_freq_bins=cfg.smooth_freq_bins,
            )
        else:
            denoised = current_audio

        # 4. Normalization
        clean_audio = normalize_audio(denoised, target_peak=0.95)
        elapsed_ms = round((time.time() - start_time) * 1000.0, 2)

        return DenoiseResult(
            clean_audio=clean_audio,
            sample_rate=sr,
            latency_ms=elapsed_ms,
            algorithm=self.algorithm_name,
            profile=cfg.profile.value,
            extra_metrics={
                "silence_trimmed_sec": silence_trimmed_sec,
                "active_segments": active_segments,
                "lowcut": eff_lowcut,
                "highcut": eff_highcut,
                "spectral_alpha": cfg.spectral_alpha,
                "spectral_floor": cfg.spectral_floor,
            },
        )

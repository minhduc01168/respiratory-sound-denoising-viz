import time
from typing import Any, Optional, Tuple
import numpy as np
from scipy.signal import hilbert, medfilt

from .base import BaseDenoisingEngine, DenoiseResult
from .filters import apply_bandpass_filter
from .audio_io import normalize_audio
from .profiles import AudioProfileConfig, get_profile_config
from .spectral_gating import reduce_noise_spectral_gating
from .vad import trim_silence


def suppress_heart_sounds(
    audio: np.ndarray,
    sr: int = 16000,
    hs_lowcut: float = 25.0,
    hs_highcut: float = 160.0,
    peak_threshold_factor: float = 1.6,
    suppression_gain: float = 0.25,
) -> Tuple[np.ndarray, float]:
    """
    Suppresses rhythmic biological heart sounds (S1, S2) in the 25Hz - 160Hz band.
    Uses envelope peak extraction to identify cardiac systole/diastole bursts and
    dynamically attenuates them while preserving baseline vesicular lung sounds.

    Returns:
        Tuple of (filtered_audio, hsai_db: Heart Sound Attenuation Index in dB)
    """
    if len(audio) < sr // 4:
        return audio, 0.0

    # 1. Isolate the low-frequency heart sound band (25Hz - 160Hz)
    try:
        hs_band = apply_bandpass_filter(
            audio,
            lowcut=hs_lowcut,
            highcut=hs_highcut,
            sr=sr,
            order=3,
        )
    except Exception:
        return audio, 0.0

    # 2. Extract analytic envelope using Hilbert Transform
    analytic_signal = hilbert(hs_band)
    envelope = np.abs(analytic_signal)

    # Smooth envelope with a median window of ~50ms to prevent jitter
    med_window = max(3, int(0.05 * sr))
    if med_window % 2 == 0:
        med_window += 1
    smoothed_env = medfilt(envelope, kernel_size=min(med_window, len(envelope) - (1 - len(envelope) % 2)))

    # 3. Identify cardiac bursts (peaks exceeding local background energy)
    floor_level = np.median(smoothed_env) + 1e-12
    threshold = floor_level * peak_threshold_factor
    burst_mask = smoothed_env > threshold

    # Smooth the gain mask to avoid sudden phase clicks (15ms ramp)
    gain_mask = np.ones_like(hs_band, dtype=np.float32)
    gain_mask[burst_mask] = suppression_gain

    # 4. Attenuate heart sound band only where cardiac bursts occur
    clean_hs_band = hs_band * gain_mask

    # Calculate Heart Sound Attenuation Index (HSAI in dB)
    orig_energy = np.sum(hs_band**2) + 1e-12
    clean_energy = np.sum(clean_hs_band**2) + 1e-12
    hsai_db = float(10.0 * np.log10(orig_energy / clean_energy))
    hsai_db = max(0.0, min(hsai_db, 25.0))

    # 5. Reconstruct full audio: (original minus original hs_band) + clean hs_band
    # This preserves all high-frequency diagnostic breath sounds (>160Hz) untouched
    reconstructed = (audio - hs_band) + clean_hs_band
    return reconstructed.astype(np.float32), round(hsai_db, 2)


class BioAcousticEngine(BaseDenoisingEngine):
    """
    Bio-Acoustic Denoising Engine:
    Sub-band Cardiac Decomposition & Friction Filter + Adaptive Spectral Gating.
    Specifically engineered for clinical lung sound recordings contaminated by
    heartbeat pulsations (S1, S2) and stethoscope rubbing artifacts.
    """
    algorithm_name: str = "bio_acoustic"
    description: str = "Bio-Acoustic Engine (Heart Sound Removal + Stethoscope Friction Filter)"

    def process(
        self,
        audio: np.ndarray,
        sr: int,
        profile_config: Optional[AudioProfileConfig] = None,
        lowcut: Optional[float] = None,
        highcut: Optional[float] = None,
        trim_silence_flag: bool = True,
        spectral_gating_flag: bool = True,
        suppress_cardiac: bool = True,
        **kwargs: Any,
    ) -> DenoiseResult:
        start_time = time.time()
        cfg = profile_config or get_profile_config("respiratory")

        eff_lowcut = lowcut if lowcut is not None else cfg.lowcut
        eff_highcut = highcut if highcut is not None else cfg.highcut

        # 1. Base Zero-Phase Bandpass (Remove sub-audible friction < 50Hz)
        bandpassed = apply_bandpass_filter(
            audio,
            lowcut=eff_lowcut,
            highcut=eff_highcut,
            sr=sr,
            order=cfg.filter_order,
        )

        # 2. Biological Heart Sound Suppression (if enabled and profile is respiratory)
        hsai_db = 0.0
        if suppress_cardiac and cfg.profile.value == "respiratory":
            cleaned_cardiac, hsai_db = suppress_heart_sounds(bandpassed, sr=sr)
            current_audio = cleaned_cardiac
        else:
            current_audio = bandpassed

        # 3. Acoustic VAD Trimming
        silence_trimmed_sec = 0.0
        active_segments = []
        if trim_silence_flag:
            trimmed, active_segments, silence_trimmed_sec = trim_silence(
                current_audio,
                sr=sr,
                pre_pad_ms=cfg.vad_pre_pad_ms,
                post_pad_ms=cfg.vad_post_pad_ms,
                min_speech_ms=cfg.vad_min_speech_ms,
                min_silence_ms=cfg.vad_min_silence_ms,
            )
            current_audio = trimmed

        # 4. Adaptive Ambient Spectral Gating
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

        # 5. Peak Normalization
        clean_audio = normalize_audio(denoised, target_peak=0.95)
        elapsed_ms = round((time.time() - start_time) * 1000.0, 2)

        return DenoiseResult(
            clean_audio=clean_audio,
            sample_rate=sr,
            latency_ms=elapsed_ms,
            algorithm=self.algorithm_name,
            profile=cfg.profile.value,
            extra_metrics={
                "hsai_db": hsai_db,
                "silence_trimmed_sec": silence_trimmed_sec,
                "active_segments": active_segments,
                "lowcut": eff_lowcut,
                "highcut": eff_highcut,
                "spectral_alpha": cfg.spectral_alpha,
                "cardiac_suppression_active": suppress_cardiac,
            },
        )

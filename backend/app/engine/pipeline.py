import time
from typing import Any, Dict, Optional, Union
import numpy as np

from .audio_io import load_and_resample_audio, normalize_audio
from .metrics import evaluate_comprehensive_benchmark
from .profiles import AudioProfile, AudioProfileConfig, get_profile_config
from .registry import engine_registry
from .spectrogram import get_spectrogram_payload


def process_respiratory_audio(
    source: Union[str, bytes],
    target_sr: int = 16000,
    lowcut: Optional[float] = None,
    highcut: Optional[float] = None,
    trim_silence_flag: bool = True,
    spectral_gating_flag: bool = True,
    profile: Union[str, AudioProfile] = "respiratory",
    algorithm: str = "classical_dsp",
    **kwargs: Any,
) -> Dict[str, Any]:
    """
    Execute the end-to-end audio denoising and visualization pipeline via pluggable Engine Strategy.

    Supported Profiles:
    - 'respiratory': Optimized for lung sound preservation (Crackles, Wheezes, 50-2500Hz).
    - 'speech': Optimized for wideband speech clarity (Formants, 80-7500Hz, quiet noise floor).

    Supported Algorithms:
    - 'classical_dsp': Zero-phase Butterworth Bandpass + Adaptive Spectral Gating.
    - Additional AI/Bio engines registered via EngineRegistry.

    Returns:
        Dictionary containing raw_audio, clean_audio, sample_rate, spectrogram,
        algorithm, profile, and comprehensive metrics.
    """
    start_time = time.time()

    # Resolve Profile and Engine
    profile_cfg = get_profile_config(profile)
    engine = engine_registry.get(algorithm)

    # Step 1: Ingestion & Resampling
    raw_audio, sr = load_and_resample_audio(source, target_sr=target_sr)
    raw_audio = normalize_audio(raw_audio, target_peak=0.95)
    orig_duration = len(raw_audio) / sr

    # Step 2: Execute Denoising Strategy
    denoise_result = engine.process(
        raw_audio,
        sr=sr,
        profile_config=profile_cfg,
        lowcut=lowcut,
        highcut=highcut,
        trim_silence_flag=trim_silence_flag,
        spectral_gating_flag=spectral_gating_flag,
        **kwargs,
    )

    clean_audio = denoise_result.clean_audio
    cleaned_duration = len(clean_audio) / sr

    # Step 3: Mel-Spectrogram generation for frontend
    spec_payload = get_spectrogram_payload(clean_audio, sr=sr, n_mels=64, hop_len=512)

    total_latency_ms = round((time.time() - start_time) * 1000.0, 1)

    # Evaluate profile-tailored clinical/speech benchmark metrics
    bench_metrics = evaluate_comprehensive_benchmark(
        raw_audio,
        clean_audio,
        sr=sr,
        profile=denoise_result.profile,
    )

    # Merge metrics
    metrics = {
        "latency_ms": total_latency_ms,
        "engine_latency_ms": denoise_result.latency_ms,
        "original_duration_sec": round(orig_duration, 3),
        "cleaned_duration_sec": round(cleaned_duration, 3),
        "silence_trimmed_sec": denoise_result.extra_metrics.get("silence_trimmed_sec", 0.0),
        "active_segments": denoise_result.extra_metrics.get("active_segments", []),
        "algorithm": denoise_result.algorithm,
        "profile": denoise_result.profile,
        **bench_metrics,
        **{k: v for k, v in denoise_result.extra_metrics.items() if k not in ("silence_trimmed_sec", "active_segments")},
    }

    return {
        "raw_audio": raw_audio,
        "clean_audio": clean_audio,
        "sample_rate": sr,
        "spectrogram": spec_payload,
        "algorithm": denoise_result.algorithm,
        "profile": denoise_result.profile,
        "metrics": metrics,
    }

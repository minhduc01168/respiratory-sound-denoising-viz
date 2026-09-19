import time
from typing import Any, Dict, Union
import numpy as np

from .audio_io import load_and_resample_audio, normalize_audio
from .filters import apply_bandpass_filter
from .vad import trim_silence
from .spectral_gating import reduce_noise_spectral_gating
from .spectrogram import get_spectrogram_payload


def process_respiratory_audio(
    source: Union[str, bytes],
    target_sr: int = 16000,
    lowcut: float = 50.0,
    highcut: float = 4000.0,
    trim_silence_flag: bool = True,
    spectral_gating_flag: bool = True,
) -> Dict[str, Any]:
    """
    Execute the full end-to-end DSP pre-processing pipeline for respiratory audio:
    1. Ingestion: Convert to Mono, resample to target_sr (16kHz), normalize.
    2. Zero-phase Bandpass Filtering: 50Hz - 4000Hz (Butterworth order 4).
    3. Acoustic VAD: Trim non-respiratory silence with safety margin.
    4. Adaptive Spectral Gating: Suppress background room/sensor noise.
    5. Mel-Spectrogram Extraction: Generate 2D dB matrix for web visualization.

    Args:
        source: Audio file path or raw bytes.
        target_sr: Target sample rate in Hz (default 16000).
        lowcut: Lower cutoff in Hz (default 50.0).
        highcut: Upper cutoff in Hz (default 4000.0).
        trim_silence_flag: Whether to remove long silence intervals (default True).
        spectral_gating_flag: Whether to perform spectral noise reduction (default True).

    Returns:
        Dictionary containing cleaned audio array, sample rate, duration metrics,
        spectrogram payload, and execution latency.
    """
    start_time = time.time()

    # Step 1: Ingestion & Resampling
    raw_audio, sr = load_and_resample_audio(source, target_sr=target_sr)
    raw_audio = normalize_audio(raw_audio, target_peak=0.95)
    orig_duration = len(raw_audio) / sr

    # Step 2: Zero-phase Bandpass Filtering
    bandpassed = apply_bandpass_filter(raw_audio, lowcut=lowcut, highcut=highcut, sr=sr, order=4)

    # Step 3: Acoustic VAD Trimming
    silence_trimmed_sec = 0.0
    active_segments = []
    if trim_silence_flag:
        trimmed, active_segments, silence_trimmed_sec = trim_silence(bandpassed, sr=sr)
        current_audio = trimmed
    else:
        current_audio = bandpassed

    # Step 4: Adaptive Spectral Gating
    if spectral_gating_flag:
        denoised = reduce_noise_spectral_gating(current_audio, sr=sr)
    else:
        denoised = current_audio

    # Final normalization
    clean_audio = normalize_audio(denoised, target_peak=0.95)
    cleaned_duration = len(clean_audio) / sr

    # Step 5: Mel-Spectrogram generation for frontend
    spec_payload = get_spectrogram_payload(clean_audio, sr=sr, n_mels=64, hop_len=512)

    elapsed_ms = round((time.time() - start_time) * 1000.0, 1)

    return {
        "raw_audio": raw_audio,
        "clean_audio": clean_audio,
        "sample_rate": sr,
        "spectrogram": spec_payload,
        "metrics": {
            "latency_ms": elapsed_ms,
            "original_duration_sec": round(orig_duration, 3),
            "cleaned_duration_sec": round(cleaned_duration, 3),
            "silence_trimmed_sec": silence_trimmed_sec,
            "active_segments": active_segments,
        },
    }

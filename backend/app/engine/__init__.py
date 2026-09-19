"""DSP and AI Engine for Respiratory Sound Denoising and Visualization.
"""

from .audio_io import load_and_resample_audio, normalize_audio, save_wav
from .filters import apply_bandpass_filter, butter_bandpass_sos
from .vad import compute_frame_energy, detect_breath_activity, trim_silence
from .spectral_gating import reduce_noise_spectral_gating, estimate_noise_profile
from .spectrogram import (
    compute_mel_spectrogram,
    create_mel_filterbank,
    get_spectrogram_payload,
)
from .metrics import (
    calculate_snr,
    calculate_snr_improvement,
    calculate_log_spectral_distance,
)
from .pipeline import process_respiratory_audio

__all__ = [
    "load_and_resample_audio",
    "normalize_audio",
    "save_wav",
    "apply_bandpass_filter",
    "butter_bandpass_sos",
    "compute_frame_energy",
    "detect_breath_activity",
    "trim_silence",
    "reduce_noise_spectral_gating",
    "estimate_noise_profile",
    "compute_mel_spectrogram",
    "create_mel_filterbank",
    "get_spectrogram_payload",
    "calculate_snr",
    "calculate_snr_improvement",
    "calculate_log_spectral_distance",
    "process_respiratory_audio",
]

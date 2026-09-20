"""DSP and AI Engine for Respiratory Sound Denoising and Visualization.
Supports Strategy Pattern pluggable engines and Dual Audio Profiles (Respiratory & Speech).
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
    calculate_source_to_distortion_ratio,
    calculate_crackle_preservation_rate,
    calculate_wheeze_harmonic_fidelity,
    estimate_stoi,
    estimate_pesq,
    evaluate_comprehensive_benchmark,
)
from .base import BaseDenoisingEngine, DenoiseResult
from .profiles import AudioProfile, AudioProfileConfig, get_profile_config, RESPIRATORY_PROFILE, SPEECH_PROFILE
from .classical_engine import ClassicalDspEngine
from .bio_acoustic import BioAcousticEngine, suppress_heart_sounds
from .dl_onnx import DTLNOnnxEngine
from .registry import EngineRegistry, engine_registry
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
    "calculate_source_to_distortion_ratio",
    "calculate_crackle_preservation_rate",
    "calculate_wheeze_harmonic_fidelity",
    "estimate_stoi",
    "estimate_pesq",
    "evaluate_comprehensive_benchmark",
    "BaseDenoisingEngine",
    "DenoiseResult",
    "AudioProfile",
    "AudioProfileConfig",
    "get_profile_config",
    "RESPIRATORY_PROFILE",
    "SPEECH_PROFILE",
    "ClassicalDspEngine",
    "BioAcousticEngine",
    "suppress_heart_sounds",
    "DTLNOnnxEngine",
    "EngineRegistry",
    "engine_registry",
    "process_respiratory_audio",
]

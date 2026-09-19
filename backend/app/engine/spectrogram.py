from typing import Any, Dict, List, Tuple
import numpy as np
from scipy.signal import stft


def hz_to_mel(hz: np.ndarray) -> np.ndarray:
    """Convert Hz to Mel scale."""
    return 2595.0 * np.log10(1.0 + hz / 700.0)


def mel_to_hz(mel: np.ndarray) -> np.ndarray:
    """Convert Mel scale to Hz."""
    return 700.0 * (10.0 ** (mel / 2595.0) - 1.0)


def create_mel_filterbank(
    sr: int = 16000,
    n_fft: int = 1024,
    n_mels: int = 64,
    f_min: float = 50.0,
    f_max: float = 4000.0,
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Create a triangular Mel-filterbank matrix using NumPy vectorization.

    Args:
        sr: Sample rate in Hz (default 16000).
        n_fft: FFT window size (default 1024).
        n_mels: Number of Mel frequency bins (default 64).
        f_min: Lowest frequency in Hz (default 50.0).
        f_max: Highest frequency in Hz (default 4000.0).

    Returns:
        Tuple of:
            weights: 2D array of shape (n_mels, n_fft // 2 + 1)
            mel_center_hz: 1D array of center frequencies in Hz (length n_mels)
    """
    n_freqs = n_fft // 2 + 1
    fft_freqs = np.linspace(0, sr / 2.0, n_freqs)

    mel_min = hz_to_mel(f_min)
    mel_max = hz_to_mel(f_max)
    mel_points = np.linspace(mel_min, mel_max, n_mels + 2)
    hz_points = mel_to_hz(mel_points)

    weights = np.zeros((n_mels, n_freqs), dtype=np.float32)

    for i in range(n_mels):
        f_left = hz_points[i]
        f_center = hz_points[i + 1]
        f_right = hz_points[i + 2]

        # Left triangular slope
        left_mask = (fft_freqs >= f_left) & (fft_freqs <= f_center)
        if f_center > f_left:
            weights[i, left_mask] = (fft_freqs[left_mask] - f_left) / (f_center - f_left)

        # Right triangular slope
        right_mask = (fft_freqs > f_center) & (fft_freqs <= f_right)
        if f_right > f_center:
            weights[i, right_mask] = (f_right - fft_freqs[right_mask]) / (f_right - f_center)

        # Slaney area normalization (divide by bandwidth in Hz)
        enorm = 2.0 / (f_right - f_left + 1e-12)
        weights[i] *= enorm

    mel_center_hz = hz_points[1:-1]
    return weights, mel_center_hz.astype(np.float32)


def compute_mel_spectrogram(
    audio: np.ndarray,
    sr: int = 16000,
    n_fft: int = 1024,
    hop_len: int = 512,
    n_mels: int = 64,
    f_min: float = 50.0,
    f_max: float = 4000.0,
    top_db: float = 80.0,
) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
    """
    Compute normalized decibel Mel-spectrogram from audio array.

    Args:
        audio: 1D numpy array of audio samples (float32).
        sr: Sample rate in Hz.
        n_fft: Window size for STFT.
        hop_len: Hop length in samples (512 = 32ms frames).
        n_mels: Number of Mel filter bands.
        f_min: Minimum frequency in Hz.
        f_max: Maximum frequency in Hz.
        top_db: Dynamic range cutoff in dB (default 80.0).

    Returns:
        Tuple of (mel_normalized_0_to_1, time_axis, mel_center_hz)
    """
    if len(audio) < n_fft:
        audio = np.pad(audio, (0, n_fft - len(audio)))

    frequencies, time_axis, Zxx = stft(
        audio,
        fs=sr,
        window="hann",
        nperseg=n_fft,
        noverlap=n_fft - hop_len,
    )

    power = np.abs(Zxx) ** 2
    filterbank, mel_center_hz = create_mel_filterbank(sr, n_fft, n_mels, f_min, f_max)

    # Matrix multiplication: (n_mels, n_freqs) @ (n_freqs, n_times) -> (n_mels, n_times)
    mel_power = np.dot(filterbank, power)

    # Decibel scale
    mel_db = 10.0 * np.log10(mel_power + 1e-12)

    # Normalize relative to peak
    max_db = np.max(mel_db)
    mel_clamped = np.clip(mel_db, max_db - top_db, max_db)

    # Scale strictly to [0.0, 1.0] for direct Canvas / WebGL rendering
    mel_norm = (mel_clamped - (max_db - top_db)) / top_db

    return mel_norm.astype(np.float32), time_axis.astype(np.float32), mel_center_hz


def get_spectrogram_payload(
    audio: np.ndarray,
    sr: int = 16000,
    n_mels: int = 64,
    hop_len: int = 512,
    f_min: float = 50.0,
    f_max: float = 4000.0,
) -> Dict[str, Any]:
    """
    Produce a lightweight JSON-ready dictionary for frontend visualization.
    """
    mel_norm, time_axis, mel_center_hz = compute_mel_spectrogram(
        audio,
        sr=sr,
        n_mels=n_mels,
        hop_len=hop_len,
        f_min=f_min,
        f_max=f_max,
    )

    # Round floats to 3 decimal places to reduce JSON wire size significantly (< 200KB)
    times_rounded = [round(float(t), 3) for t in time_axis]
    freqs_rounded = [round(float(f), 1) for f in mel_center_hz]
    matrix_list = [[round(float(val), 3) for val in row] for row in mel_norm]

    return {
        "time_axis": times_rounded,
        "freq_axis": freqs_rounded,
        "mel_matrix": matrix_list,
        "shape": [len(mel_center_hz), len(times_rounded)],
        "duration_sec": round(len(audio) / sr, 3),
    }

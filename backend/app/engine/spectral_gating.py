from typing import Optional, Tuple
import numpy as np
from scipy.signal import stft, istft
from scipy.ndimage import uniform_filter1d


def estimate_noise_profile(
    magnitude: np.ndarray,
    noise_mask: Optional[np.ndarray] = None,
    percentile_frames: float = 8.0,
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Estimate background noise power spectrum by identifying the quietest time intervals.
    Using broadband energy across all frequency bins avoids confusing sustained breath sounds
    (e.g. wheezes) with background noise.

    Args:
        magnitude: 2D array of STFT magnitudes (n_freqs, n_times).
        noise_mask: Optional 1D boolean array indicating noise/inactive frames.
        percentile_frames: Percentage of quietest time frames to sample for noise floor (default 8%).

    Returns:
        Tuple of (noise_power, noise_std) 1D arrays of length n_freqs.
    """
    power = magnitude**2
    n_freqs, n_times = power.shape

    if noise_mask is not None and np.sum(noise_mask) >= 2:
        noise_slice = power[:, noise_mask]
    else:
        # Sum energy across all frequencies per time frame to find true pauses
        frame_energies = np.sum(power, axis=0)
        # Select the lowest energy frames (representing ambient room/sensor noise)
        k_frames = max(2, int((percentile_frames / 100.0) * n_times))
        quiet_indices = np.argsort(frame_energies)[:k_frames]
        noise_slice = power[:, quiet_indices]

    noise_power = np.mean(noise_slice, axis=1)
    noise_std = np.std(noise_slice, axis=1) + 1e-12

    return noise_power, noise_std


def reduce_noise_spectral_gating(
    audio: np.ndarray,
    sr: int = 16000,
    n_fft: int = 1024,
    hop_len: int = 256,
    alpha: float = 2.5,
    spectral_floor: float = 0.08,
    smooth_time_frames: int = 2,
    smooth_freq_bins: int = 2,
    noise_mask: Optional[np.ndarray] = None,
) -> np.ndarray:
    """
    Adaptive Spectral Gating algorithm for respiratory audio.
    Effectively suppresses continuous ambient noise while preserving wheeze harmonics
    and crackle transient bursts with zero musical artifacts.

    Args:
        audio: 1D numpy array of audio samples (float32).
        sr: Sample rate in Hz (default 16000).
        n_fft: FFT window length (default 1024 = 64ms).
        hop_len: Hop size (default 256 = 16ms).
        alpha: Oversubtraction / suppression factor (default 2.5).
        spectral_floor: Minimum gain floor to prevent musical noise voids (default 0.08 = -22dB).
        smooth_time_frames: Window size for temporal mask smoothing (default 2 frames).
        smooth_freq_bins: Window size for frequency mask smoothing (default 2 bins).
        noise_mask: Optional boolean mask of noise regions.

    Returns:
        Denoised 1D float32 numpy array matching input length.
    """
    orig_len = len(audio)
    if orig_len < n_fft:
        return audio.astype(np.float32)

    # 1. Forward STFT
    frequencies, times, Zxx = stft(
        audio,
        fs=sr,
        window="hann",
        nperseg=n_fft,
        noverlap=n_fft - hop_len,
    )

    magnitude = np.abs(Zxx)
    power = magnitude**2

    # 2. Noise power estimation via quietest time frames
    noise_power, _ = estimate_noise_profile(magnitude, noise_mask=noise_mask)
    noise_power_matrix = noise_power[:, np.newaxis]

    # 3. Soft Wiener-like Gating Gain
    gain = power / (power + alpha * noise_power_matrix + 1e-12)
    gain = np.clip(gain, spectral_floor, 1.0)

    # 4. Smooth gain matrix along frequency and time to eliminate musical noise
    if smooth_freq_bins > 1:
        gain = uniform_filter1d(gain, size=smooth_freq_bins, axis=0)
    if smooth_time_frames > 1:
        gain = uniform_filter1d(gain, size=smooth_time_frames, axis=1)

    gain = np.clip(gain, spectral_floor, 1.0)

    # 5. Apply gain in complex domain
    Zxx_clean = Zxx * gain

    # 6. Inverse STFT
    _, clean_audio = istft(
        Zxx_clean,
        fs=sr,
        window="hann",
        nperseg=n_fft,
        noverlap=n_fft - hop_len,
    )

    # Ensure clean_audio has exact original length
    if len(clean_audio) >= orig_len:
        clean_audio = clean_audio[:orig_len]
    else:
        clean_audio = np.pad(clean_audio, (0, orig_len - len(clean_audio)))

    return clean_audio.astype(np.float32)

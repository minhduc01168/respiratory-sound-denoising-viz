import numpy as np
from scipy.signal import stft


def calculate_snr(clean_signal: np.ndarray, noisy_signal: np.ndarray) -> float:
    """
    Calculate Signal-to-Noise Ratio (SNR) in decibels (dB).

    Args:
        clean_signal: Ground truth reference 1D array.
        noisy_signal: Signal containing noise to be compared with clean.

    Returns:
        SNR in dB.
    """
    min_len = min(len(clean_signal), len(noisy_signal))
    c = clean_signal[:min_len]
    n = noisy_signal[:min_len] - c

    power_clean = np.mean(c**2)
    power_noise = np.mean(n**2) + 1e-12

    snr = 10.0 * np.log10(power_clean / power_noise)
    return float(snr)


def calculate_snr_improvement(
    clean_signal: np.ndarray,
    noisy_signal: np.ndarray,
    denoised_signal: np.ndarray,
) -> float:
    """
    Calculate Delta SNR (improvement achieved by denoising algorithm).

    Returns:
        Delta SNR in dB = SNR(denoised) - SNR(noisy)
    """
    snr_noisy = calculate_snr(clean_signal, noisy_signal)
    snr_denoised = calculate_snr(clean_signal, denoised_signal)
    return round(snr_denoised - snr_noisy, 2)


def calculate_log_spectral_distance(
    ref_signal: np.ndarray,
    test_signal: np.ndarray,
    sr: int = 16000,
    fmin: float = 100.0,
    fmax: float = 2000.0,
    n_fft: int = 1024,
    hop_len: int = 256,
) -> float:
    """
    Calculate Log-Spectral Distance (LSD) in dB to quantify spectral distortion
    within a specific clinical band of interest (e.g. 100Hz - 2000Hz for wheeze/crackle).

    LSD = sqrt( 1/K sum_{k} (10 log10( P_ref(k) / P_test(k) ))^2 )
    Values < 1.5 dB indicate pristine clinical spectral preservation.

    Args:
        ref_signal: Reference original signal.
        test_signal: Processed signal.
        sr: Sample rate in Hz.
        fmin: Minimum frequency of clinical interest in Hz.
        fmax: Maximum frequency of clinical interest in Hz.

    Returns:
        Average Log-Spectral Distance in dB.
    """
    min_len = min(len(ref_signal), len(test_signal))
    r = ref_signal[:min_len]
    t = test_signal[:min_len]

    freqs, _, Z_ref = stft(r, fs=sr, window="hann", nperseg=n_fft, noverlap=n_fft - hop_len)
    _, _, Z_test = stft(t, fs=sr, window="hann", nperseg=n_fft, noverlap=n_fft - hop_len)

    P_ref = np.abs(Z_ref) ** 2 + 1e-12
    P_test = np.abs(Z_test) ** 2 + 1e-12

    # Restrict to clinical frequency band
    band_mask = (freqs >= fmin) & (freqs <= fmax)
    if not np.any(band_mask):
        band_mask = np.ones(len(freqs), dtype=bool)

    P_ref_band = P_ref[band_mask, :]
    P_test_band = P_test[band_mask, :]

    # Log spectral difference in dB per bin
    log_diff_db = 10.0 * np.log10(P_ref_band / P_test_band)

    # RMS distance per frame, averaged across all frames
    lsd_per_frame = np.sqrt(np.mean(log_diff_db**2, axis=0))
    mean_lsd = float(np.mean(lsd_per_frame))

    return round(mean_lsd, 3)

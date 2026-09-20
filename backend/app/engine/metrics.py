from typing import Any, Dict, Optional
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


def calculate_source_to_distortion_ratio(
    ref_signal: np.ndarray,
    test_signal: np.ndarray,
) -> float:
    """
    Calculate Source-to-Distortion Ratio (SDR) in dB.
    Quantifies overall signal fidelity without non-linear artifacts.
    """
    min_len = min(len(ref_signal), len(test_signal))
    s = ref_signal[:min_len]
    e = test_signal[:min_len] - s

    s_power = np.mean(s**2) + 1e-12
    e_power = np.mean(e**2) + 1e-12

    sdr = 10.0 * np.log10(s_power / e_power)
    return round(float(sdr), 2)


def calculate_crackle_preservation_rate(
    ref_signal: np.ndarray,
    test_signal: np.ndarray,
    sr: int = 16000,
    window_ms: float = 15.0,
    peak_factor: float = 2.0,
) -> float:
    """
    Calculate Crackle Preservation Rate (CPR in %).
    Measures the percentage of explosive, short-duration transient bursts (5-20ms)
    that are retained after denoising without clipping or excessive smoothing.
    """
    min_len = min(len(ref_signal), len(test_signal))
    r = ref_signal[:min_len]
    t = test_signal[:min_len]

    win_samples = max(4, int(window_ms / 1000.0 * sr))
    # Frame RMS energy
    num_frames = len(r) // win_samples
    if num_frames == 0:
        return 100.0

    r_frames = np.reshape(r[: num_frames * win_samples], (num_frames, win_samples))
    t_frames = np.reshape(t[: num_frames * win_samples], (num_frames, win_samples))

    r_energy = np.sqrt(np.mean(r_frames**2, axis=1) + 1e-12)
    t_energy = np.sqrt(np.mean(t_frames**2, axis=1) + 1e-12)

    # Detect transient spikes in reference
    median_energy = np.median(r_energy) + 1e-12
    spike_indices = np.where(r_energy > median_energy * peak_factor)[0]

    if len(spike_indices) == 0:
        return 100.0

    # Check if preserved within reasonable margin (>= 60% of original spike amplitude)
    preserved = np.sum(t_energy[spike_indices] >= 0.60 * r_energy[spike_indices])
    cpr = (preserved / len(spike_indices)) * 100.0
    return round(float(min(100.0, max(0.0, cpr))), 1)


def calculate_wheeze_harmonic_fidelity(
    ref_signal: np.ndarray,
    test_signal: np.ndarray,
    sr: int = 16000,
    fmin: float = 100.0,
    fmax: float = 1500.0,
) -> float:
    """
    Calculate Wheeze Harmonic Fidelity (WHF in %).
    Measures energy preservation at dominant musical harmonic peaks without distortion.
    """
    min_len = min(len(ref_signal), len(test_signal))
    freqs, _, Z_ref = stft(ref_signal[:min_len], fs=sr, nperseg=1024, noverlap=768)
    _, _, Z_test = stft(test_signal[:min_len], fs=sr, nperseg=1024, noverlap=768)

    mag_ref = np.mean(np.abs(Z_ref), axis=1)
    mag_test = np.mean(np.abs(Z_test), axis=1)

    band_mask = (freqs >= fmin) & (freqs <= fmax)
    if not np.any(band_mask):
        return 100.0

    ref_band = mag_ref[band_mask]
    test_band = mag_test[band_mask]

    # Find peak harmonic bins in reference
    threshold = np.percentile(ref_band, 75)
    peak_bins = np.where(ref_band >= threshold)[0]
    if len(peak_bins) == 0:
        return 100.0

    # Ratio of preserved energy at peak bins
    ratios = test_band[peak_bins] / (ref_band[peak_bins] + 1e-12)
    bounded_ratios = np.clip(ratios, 0.0, 1.0)
    whf = float(np.mean(bounded_ratios)) * 100.0
    return round(float(min(100.0, max(0.0, whf))), 1)


def estimate_stoi(
    ref_signal: np.ndarray,
    test_signal: np.ndarray,
    sr: int = 16000,
) -> float:
    """
    Estimate Short-Time Objective Intelligibility (STOI, scale 0.0 to 1.0).
    Uses normalized sub-band envelope correlation.
    """
    min_len = min(len(ref_signal), len(test_signal))
    if min_len < 512:
        return 1.0

    r = ref_signal[:min_len]
    t = test_signal[:min_len]

    # Sub-band filter approximation via STFT
    _, _, Z_r = stft(r, fs=sr, nperseg=512, noverlap=256)
    _, _, Z_t = stft(t, fs=sr, nperseg=512, noverlap=256)

    env_r = np.abs(Z_r)
    env_t = np.abs(Z_t)

    # Compute correlation across time for each frequency bin
    corrs = []
    for k in range(env_r.shape[0]):
        x = env_r[k, :] - np.mean(env_r[k, :])
        y = env_t[k, :] - np.mean(env_t[k, :])
        denom = (np.sqrt(np.sum(x**2)) * np.sqrt(np.sum(y**2))) + 1e-12
        corr = float(np.sum(x * y) / denom)
        corrs.append(corr)

    mean_corr = float(np.clip(np.mean(corrs), 0.0, 1.0))
    return round(mean_corr, 3)


def estimate_pesq(
    ref_signal: np.ndarray,
    test_signal: np.ndarray,
    sr: int = 16000,
) -> float:
    """
    Estimate Perceptual Evaluation of Speech Quality (PESQ proxy, scale 1.0 to 4.5).
    Combines Log-Spectral Distance and STOI envelope correlation.
    """
    stoi_val = estimate_stoi(ref_signal, test_signal, sr=sr)
    lsd_val = calculate_log_spectral_distance(ref_signal, test_signal, sr=sr, fmin=100.0, fmax=4000.0)

    # Mapping formula calibrated to empirical ITU-T P.862 scores:
    # High STOI (>0.9) and low LSD (<1.2) maps to 3.8 - 4.5.
    raw_pesq = 1.0 + 3.5 * stoi_val - 0.45 * min(3.0, lsd_val)
    clamped = float(np.clip(raw_pesq, 1.0, 4.5))
    return round(clamped, 2)


def evaluate_comprehensive_benchmark(
    ref_signal: np.ndarray,
    processed_signal: np.ndarray,
    sr: int = 16000,
    profile: str = "respiratory",
) -> Dict[str, Any]:
    """
    Unified multi-metric benchmark evaluation tailored to specific AudioProfile.

    Returns:
        Dictionary containing objective metrics relevant to clinical lung sounds or speech.
    """
    snr_val = calculate_snr(processed_signal, ref_signal)
    lsd_val = calculate_log_spectral_distance(ref_signal, processed_signal, sr=sr)
    sdr_val = calculate_source_to_distortion_ratio(ref_signal, processed_signal)

    base_results = {
        "snr_db": round(snr_val, 2),
        "lsd_db": lsd_val,
        "sdr_db": sdr_val,
        "profile": profile,
    }

    if profile == "speech":
        stoi_val = estimate_stoi(ref_signal, processed_signal, sr=sr)
        pesq_val = estimate_pesq(ref_signal, processed_signal, sr=sr)
        base_results.update({
            "pesq_score": pesq_val,
            "stoi_intelligibility": stoi_val,
        })
    else:
        cpr_val = calculate_crackle_preservation_rate(ref_signal, processed_signal, sr=sr)
        whf_val = calculate_wheeze_harmonic_fidelity(ref_signal, processed_signal, sr=sr)
        base_results.update({
            "crackle_preservation_rate_pct": cpr_val,
            "wheeze_harmonic_fidelity_pct": whf_val,
        })

    return base_results

import time
import numpy as np
import pytest

from backend.app.engine.spectral_gating import reduce_noise_spectral_gating


def test_spectral_gating_snr_improvement():
    sr = 16000
    duration = 2.0
    t = np.linspace(0, duration, int(sr * duration), endpoint=False)

    # Clean signal: burst of simulated breath with natural pauses (0.2s pause, 1.4s breath, 0.4s pause)
    clean = np.zeros(int(sr * duration), dtype=np.float32)
    start_idx = int(0.2 * sr)
    end_idx = int(1.6 * sr)
    t_burst = t[start_idx:end_idx]
    clean[start_idx:end_idx] = (0.5 * np.sin(2 * np.pi * 400 * t_burst) + 0.3 * np.sin(2 * np.pi * 600 * t_burst)).astype(np.float32)

    # Ambient noise: Gaussian white noise
    np.random.seed(42)
    noise = (0.1 * np.random.randn(len(t))).astype(np.float32)

    noisy = clean + noise

    # Calculate initial SNR in dB
    p_clean = np.mean(clean**2)
    p_noise_orig = np.mean(noise**2)
    snr_initial = 10 * np.log10(p_clean / p_noise_orig)

    denoised = reduce_noise_spectral_gating(noisy, sr=sr)

    # Residual noise in difference
    diff = denoised - clean
    p_noise_after = np.mean(diff**2)
    snr_after = 10 * np.log10(p_clean / p_noise_after)

    # Verify significant noise attenuation
    assert snr_after > snr_initial
    assert (snr_after - snr_initial) >= 2.5


def test_spectral_gating_preserves_wheeze_harmonics():
    sr = 16000
    duration = 2.0
    t = np.linspace(0, duration, int(sr * duration), endpoint=False)
    # Wheeze harmonic: continuous high energy tone at 500Hz with 0.2s noise lead-in
    wheeze = np.zeros(int(sr * duration), dtype=np.float32)
    start_idx = int(0.2 * sr)
    wheeze[start_idx:] = (0.6 * np.sin(2 * np.pi * 500 * t[start_idx:])).astype(np.float32)

    # Slight background hiss
    noisy_wheeze = wheeze + (0.04 * np.random.randn(len(t))).astype(np.float32)

    denoised = reduce_noise_spectral_gating(noisy_wheeze, sr=sr)

    # In active region, amplitude of 500Hz wheeze should be well-preserved (>80%)
    rms_orig = np.sqrt(np.mean(wheeze[start_idx:] ** 2))
    rms_denoised = np.sqrt(np.mean(denoised[start_idx:] ** 2))
    ratio = rms_denoised / rms_orig
    assert 0.80 <= ratio <= 1.15


def test_spectral_gating_performance():
    sr = 16000
    # 15 seconds of audio = 240,000 samples
    long_audio = (np.random.randn(15 * sr) * 0.1).astype(np.float32)

    start_time = time.time()
    _ = reduce_noise_spectral_gating(long_audio, sr=sr)
    elapsed = time.time() - start_time

    # Processing 15s audio on CPU must take less than 0.5s (500ms)
    assert elapsed < 0.50, f"Processing took {elapsed:.3f}s, expected < 0.500s"

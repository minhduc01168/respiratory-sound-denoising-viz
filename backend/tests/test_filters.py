import numpy as np
import pytest
from scipy.signal import correlate

from backend.app.engine.filters import apply_bandpass_filter


def test_bandpass_frequency_attenuation():
    sr = 16000
    duration = 1.0
    t = np.linspace(0, duration, int(sr * duration), endpoint=False)

    # Low frequency out-of-band: 20 Hz
    sig_low = np.sin(2 * np.pi * 20 * t)
    # Passband center: 500 Hz
    sig_pass = np.sin(2 * np.pi * 500 * t)
    # High frequency out-of-band: 6000 Hz
    sig_high = np.sin(2 * np.pi * 6000 * t)

    filtered_low = apply_bandpass_filter(sig_low, lowcut=50, highcut=4000, sr=sr)
    filtered_pass = apply_bandpass_filter(sig_pass, lowcut=50, highcut=4000, sr=sr)
    filtered_high = apply_bandpass_filter(sig_high, lowcut=50, highcut=4000, sr=sr)

    rms_orig = np.sqrt(np.mean(sig_pass**2))
    rms_pass = np.sqrt(np.mean(filtered_pass[1000:-1000] ** 2))
    rms_low = np.sqrt(np.mean(filtered_low[1000:-1000] ** 2))
    rms_high = np.sqrt(np.mean(filtered_high[1000:-1000] ** 2))

    # 500Hz should pass with minimal attenuation (>95% power preserved)
    assert rms_pass / rms_orig > 0.95

    # 20Hz and 6000Hz should be heavily attenuated (<10% power remaining)
    assert rms_low / rms_orig < 0.10
    assert rms_high / rms_orig < 0.10


def test_zero_phase_no_delay():
    sr = 16000
    t = np.linspace(0, 0.5, int(sr * 0.5), endpoint=False)
    sig = np.sin(2 * np.pi * 300 * t)

    filtered = apply_bandpass_filter(sig, lowcut=50, highcut=4000, sr=sr)

    # Cross-correlation between original and filtered should have peak exactly at lag 0
    corr = correlate(sig, filtered, mode="full")
    lag = np.argmax(corr) - (len(sig) - 1)
    assert lag == 0


def test_short_signal_safety():
    # Signal shorter than default padlen
    short_sig = np.array([0.1, -0.2, 0.3, -0.1, 0.05], dtype=np.float32)
    filtered = apply_bandpass_filter(short_sig, lowcut=50, highcut=4000, sr=16000)
    assert len(filtered) == len(short_sig)
    assert not np.isnan(filtered).any()

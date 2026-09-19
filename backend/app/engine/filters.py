import numpy as np
from scipy.signal import butter, sosfiltfilt


def butter_bandpass_sos(
    lowcut: float = 50.0,
    highcut: float = 4000.0,
    sr: int = 16000,
    order: int = 4,
) -> np.ndarray:
    """
    Design a Butterworth bandpass filter represented in Second-Order Sections (SOS).
    SOS format offers superior numerical stability over transfer function (b, a).

    Args:
        lowcut: Lower cutoff frequency in Hz.
        highcut: Upper cutoff frequency in Hz.
        sr: Sampling rate in Hz.
        order: Filter order (default 4).

    Returns:
        Second-order sections representation of the IIR filter.
    """
    nyquist = 0.5 * sr
    low = lowcut / nyquist
    high = highcut / nyquist
    # Ensure cutoff frequencies stay strictly within (0, 1)
    low = max(1e-4, min(low, 0.99))
    high = max(low + 1e-4, min(high, 0.999))

    sos = butter(order, [low, high], btype="bandpass", output="sos")
    return sos


def apply_bandpass_filter(
    audio: np.ndarray,
    lowcut: float = 50.0,
    highcut: float = 4000.0,
    sr: int = 16000,
    order: int = 4,
) -> np.ndarray:
    """
    Apply zero-phase Butterworth bandpass filter using forward-backward filtering (sosfiltfilt).
    This guarantees zero phase distortion, preserving temporal peak locations of breath sounds.

    Args:
        audio: 1D numpy array of audio samples.
        lowcut: Lower cutoff frequency (default 50 Hz).
        highcut: Upper cutoff frequency (default 4000 Hz).
        sr: Sampling rate (default 16000 Hz).
        order: Filter order (default 4).

    Returns:
        Filtered 1D numpy array float32.
    """
    if len(audio) == 0:
        return audio.astype(np.float32)

    sos = butter_bandpass_sos(lowcut, highcut, sr, order)

    # sosfiltfilt requires padlen. If signal is shorter than default padlen, adjust padlen.
    # Default padlen for sosfiltfilt is roughly 3 * (2 * order + 1)
    min_pad = 3 * (2 * order + 1)
    if len(audio) <= min_pad:
        padlen = max(0, len(audio) - 1)
        filtered = sosfiltfilt(sos, audio, padlen=padlen)
    else:
        filtered = sosfiltfilt(sos, audio)

    return filtered.astype(np.float32)

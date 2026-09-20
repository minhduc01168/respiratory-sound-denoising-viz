import io
import math
from typing import Tuple, Union
import numpy as np
import soundfile as sf
from scipy.signal import resample_poly


def load_and_resample_audio(
    source: Union[str, bytes, io.BytesIO],
    target_sr: int = 16000,
) -> Tuple[np.ndarray, int]:
    """
    Load audio from a file path, bytes, or BytesIO object, convert to mono,
    resample to target_sr, and return float32 numpy array.

    Args:
        source: File path, raw bytes, or BytesIO buffer.
        target_sr: Target sample rate (default 16000 Hz).

    Returns:
        Tuple of (audio_array: np.ndarray 1D float32, sr: int)
    """
    if isinstance(source, np.ndarray):
        arr = source.astype(np.float32)
        if arr.ndim > 1:
            arr = np.mean(arr, axis=1)
        return arr, target_sr

    if isinstance(source, bytes):
        source = io.BytesIO(source)

    data, orig_sr = sf.read(source, dtype="float32", always_2d=True)

    # Convert to mono by averaging channels if multiple channels exist
    if data.shape[1] > 1:
        data = np.mean(data, axis=1)
    else:
        data = data[:, 0]

    # Resample if sample rate doesn't match target_sr
    if orig_sr != target_sr:
        gcd = math.gcd(orig_sr, target_sr)
        up = target_sr // gcd
        down = orig_sr // gcd
        data = resample_poly(data, up, down).astype(np.float32)

    return data, target_sr


def normalize_audio(audio: np.ndarray, target_peak: float = 0.95) -> np.ndarray:
    """
    Safely normalize peak amplitude of an audio signal to target_peak.
    Prevents division by zero for silent/near-silent signals.

    Args:
        audio: 1D numpy array of audio samples.
        target_peak: Target maximum absolute amplitude (default 0.95).

    Returns:
        Normalized 1D numpy array float32.
    """
    if len(audio) == 0:
        return audio

    max_val = np.max(np.abs(audio))
    if max_val > 1e-6:
        normalized = (audio / max_val) * target_peak
        return normalized.astype(np.float32)
    return audio.astype(np.float32)


def save_wav(output_path: str, audio: np.ndarray, sr: int = 16000) -> None:
    """
    Save 1D float32 audio to a standard 16-bit PCM mono WAV file.

    Args:
        output_path: Path to destination .wav file.
        audio: 1D numpy array of audio samples.
        sr: Sample rate (default 16000 Hz).
    """
    # Clip to prevent overflow distortion when converting to PCM_16
    clipped = np.clip(audio, -1.0, 1.0)
    sf.write(output_path, clipped, sr, subtype="PCM_16")

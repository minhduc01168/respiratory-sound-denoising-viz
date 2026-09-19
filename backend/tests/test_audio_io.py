import io
import os
import tempfile
import numpy as np
import soundfile as sf
import pytest

from backend.app.engine.audio_io import load_and_resample_audio, normalize_audio, save_wav


def test_load_and_resample_from_bytes():
    # Create 1 second of synthetic 44.1kHz stereo audio (440Hz sine wave)
    sr_orig = 44100
    t = np.linspace(0, 1.0, sr_orig, endpoint=False)
    sine = 0.5 * np.sin(2 * np.pi * 440 * t)
    stereo = np.stack([sine, sine], axis=1).astype(np.float32)

    buf = io.BytesIO()
    sf.write(buf, stereo, sr_orig, format="WAV")
    wav_bytes = buf.getvalue()

    # Load and resample to 16kHz
    audio_out, sr_out = load_and_resample_audio(wav_bytes, target_sr=16000)

    assert sr_out == 16000
    assert audio_out.ndim == 1  # Converted to mono
    assert len(audio_out) == 16000
    assert audio_out.dtype == np.float32


def test_normalize_audio():
    # Test normal signal
    signal = np.array([-0.2, 0.4, -0.1, 0.5], dtype=np.float32)
    norm = normalize_audio(signal, target_peak=0.95)
    assert np.isclose(np.max(np.abs(norm)), 0.95)

    # Test silent signal (no crash / no NaN)
    silent = np.zeros(100, dtype=np.float32)
    norm_silent = normalize_audio(silent, target_peak=0.95)
    assert np.all(norm_silent == 0.0)
    assert not np.isnan(norm_silent).any()


def test_save_wav_and_read_back():
    audio = np.sin(np.linspace(0, 10, 16000, dtype=np.float32))
    with tempfile.TemporaryDirectory() as tmpdir:
        tmp_path = os.path.join(tmpdir, "test_output.wav")
        save_wav(tmp_path, audio, sr=16000)

        info = sf.info(tmp_path)
        assert info.samplerate == 16000
        assert info.channels == 1
        assert info.subtype == "PCM_16"
        assert info.frames == 16000

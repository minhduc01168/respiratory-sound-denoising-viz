import json
import numpy as np
import pytest

from backend.app.engine.spectrogram import (
    create_mel_filterbank,
    compute_mel_spectrogram,
    get_spectrogram_payload,
)


def test_create_mel_filterbank_shape():
    sr = 16000
    n_fft = 1024
    n_mels = 64
    f_min = 50.0
    f_max = 4000.0

    weights, center_hz = create_mel_filterbank(sr, n_fft, n_mels, f_min, f_max)

    assert weights.shape == (n_mels, n_fft // 2 + 1)
    assert len(center_hz) == n_mels
    assert center_hz[0] >= f_min
    assert center_hz[-1] <= f_max
    # Each filter should have non-negative weights
    assert np.all(weights >= 0)


def test_compute_mel_spectrogram_values():
    sr = 16000
    duration = 1.0
    t = np.linspace(0, duration, int(sr * duration), endpoint=False)
    # 500Hz sine wave (wheeze)
    audio = (0.5 * np.sin(2 * np.pi * 500 * t)).astype(np.float32)

    mel_norm, time_axis, center_hz = compute_mel_spectrogram(audio, sr=sr, n_mels=64)

    # Output normalized to [0.0, 1.0]
    assert np.min(mel_norm) >= 0.0
    assert np.max(mel_norm) <= 1.0
    assert not np.isnan(mel_norm).any()
    assert not np.isinf(mel_norm).any()

    # Peak energy should be near 500Hz center frequency bin
    peak_mel_idx = np.argmax(np.mean(mel_norm, axis=1))
    peak_freq = center_hz[peak_mel_idx]
    assert abs(peak_freq - 500.0) < 100.0  # Center bin close to 500Hz


def test_get_spectrogram_payload_size():
    sr = 16000
    duration = 15.0  # 15s audio
    audio = (np.random.randn(int(sr * duration)) * 0.1).astype(np.float32)

    payload = get_spectrogram_payload(audio, sr=sr, n_mels=64, hop_len=512)

    assert "time_axis" in payload
    assert "freq_axis" in payload
    assert "mel_matrix" in payload
    assert payload["shape"] == [64, len(payload["time_axis"])]
    assert payload["duration_sec"] == 15.0

    # Ensure JSON serialized payload is lightweight (< 350KB for 15s)
    json_str = json.dumps(payload)
    size_kb = len(json_str.encode("utf-8")) / 1024.0
    assert size_kb < 350.0, f"Payload size {size_kb:.1f}KB exceeds 350KB"

import io
import numpy as np
import soundfile as sf
import pytest
from fastapi.testclient import TestClient

from backend.app.main import app

client = TestClient(app)


@pytest.fixture
def setup_processed_audio():
    """Upload and process a synthetic respiratory sound for streaming tests."""
    sr = 16000
    duration = 3.0
    t = np.linspace(0, duration, int(sr * duration), endpoint=False)
    audio = (0.5 * np.sin(2 * np.pi * 400 * t) + 0.05 * np.random.randn(len(t))).astype(np.float32)

    buf = io.BytesIO()
    sf.write(buf, audio, sr, format="WAV")
    buf.seek(0)

    upload_res = client.post(
        "/api/audio/upload",
        files={"file": ("test_stream.wav", buf, "audio/wav")},
    )
    assert upload_res.status_code == 201
    audio_id = upload_res.json()["audio_id"]

    process_res = client.post(f"/api/audio/process/{audio_id}")
    assert process_res.status_code == 200

    return audio_id


def test_get_spectrogram_cleaned_and_raw(setup_processed_audio):
    audio_id = setup_processed_audio

    # Test cleaned spectrogram
    res_clean = client.get(f"/api/audio/spectrogram/{audio_id}?target=cleaned")
    assert res_clean.status_code == 200
    data_clean = res_clean.json()
    assert "mel_matrix" in data_clean
    assert "time_axis" in data_clean
    assert "freq_axis" in data_clean
    assert len(data_clean["mel_matrix"]) == 64
    assert len(data_clean["freq_axis"]) == 64
    assert len(data_clean["time_axis"]) > 0

    # Test raw spectrogram
    res_raw = client.get(f"/api/audio/spectrogram/{audio_id}?target=raw")
    assert res_raw.status_code == 200
    data_raw = res_raw.json()
    assert len(data_raw["mel_matrix"]) == 64


def test_get_spectrogram_nonexistent():
    res = client.get("/api/audio/spectrogram/rec_unknown_streaming?target=cleaned")
    assert res.status_code == 404
    assert "chưa sẵn sàng hoặc không tồn tại" in res.json()["detail"]


def test_stream_audio_endpoints(setup_processed_audio):
    audio_id = setup_processed_audio

    # Stream cleaned audio
    res_clean = client.get(f"/api/audio/stream/{audio_id}/cleaned")
    assert res_clean.status_code == 200
    assert "audio/wav" in res_clean.headers.get("content-type", "")
    assert len(res_clean.content) > 1000

    # Stream raw audio
    res_raw = client.get(f"/api/audio/stream/{audio_id}/raw")
    assert res_raw.status_code == 200
    assert "audio/wav" in res_raw.headers.get("content-type", "")
    assert len(res_raw.content) > 1000


def test_stream_audio_invalid_type(setup_processed_audio):
    audio_id = setup_processed_audio
    res = client.get(f"/api/audio/stream/{audio_id}/invalid_type")
    assert res.status_code == 400
    assert "Chỉ chấp nhận 'raw' hoặc 'cleaned'" in res.json()["detail"]


def test_stream_audio_nonexistent():
    res = client.get("/api/audio/stream/rec_unknown_id/cleaned")
    assert res.status_code == 404
    assert "Không tìm thấy" in res.json()["detail"]

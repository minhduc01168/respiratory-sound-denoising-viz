import io
import numpy as np
import soundfile as sf
import pytest
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.core.config import settings

client = TestClient(app)


def test_process_audio_success():
    # 1. First upload a test file
    sr = 16000
    duration = 4.0
    t = np.linspace(0, duration, int(sr * duration), endpoint=False)
    # 500Hz simulated wheeze + background noise
    audio = (0.4 * np.sin(2 * np.pi * 500 * t) + 0.05 * np.random.randn(len(t))).astype(np.float32)

    buf = io.BytesIO()
    sf.write(buf, audio, sr, format="WAV")
    buf.seek(0)

    upload_res = client.post(
        "/api/audio/upload",
        files={"file": ("test_wheeze.wav", buf, "audio/wav")},
    )
    assert upload_res.status_code == 201
    audio_id = upload_res.json()["audio_id"]

    # 2. Process audio
    process_res = client.post(f"/api/audio/process/{audio_id}")
    assert process_res.status_code == 200
    data = process_res.json()

    assert data["audio_id"] == audio_id
    assert "metrics" in data
    assert data["metrics"]["latency_ms"] < 1200.0  # Under 1.2s
    assert "spectrogram" in data
    assert len(data["spectrogram"]["mel_matrix"]) == 64
    assert data["cleaned_stream_url"] == f"/api/audio/stream/{audio_id}/cleaned"

    # Verify cleaned file created on disk
    clean_file = settings.CLEANED_DIR / f"{audio_id}_clean.wav"
    assert clean_file.exists()


def test_process_nonexistent_audio():
    response = client.post("/api/audio/process/rec_unknown_999")
    assert response.status_code == 404
    assert "Không tìm thấy" in response.json()["detail"]

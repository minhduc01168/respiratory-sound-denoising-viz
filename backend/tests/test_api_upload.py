import io
import numpy as np
import soundfile as sf
import pytest
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.core.config import settings

client = TestClient(app)


def test_upload_valid_wav():
    sr = 16000
    audio = (0.5 * np.sin(np.linspace(0, 50, 3 * sr))).astype(np.float32)
    buf = io.BytesIO()
    sf.write(buf, audio, sr, format="WAV")
    buf.seek(0)

    response = client.post(
        "/api/audio/upload",
        files={"file": ("patient_breath.wav", buf, "audio/wav")},
    )

    assert response.status_code == 201
    data = response.json()
    assert "audio_id" in data
    assert data["filename"] == "patient_breath.wav"
    assert data["sample_rate"] == 16000
    assert abs(data["duration_sec"] - 3.0) < 0.1

    # Verify saved on disk
    saved_file = settings.RAW_DIR / f"{data['audio_id']}.wav"
    assert saved_file.exists()


def test_upload_invalid_extension():
    buf = io.BytesIO(b"dummy text file content")
    response = client.post(
        "/api/audio/upload",
        files={"file": ("notes.txt", buf, "text/plain")},
    )
    assert response.status_code == 400
    assert "Định dạng tệp" in response.json()["detail"]


def test_upload_empty_file():
    buf = io.BytesIO(b"")
    response = client.post(
        "/api/audio/upload",
        files={"file": ("empty.wav", buf, "audio/wav")},
    )
    assert response.status_code == 400

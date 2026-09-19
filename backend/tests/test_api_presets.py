import pytest
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.core.config import settings

client = TestClient(app)


def test_get_clinical_presets():
    res = client.get("/api/audio/presets")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) == 4

    preset_ids = [p["id"] for p in data]
    assert "preset_normal" in preset_ids
    assert "preset_wheeze" in preset_ids
    assert "preset_crackle" in preset_ids
    assert "preset_cough" in preset_ids

    # Check first item schema
    wheeze = next(p for p in data if p["id"] == "preset_wheeze")
    assert wheeze["disease_group"] == "Hen phế quản / COPD"
    assert wheeze["tag"] == "Wheeze"
    assert "raw_stream_url" in wheeze

    # Check files created on disk
    for pid in preset_ids:
        wav_file = settings.PRESETS_DIR / f"{pid}.wav"
        assert wav_file.exists()


def test_process_preset_audio():
    # Calling process on preset_wheeze
    res = client.post("/api/audio/process/preset_wheeze")
    assert res.status_code == 200
    data = res.json()
    assert data["audio_id"] == "preset_wheeze"
    assert "metrics" in data
    assert data["metrics"]["snr_delta"] >= 0.0
    assert "spectrogram" in data


def test_stream_preset_audio():
    res = client.get("/api/audio/stream/preset_wheeze/raw")
    assert res.status_code == 200
    assert "audio/wav" in res.headers.get("content-type", "")
    assert len(res.content) > 1000

import io
import numpy as np
import soundfile as sf
import pytest
from fastapi.testclient import TestClient

from backend.app.main import app

client = TestClient(app)


@pytest.fixture
def test_audio_record():
    sr = 16000
    duration = 4.0
    t = np.linspace(0, duration, int(sr * duration), endpoint=False)
    audio = (0.5 * np.sin(2 * np.pi * 500 * t)).astype(np.float32)

    buf = io.BytesIO()
    sf.write(buf, audio, sr, format="WAV")
    buf.seek(0)

    upload_res = client.post(
        "/api/audio/upload",
        files={"file": ("test_annotation_sound.wav", buf, "audio/wav")},
    )
    assert upload_res.status_code == 201
    return upload_res.json()["audio_id"]


def test_create_annotation_success(test_audio_record):
    audio_id = test_audio_record

    payload = {
        "audio_id": audio_id,
        "start_time": 1.2,
        "end_time": 2.5,
        "tag": "Wheeze",
        "clinical_note": "Tiếng rít thì thở ra, âm sắc cao",
        "doctor_name": "BS. Nguyễn Văn A",
    }
    res = client.post("/api/annotations", json=payload)
    assert res.status_code == 201
    data = res.json()
    assert data["audio_id"] == audio_id
    assert data["start_time"] == 1.2
    assert data["end_time"] == 2.5
    assert data["tag"] == "Wheeze"
    assert data["doctor_name"] == "BS. Nguyễn Văn A"
    assert "id" in data
    assert "created_at" in data


def test_create_annotation_invalid_times(test_audio_record):
    audio_id = test_audio_record

    # Negative start time
    res = client.post(
        "/api/annotations",
        json={
            "audio_id": audio_id,
            "start_time": -0.5,
            "end_time": 2.0,
            "tag": "Crackle",
        },
    )
    assert res.status_code == 400
    assert "không thể là số âm" in res.json()["detail"]

    # End time <= Start time
    res2 = client.post(
        "/api/annotations",
        json={
            "audio_id": audio_id,
            "start_time": 3.0,
            "end_time": 2.5,
            "tag": "Crackle",
        },
    )
    assert res2.status_code == 400
    assert "lớn hơn thời gian bắt đầu" in res2.json()["detail"]


def test_create_annotation_nonexistent_audio():
    res = client.post(
        "/api/annotations",
        json={
            "audio_id": "rec_ghost_99999",
            "start_time": 1.0,
            "end_time": 2.0,
            "tag": "Wheeze",
        },
    )
    assert res.status_code == 404
    assert "không tồn tại trong hệ thống" in res.json()["detail"]


def test_list_and_delete_annotations(test_audio_record):
    audio_id = test_audio_record

    # Create 2 annotations
    client.post(
        "/api/annotations",
        json={
            "audio_id": audio_id,
            "start_time": 2.0,
            "end_time": 3.0,
            "tag": "Crackle",
            "clinical_note": "Ran nổ đáy phổi",
        },
    )
    client.post(
        "/api/annotations",
        json={
            "audio_id": audio_id,
            "start_time": 0.5,
            "end_time": 1.5,
            "tag": "Wheeze",
            "clinical_note": "Ran rít lan tỏa",
        },
    )

    # Get annotations list
    list_res = client.get(f"/api/annotations/{audio_id}")
    assert list_res.status_code == 200
    items = list_res.json()
    assert len(items) >= 2
    # Check ordering by start_time
    assert items[0]["start_time"] <= items[1]["start_time"]

    # Delete first annotation
    del_id = items[0]["id"]
    del_res = client.delete(f"/api/annotations/{del_id}")
    assert del_res.status_code == 200
    assert del_res.json()["status"] == "deleted"

    # Delete again should be 404
    del_res_again = client.delete(f"/api/annotations/{del_id}")
    assert del_res_again.status_code == 404

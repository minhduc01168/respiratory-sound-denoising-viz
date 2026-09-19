import io
import numpy as np
import soundfile as sf
import pytest
from fastapi.testclient import TestClient

from backend.app.main import app

client = TestClient(app)


def test_e2e_full_patient_clinical_journey():
    """
    End-to-End Test Suite:
    1. Upload synthetic clinic recording (500Hz Wheeze + noise)
    2. Process audio with DSP pipeline
    3. Retrieve 64-band Mel-spectrogram Decibel payload
    4. Stream both raw and cleaned audio streams
    5. Add two medical annotations (Wheeze & Crackle)
    6. Verify annotations persistence and ordering
    7. Delete one annotation and ensure remaining is intact
    """
    # Step 1: Upload
    sr = 16000
    duration = 4.0
    t = np.linspace(0, duration, int(sr * duration), endpoint=False)
    # Wheeze musical tone + room noise
    audio = (0.45 * np.sin(2 * np.pi * 520 * t) + 0.05 * np.random.randn(len(t))).astype(np.float32)

    buf = io.BytesIO()
    sf.write(buf, audio, sr, format="WAV")
    buf.seek(0)

    upload_res = client.post(
        "/api/audio/upload",
        files={"file": ("e2e_patient_recording.wav", buf, "audio/wav")},
    )
    assert upload_res.status_code == 201
    upload_data = upload_res.json()
    audio_id = upload_data["audio_id"]
    assert audio_id.startswith("rec_")
    assert upload_data["duration_sec"] > 3.9

    # Step 2: Process DSP
    process_res = client.post(f"/api/audio/process/{audio_id}")
    assert process_res.status_code == 200
    process_data = process_res.json()
    assert process_data["audio_id"] == audio_id
    assert "metrics" in process_data
    assert process_data["metrics"]["snr_delta"] >= 0.0
    assert process_data["metrics"]["latency_ms"] < 1200.0

    # Step 3: Mel-Spectrogram
    spec_res = client.get(f"/api/audio/spectrogram/{audio_id}?target=cleaned")
    assert spec_res.status_code == 200
    spec_data = spec_res.json()
    assert "mel_matrix" in spec_data
    assert len(spec_data["mel_matrix"]) == 64
    assert len(spec_data["time_axis"]) > 0

    # Step 4: Stream Audio
    stream_clean = client.get(f"/api/audio/stream/{audio_id}/cleaned")
    assert stream_clean.status_code == 200
    assert "audio/wav" in stream_clean.headers.get("content-type", "")
    assert len(stream_clean.content) > 1000

    stream_raw = client.get(f"/api/audio/stream/{audio_id}/raw")
    assert stream_raw.status_code == 200
    assert "audio/wav" in stream_raw.headers.get("content-type", "")

    # Step 5: Add Annotations
    ann1 = client.post(
        "/api/annotations",
        json={
            "audio_id": audio_id,
            "start_time": 1.5,
            "end_time": 2.8,
            "tag": "Wheeze",
            "clinical_note": "Ran rít phế quản thì thở ra",
            "doctor_name": "BS. Nguyễn Văn A",
        },
    )
    assert ann1.status_code == 201
    ann1_id = ann1.json()["id"]

    ann2 = client.post(
        "/api/annotations",
        json={
            "audio_id": audio_id,
            "start_time": 0.5,
            "end_time": 1.2,
            "tag": "Crackle",
            "clinical_note": "Ran nổ thô rải rác",
            "doctor_name": "BS. Nguyễn Văn A",
        },
    )
    assert ann2.status_code == 201
    ann2_id = ann2.json()["id"]

    # Step 6: Verify Annotations list
    list_res = client.get(f"/api/annotations/{audio_id}")
    assert list_res.status_code == 200
    ann_list = list_res.json()
    assert len(ann_list) == 2
    # Verify ordering by start_time: 0.5s before 1.5s
    assert ann_list[0]["start_time"] == 0.5
    assert ann_list[1]["start_time"] == 1.5

    # Step 7: Delete Annotation
    del_res = client.delete(f"/api/annotations/{ann1_id}")
    assert del_res.status_code == 200

    # Verify only 1 remaining
    list_after = client.get(f"/api/annotations/{audio_id}").json()
    assert len(list_after) == 1
    assert list_after[0]["id"] == ann2_id


def test_e2e_preset_evaluation_journey():
    """
    End-to-End Test for Clinical Presets:
    1. Fetch list of 4 presets
    2. Process 'preset_wheeze'
    3. Fetch its Mel-spectrogram
    4. Stream both raw & cleaned audio
    5. Add doctor annotation on preset
    """
    # 1. Presets list
    presets_res = client.get("/api/audio/presets")
    assert presets_res.status_code == 200
    presets = presets_res.json()
    assert len(presets) == 4

    target_preset = next(p for p in presets if p["id"] == "preset_wheeze")
    pid = target_preset["id"]

    # 2. Process
    proc_res = client.post(f"/api/audio/process/{pid}")
    assert proc_res.status_code == 200
    assert proc_res.json()["audio_id"] == pid

    # 3. Spectrogram
    spec_res = client.get(f"/api/audio/spectrogram/{pid}?target=cleaned")
    assert spec_res.status_code == 200
    assert len(spec_res.json()["mel_matrix"]) == 64

    # 4. Streams
    assert client.get(f"/api/audio/stream/{pid}/raw").status_code == 200
    assert client.get(f"/api/audio/stream/{pid}/cleaned").status_code == 200

    # 5. Annotation on Preset
    ann_res = client.post(
        "/api/annotations",
        json={
            "audio_id": pid,
            "start_time": 2.0,
            "end_time": 3.8,
            "tag": "Wheeze",
            "clinical_note": "Hen phế quản co thắt điển hình",
        },
    )
    assert ann_res.status_code == 201
    assert ann_res.json()["audio_id"] == pid

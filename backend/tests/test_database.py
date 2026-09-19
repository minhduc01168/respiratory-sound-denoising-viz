import tempfile
from pathlib import Path
import pytest

from backend.app.core.database import (
    init_db,
    create_audio_record,
    get_audio_record,
    list_audio_records,
    delete_audio_record,
    create_annotation,
    list_annotations,
    delete_annotation,
)


@pytest.fixture
def temp_db():
    with tempfile.TemporaryDirectory() as tmpdir:
        db_path = Path(tmpdir) / "test_meta.db"
        init_db(db_path)
        yield db_path


def test_audio_record_crud(temp_db):
    data = {
        "id": "rec-001",
        "filename": "patient_01.wav",
        "duration_original": 15.0,
        "duration_processed": 13.5,
        "sample_rate": 16000,
        "snr_original": 5.2,
        "snr_processed": 16.8,
        "snr_delta": 11.6,
        "silence_trimmed_sec": 1.5,
        "raw_path": "/storage/raw/patient_01.wav",
        "cleaned_path": "/storage/cleaned/patient_01.wav",
    }

    record = create_audio_record(data, db_path=temp_db)
    assert record["id"] == "rec-001"
    assert record["snr_delta"] == 11.6

    fetched = get_audio_record("rec-001", db_path=temp_db)
    assert fetched is not None
    assert fetched["filename"] == "patient_01.wav"

    all_records = list_audio_records(db_path=temp_db)
    assert len(all_records) == 1


def test_annotation_crud_and_cascade_delete(temp_db):
    # First create parent audio record
    create_audio_record(
        {
            "id": "rec-002",
            "filename": "copd_wheeze.wav",
            "duration_original": 10.0,
            "duration_processed": 10.0,
            "raw_path": "/raw.wav",
            "cleaned_path": "/clean.wav",
        },
        db_path=temp_db,
    )

    # Create 2 annotations
    ann1 = create_annotation(
        {
            "audio_id": "rec-002",
            "start_time": 2.5,
            "end_time": 4.0,
            "tag": "Wheeze",
            "clinical_note": "Tiếng rít thì thở ra",
            "doctor_name": "Dr. Tony",
        },
        db_path=temp_db,
    )
    ann2 = create_annotation(
        {
            "audio_id": "rec-002",
            "start_time": 6.0,
            "end_time": 6.2,
            "tag": "Crackle",
            "clinical_note": "Ran ẩm rải rác",
            "doctor_name": "Dr. Tony",
        },
        db_path=temp_db,
    )

    anns = list_annotations("rec-002", db_path=temp_db)
    assert len(anns) == 2
    assert anns[0]["tag"] == "Wheeze"
    assert anns[1]["tag"] == "Crackle"

    # Delete 1 annotation
    del_ok = delete_annotation(ann1["id"], db_path=temp_db)
    assert del_ok is True
    assert len(list_annotations("rec-002", db_path=temp_db)) == 1

    # Delete parent audio record -> cascade delete should remove ann2
    del_parent = delete_audio_record("rec-002", db_path=temp_db)
    assert del_parent is True
    assert len(list_annotations("rec-002", db_path=temp_db)) == 0

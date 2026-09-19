from typing import List
from fastapi import APIRouter, HTTPException, status

from backend.app.models.schemas import AnnotationCreate, AnnotationResponse
from backend.app.core.database import (
    create_annotation,
    list_annotations,
    delete_annotation,
    get_audio_record,
)
from backend.app.core.config import settings

router = APIRouter(prefix="/api/annotations", tags=["Medical Annotations"])


@router.post("", response_model=AnnotationResponse, status_code=status.HTTP_201_CREATED)
async def add_annotation(payload: AnnotationCreate):
    """
    Tạo mới một ghi chú lâm sàng gắn với một khoảng thời gian trên bản ghi âm.
    """
    if payload.start_time < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Thời gian bắt đầu (start_time) không thể là số âm.",
        )
    if payload.end_time <= payload.start_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Thời gian kết thúc (end_time) phải lớn hơn thời gian bắt đầu (start_time).",
        )

    # Đảm bảo audio_id tồn tại hoặc có tệp raw/preset
    record = get_audio_record(payload.audio_id)
    if not record:
        raw_file = settings.RAW_DIR / f"{payload.audio_id}.wav"
        clean_file = settings.CLEANED_DIR / f"{payload.audio_id}_clean.wav"
        preset_file = settings.PRESETS_DIR / f"{payload.audio_id}.wav"
        target_file = raw_file if raw_file.exists() else (clean_file if clean_file.exists() else (preset_file if preset_file.exists() else None))
        if not target_file:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Bản ghi âm '{payload.audio_id}' không tồn tại trong hệ thống.",
            )
        create_audio_record({
            "id": payload.audio_id,
            "filename": f"{payload.audio_id}.wav",
            "duration_original": 5.0,
            "duration_processed": 5.0,
            "sample_rate": 16000,
            "snr_original": 0.0,
            "snr_processed": 0.0,
            "snr_delta": 0.0,
            "silence_trimmed_sec": 0.0,
            "raw_path": str(target_file),
            "cleaned_path": str(target_file),
        })

    data = {
        "audio_id": payload.audio_id,
        "start_time": payload.start_time,
        "end_time": payload.end_time,
        "tag": payload.tag,
        "clinical_note": payload.clinical_note or "",
        "doctor_name": payload.doctor_name or "Dr. User",
    }

    created = create_annotation(data)
    return AnnotationResponse(**created)


@router.get("/{audio_id}", response_model=List[AnnotationResponse])
async def get_annotations_for_audio(audio_id: str):
    """
    Truy vấn danh sách tất cả các ghi chú lâm sàng của một bản ghi âm cụ thể.
    """
    items = list_annotations(audio_id)
    return [AnnotationResponse(**item) for item in items]


@router.delete("/{annotation_id}")
async def remove_annotation(annotation_id: str):
    """
    Xóa một ghi chú lâm sàng theo ID.
    """
    success = delete_annotation(annotation_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy ghi chú lâm sàng với ID '{annotation_id}'.",
        )

    return {
        "status": "deleted",
        "id": annotation_id,
        "message": "Ghi chú đã được xóa thành công",
    }

import uuid
from pathlib import Path
from fastapi import APIRouter, File, HTTPException, UploadFile, status

from backend.app.core.config import settings
from backend.app.engine.audio_io import load_and_resample_audio, save_wav

router = APIRouter(prefix="/api/audio", tags=["Audio"])


@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_audio(file: UploadFile = File(...)):
    """
    Upload and validate a respiratory sound recording (.wav or .mp3).
    Converts and standardizes audio to 16kHz mono WAV and stores it in storage/raw/.
    """
    filename = file.filename or "recording.wav"
    ext = Path(filename).suffix.lower()

    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Định dạng tệp '{ext}' không được hỗ trợ. Chỉ chấp nhận các định dạng: {', '.join(settings.ALLOWED_EXTENSIONS)}",
        )

    content = await file.read()
    file_size = len(content)

    if file_size > settings.MAX_UPLOAD_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Dung lượng tệp ({file_size / (1024*1024):.1f}MB) vượt quá giới hạn tối đa cho phép (10MB).",
        )

    if file_size < 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tệp rỗng hoặc không chứa dữ liệu âm thanh hợp lệ.",
        )

    # Validate audio integrity via engine
    try:
        audio_data, sr = load_and_resample_audio(content, target_sr=settings.TARGET_SAMPLE_RATE)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Không thể giải mã dữ liệu âm thanh: {str(e)}",
        )

    duration_sec = len(audio_data) / sr
    if duration_sec < 1.0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Thời lượng tệp quá ngắn (< 1.0 giây). Yêu cầu bản ghi hô hấp tối thiểu 1.0 giây.",
        )
    if duration_sec > 120.0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Thời lượng tệp quá dài (> 120 giây). Vui lòng tải bản ghi hô hấp tiêu chuẩn 15-30 giây.",
        )

    # Save to storage/raw/ with unique ID
    audio_id = f"rec_{uuid.uuid4().hex[:12]}"
    raw_path = settings.RAW_DIR / f"{audio_id}.wav"
    save_wav(str(raw_path), audio_data, sr=sr)

    return {
        "audio_id": audio_id,
        "filename": filename,
        "duration_sec": round(duration_sec, 3),
        "sample_rate": sr,
        "size_bytes": file_size,
    }

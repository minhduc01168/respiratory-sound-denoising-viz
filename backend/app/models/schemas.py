from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class AudioRecordCreate(BaseModel):
    id: str
    filename: str
    duration_original: float
    duration_processed: float
    sample_rate: int = 16000
    snr_original: float = 0.0
    snr_processed: float = 0.0
    snr_delta: float = 0.0
    silence_trimmed_sec: float = 0.0
    raw_path: str
    cleaned_path: str


class AudioRecordResponse(BaseModel):
    id: str
    filename: str
    duration_original: float
    duration_processed: float
    sample_rate: int
    snr_original: float
    snr_processed: float
    snr_delta: float
    silence_trimmed_sec: float
    raw_path: str
    cleaned_path: str
    created_at: str


class AnnotationCreate(BaseModel):
    audio_id: str
    start_time: float
    end_time: float
    tag: str = Field(..., description="Wheeze, Crackle, Rhonchi, Stridor, Cough_Dry, Cough_Wet, Artifact")
    clinical_note: Optional[str] = ""
    doctor_name: Optional[str] = "Dr. User"


class AnnotationResponse(BaseModel):
    id: str
    audio_id: str
    start_time: float
    end_time: float
    tag: str
    clinical_note: Optional[str] = ""
    doctor_name: Optional[str] = "Dr. User"
    created_at: str


class ProcessAudioResponse(BaseModel):
    audio_id: str
    filename: str
    metrics: Dict[str, Any]
    spectrogram: Dict[str, Any]
    raw_stream_url: str
    cleaned_stream_url: str

import os
from pathlib import Path


class Settings:
    PROJECT_NAME: str = "Respiratory Sound Denoising & Clinical Visualization API"
    VERSION: str = "1.0.0"

    # Directory layout
    BACKEND_DIR: Path = Path(__file__).resolve().parent.parent.parent
    STORAGE_DIR: Path = BACKEND_DIR / "storage"
    RAW_DIR: Path = STORAGE_DIR / "raw"
    CLEANED_DIR: Path = STORAGE_DIR / "cleaned"
    PRESETS_DIR: Path = STORAGE_DIR / "presets"
    DB_PATH: Path = STORAGE_DIR / "metadata.db"

    # Audio upload constraints
    MAX_UPLOAD_SIZE_BYTES: int = 10 * 1024 * 1024  # 10 MB
    ALLOWED_EXTENSIONS = {".wav", ".mp3"}
    TARGET_SAMPLE_RATE: int = 16000

    # CORS configuration
    CORS_ORIGINS = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "*",
    ]

    def ensure_directories(self) -> None:
        """Ensure all storage folders exist on disk."""
        for directory in [self.STORAGE_DIR, self.RAW_DIR, self.CLEANED_DIR, self.PRESETS_DIR]:
            directory.mkdir(parents=True, exist_ok=True)


settings = Settings()
settings.ensure_directories()

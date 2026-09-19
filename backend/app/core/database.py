import sqlite3
import uuid
from contextlib import contextmanager
from typing import Any, Dict, Generator, List, Optional
from pathlib import Path

from backend.app.core.config import settings


def get_db_path(custom_path: Optional[Path] = None) -> Path:
    return custom_path or settings.DB_PATH


@contextmanager
def get_db(db_path: Optional[Path] = None) -> Generator[sqlite3.Connection, None, None]:
    """Context manager for SQLite connections with Foreign Keys enabled."""
    path = get_db_path(db_path)
    conn = sqlite3.connect(str(path))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db(db_path: Optional[Path] = None) -> None:
    """Initialize database tables and indexes."""
    with get_db(db_path) as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS audio_records (
                id TEXT PRIMARY KEY,
                filename TEXT NOT NULL,
                duration_original REAL NOT NULL,
                duration_processed REAL NOT NULL,
                sample_rate INTEGER DEFAULT 16000,
                snr_original REAL DEFAULT 0.0,
                snr_processed REAL DEFAULT 0.0,
                snr_delta REAL DEFAULT 0.0,
                silence_trimmed_sec REAL DEFAULT 0.0,
                raw_path TEXT NOT NULL,
                cleaned_path TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS annotations (
                id TEXT PRIMARY KEY,
                audio_id TEXT NOT NULL,
                start_time REAL NOT NULL,
                end_time REAL NOT NULL,
                tag TEXT NOT NULL,
                clinical_note TEXT DEFAULT '',
                doctor_name TEXT DEFAULT 'Dr. User',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (audio_id) REFERENCES audio_records(id) ON DELETE CASCADE
            );
            """
        )
        conn.execute("CREATE INDEX IF NOT EXISTS idx_audio_created ON audio_records(created_at);")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_ann_audio ON annotations(audio_id);")


# ==============================================================================
# Audio Records CRUD
# ==============================================================================


def create_audio_record(data: Dict[str, Any], db_path: Optional[Path] = None) -> Dict[str, Any]:
    with get_db(db_path) as conn:
        conn.execute(
            """
            INSERT INTO audio_records (
                id, filename, duration_original, duration_processed,
                sample_rate, snr_original, snr_processed, snr_delta,
                silence_trimmed_sec, raw_path, cleaned_path
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                duration_processed = excluded.duration_processed,
                snr_original = excluded.snr_original,
                snr_processed = excluded.snr_processed,
                snr_delta = excluded.snr_delta,
                silence_trimmed_sec = excluded.silence_trimmed_sec,
                cleaned_path = excluded.cleaned_path;
            """,
            (
                data["id"],
                data["filename"],
                data["duration_original"],
                data.get("duration_processed", 0.0),
                data.get("sample_rate", 16000),
                data.get("snr_original", 0.0),
                data.get("snr_processed", 0.0),
                data.get("snr_delta", 0.0),
                data.get("silence_trimmed_sec", 0.0),
                data["raw_path"],
                data.get("cleaned_path", ""),
            ),
        )
    return get_audio_record(data["id"], db_path)


def get_audio_record(record_id: str, db_path: Optional[Path] = None) -> Optional[Dict[str, Any]]:
    with get_db(db_path) as conn:
        cursor = conn.execute("SELECT * FROM audio_records WHERE id = ?;", (record_id,))
        row = cursor.fetchone()
        return dict(row) if row else None


def list_audio_records(limit: int = 50, db_path: Optional[Path] = None) -> List[Dict[str, Any]]:
    with get_db(db_path) as conn:
        cursor = conn.execute(
            "SELECT * FROM audio_records ORDER BY created_at DESC LIMIT ?;", (limit,)
        )
        return [dict(row) for row in cursor.fetchall()]


def delete_audio_record(record_id: str, db_path: Optional[Path] = None) -> bool:
    with get_db(db_path) as conn:
        cursor = conn.execute("DELETE FROM audio_records WHERE id = ?;", (record_id,))
        return cursor.rowcount > 0


# ==============================================================================
# Annotations CRUD
# ==============================================================================


def create_annotation(data: Dict[str, Any], db_path: Optional[Path] = None) -> Dict[str, Any]:
    ann_id = data.get("id") or str(uuid.uuid4())
    with get_db(db_path) as conn:
        conn.execute(
            """
            INSERT INTO annotations (
                id, audio_id, start_time, end_time, tag, clinical_note, doctor_name
            ) VALUES (?, ?, ?, ?, ?, ?, ?);
            """,
            (
                ann_id,
                data["audio_id"],
                data["start_time"],
                data["end_time"],
                data["tag"],
                data.get("clinical_note", ""),
                data.get("doctor_name", "Dr. User"),
            ),
        )
    with get_db(db_path) as conn:
        cursor = conn.execute("SELECT * FROM annotations WHERE id = ?;", (ann_id,))
        return dict(cursor.fetchone())


def list_annotations(audio_id: str, db_path: Optional[Path] = None) -> List[Dict[str, Any]]:
    with get_db(db_path) as conn:
        cursor = conn.execute(
            "SELECT * FROM annotations WHERE audio_id = ? ORDER BY start_time ASC;", (audio_id,)
        )
        return [dict(row) for row in cursor.fetchall()]


def delete_annotation(annotation_id: str, db_path: Optional[Path] = None) -> bool:
    with get_db(db_path) as conn:
        cursor = conn.execute("DELETE FROM annotations WHERE id = ?;", (annotation_id,))
        return cursor.rowcount > 0

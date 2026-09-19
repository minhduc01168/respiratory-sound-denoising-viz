from fastapi.testclient import TestClient
import pytest

from backend.app.main import app
from backend.app.core.config import settings

client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "version" in data
    assert data["docs"] == "/docs"


def test_healthcheck_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["version"] == "1.0.0"
    assert data["storage"]["raw"] is True
    assert data["storage"]["cleaned"] is True
    assert data["storage"]["presets"] is True


def test_storage_directories_exist():
    assert settings.STORAGE_DIR.exists()
    assert settings.RAW_DIR.exists()
    assert settings.CLEANED_DIR.exists()
    assert settings.PRESETS_DIR.exists()

import numpy as np
import pytest
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.engine.base import BaseDenoisingEngine, DenoiseResult
from backend.app.engine.profiles import (
    AudioProfile,
    AudioProfileConfig,
    RESPIRATORY_PROFILE,
    SPEECH_PROFILE,
    get_profile_config,
)
from backend.app.engine.registry import EngineRegistry, engine_registry
from backend.app.engine.classical_engine import ClassicalDspEngine
from backend.app.engine.pipeline import process_respiratory_audio


def test_audio_profile_config_properties():
    """Verify that respiratory and speech profiles adhere to clinical audio physics specs."""
    resp_cfg = get_profile_config("respiratory")
    assert resp_cfg.profile == AudioProfile.RESPIRATORY
    assert resp_cfg.lowcut == 50.0
    assert resp_cfg.highcut == 2500.0
    assert resp_cfg.preserve_transients is True
    assert resp_cfg.spectral_alpha == 1.8

    speech_cfg = get_profile_config("speech")
    assert speech_cfg.profile == AudioProfile.SPEECH
    assert speech_cfg.lowcut == 80.0
    assert speech_cfg.highcut == 7500.0
    assert speech_cfg.preserve_transients is False
    assert speech_cfg.spectral_alpha == 3.2


def test_get_profile_config_fallbacks():
    """Verify case-insensitivity and default fallback mechanism."""
    assert get_profile_config("Speech").profile == AudioProfile.SPEECH
    assert get_profile_config("VOICE").profile == AudioProfile.SPEECH
    assert get_profile_config("respiratory").profile == AudioProfile.RESPIRATORY
    assert get_profile_config("UNKNOWN_PROFILE_XYZ").profile == AudioProfile.RESPIRATORY
    assert get_profile_config(None).profile == AudioProfile.RESPIRATORY


def test_engine_registry_lifecycle():
    """Verify engine registration, case-insensitive retrieval, and fallback behavior."""
    local_registry = EngineRegistry()

    # Default classical engine should exist
    default_engine = local_registry.get()
    assert isinstance(default_engine, ClassicalDspEngine)
    assert default_engine.algorithm_name == "classical_dsp"

    # Fallback on unknown
    fallback = local_registry.get("non_existent_model")
    assert fallback.algorithm_name == "classical_dsp"

    # Custom engine mock
    class MockCustomEngine(BaseDenoisingEngine):
        algorithm_name = "mock_model"
        description = "Mock custom deep learning model"

        def process(self, audio, sr, profile_config, **kwargs):
            return DenoiseResult(
                clean_audio=audio,
                sample_rate=sr,
                latency_ms=1.5,
                algorithm=self.algorithm_name,
                profile=profile_config.profile.value,
            )

    local_registry.register(MockCustomEngine())
    retrieved = local_registry.get("MOCK_MODEL")
    assert retrieved.algorithm_name == "mock_model"
    assert any(a["id"] == "mock_model" for a in local_registry.list_algorithms())
    assert len(local_registry.list_algorithms()) >= 3


def test_classical_dsp_engine_execution():
    """Test ClassicalDspEngine execution with both profiles on synthetic noisy audio."""
    sr = 16000
    t = np.linspace(0, 2.0, int(sr * 2.0), endpoint=False)
    # 250Hz tone + white noise
    tone = 0.5 * np.sin(2 * np.pi * 250.0 * t)
    noise = 0.1 * np.random.normal(0, 1, len(t))
    noisy_audio = (tone + noise).astype(np.float32)

    engine = ClassicalDspEngine()

    # Respiratory profile
    resp_res = engine.process(noisy_audio, sr=sr, profile_config=RESPIRATORY_PROFILE)
    assert isinstance(resp_res, DenoiseResult)
    assert resp_res.clean_audio.dtype == np.float32
    assert resp_res.algorithm == "classical_dsp"
    assert resp_res.profile == "respiratory"
    assert resp_res.latency_ms > 0

    # Speech profile
    speech_res = engine.process(noisy_audio, sr=sr, profile_config=SPEECH_PROFILE)
    assert speech_res.profile == "speech"
    assert "spectral_alpha" in speech_res.extra_metrics
    assert speech_res.extra_metrics["spectral_alpha"] == 3.2


def test_pipeline_strategy_integration():
    """Test end-to-end pipeline execution with strategy pattern and profile options."""
    sr = 16000
    t = np.linspace(0, 1.5, int(sr * 1.5), endpoint=False)
    clean_synth = 0.4 * np.sin(2 * np.pi * 300.0 * t).astype(np.float32)

    res = process_respiratory_audio(
        clean_synth,
        target_sr=sr,
        profile="speech",
        algorithm="classical_dsp",
    )

    assert "clean_audio" in res
    assert "spectrogram" in res
    assert res["algorithm"] == "classical_dsp"
    assert res["profile"] == "speech"
    assert res["metrics"]["algorithm"] == "classical_dsp"
    assert res["metrics"]["profile"] == "speech"


def test_api_algorithms_endpoint():
    """Verify GET /api/audio/algorithms returns available engines and dual profiles."""
    client = TestClient(app)
    response = client.get("/api/audio/algorithms")
    assert response.status_code == 200
    payload = response.json()

    assert "algorithms" in payload
    assert "profiles" in payload

    algo_ids = [a["id"] for a in payload["algorithms"]]
    assert "classical_dsp" in algo_ids

    profile_ids = [p["id"] for p in payload["profiles"]]
    assert "respiratory" in profile_ids
    assert "speech" in profile_ids

import numpy as np
import pytest
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.engine.bio_acoustic import BioAcousticEngine, suppress_heart_sounds
from backend.app.engine.profiles import RESPIRATORY_PROFILE, SPEECH_PROFILE
from backend.app.engine.registry import engine_registry
from backend.app.engine.pipeline import process_respiratory_audio


def generate_synthetic_lung_with_heartbeats(sr: int = 16000, duration: float = 3.0):
    """
    Generate synthetic test signal:
    - Normal lung breath sound: 300Hz carrier tone + filtered noise (200-800Hz)
    - Heartbeat pulses (S1, S2): 50-70Hz periodic short bursts every 0.8s (75 bpm)
    """
    n_samples = int(sr * duration)
    t = np.linspace(0, duration, n_samples, endpoint=False)

    # 1. Continuous lung sound component (~300Hz)
    lung_sound = 0.25 * np.sin(2 * np.pi * 300.0 * t)

    # 2. Heart sound pulses at 0.4s, 1.2s, 2.0s, 2.8s
    heart_sound = np.zeros(n_samples, dtype=np.float32)
    beat_times = [0.4, 1.2, 2.0, 2.8]
    pulse_len = int(0.08 * sr)  # 80ms pulse

    for bt in beat_times:
        idx = int(bt * sr)
        if idx + pulse_len < n_samples:
            pulse_t = np.linspace(0, 0.08, pulse_len, endpoint=False)
            pulse = 0.7 * np.sin(2 * np.pi * 65.0 * pulse_t) * np.hanning(pulse_len)
            heart_sound[idx : idx + pulse_len] += pulse

    composite = (lung_sound + heart_sound).astype(np.float32)
    return composite, lung_sound, heart_sound, sr


def test_suppress_heart_sounds_attenuation():
    """Verify suppress_heart_sounds attenuates low-frequency cardiac bursts."""
    composite, clean_lung, heart_sound, sr = generate_synthetic_lung_with_heartbeats()

    filtered, hsai_db = suppress_heart_sounds(composite, sr=sr)

    assert filtered.shape == composite.shape
    assert filtered.dtype == np.float32
    # Heart sound attenuation index should be significantly positive
    assert hsai_db > 2.0

    # High frequency respiratory sound (300Hz) energy should be well-preserved
    orig_lung_energy = np.sum(clean_lung**2)
    filtered_energy = np.sum(filtered**2)
    assert filtered_energy >= 0.4 * orig_lung_energy


def test_bio_acoustic_engine_respiratory_execution():
    """Test BioAcousticEngine execution with respiratory profile."""
    composite, _, _, sr = generate_synthetic_lung_with_heartbeats()
    engine = BioAcousticEngine()

    result = engine.process(composite, sr=sr, profile_config=RESPIRATORY_PROFILE)

    assert result.algorithm == "bio_acoustic"
    assert result.profile == "respiratory"
    assert result.latency_ms > 0
    assert "hsai_db" in result.extra_metrics
    assert result.extra_metrics["cardiac_suppression_active"] is True


def test_bio_acoustic_engine_speech_bypass():
    """Verify that speech profile bypasses cardiac suppression (not relevant for speech)."""
    composite, _, _, sr = generate_synthetic_lung_with_heartbeats()
    engine = BioAcousticEngine()

    result = engine.process(composite, sr=sr, profile_config=SPEECH_PROFILE)

    assert result.profile == "speech"
    # When speech profile is active, cardiac suppression is bypassed
    assert result.extra_metrics["hsai_db"] == 0.0


def test_pipeline_bio_acoustic_routing():
    """Verify end-to-end process_respiratory_audio handles bio_acoustic algorithm."""
    composite, _, _, sr = generate_synthetic_lung_with_heartbeats(duration=2.0)

    res = process_respiratory_audio(
        composite,
        target_sr=sr,
        algorithm="bio_acoustic",
        profile="respiratory",
    )

    assert res["algorithm"] == "bio_acoustic"
    assert res["profile"] == "respiratory"
    assert "hsai_db" in res["metrics"]
    assert "spectrogram" in res


def test_api_algorithms_lists_bio_acoustic():
    """Verify GET /api/audio/algorithms includes bio_acoustic in discovery catalog."""
    client = TestClient(app)
    response = client.get("/api/audio/algorithms")
    assert response.status_code == 200
    algos = [a["id"] for a in response.json()["algorithms"]]
    assert "bio_acoustic" in algos
    assert "classical_dsp" in algos

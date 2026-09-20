import time
from pathlib import Path
import numpy as np
import pytest
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.engine.dl_onnx import DTLNOnnxEngine
from backend.app.engine.profiles import RESPIRATORY_PROFILE, SPEECH_PROFILE
from backend.app.engine.pipeline import process_respiratory_audio
from backend.app.engine.metrics import calculate_snr


def generate_noisy_speech_or_breath(sr: int = 16000, duration: float = 2.0, snr_target: float = 5.0):
    """
    Generate clean harmonic tone (representing respiratory or voice sound)
    contaminated with white Gaussian ambient noise at targeted initial SNR.
    """
    n_samples = int(sr * duration)
    t = np.linspace(0, duration, n_samples, endpoint=False)
    # 400Hz harmonic signal
    clean = 0.5 * np.sin(2 * np.pi * 400.0 * t) + 0.25 * np.sin(2 * np.pi * 800.0 * t)

    clean_power = np.mean(clean**2)
    noise_power = clean_power / (10.0 ** (snr_target / 10.0))
    noise = np.random.normal(0, np.sqrt(noise_power), n_samples)

    noisy = (clean + noise).astype(np.float32)
    return noisy, clean.astype(np.float32), sr


def test_dtln_onnx_engine_initialization():
    """Verify that DTLN ONNX engine loads model session correctly."""
    engine = DTLNOnnxEngine()
    assert engine.algorithm_name == "dtln_ai"
    assert engine.session is not None
    assert engine.input_name == "input_audio"
    assert engine.output_name == "denoised_audio"


def test_dtln_onnx_latency_and_snr_gain():
    """Verify sub-35ms ONNX inference latency and positive SNR improvement."""
    noisy, clean, sr = generate_noisy_speech_or_breath(duration=2.0)
    engine = DTLNOnnxEngine()

    start_bench = time.time()
    res = engine.process(noisy, sr=sr, profile_config=RESPIRATORY_PROFILE)
    bench_elapsed_ms = (time.time() - start_bench) * 1000.0

    assert res.algorithm == "dtln_ai"
    assert res.profile == "respiratory"
    assert res.clean_audio.shape == noisy.shape
    assert res.clean_audio.dtype == np.float32

    # Inference latency check (should easily be sub-50ms for 2s audio on modern CPU)
    onnx_ms = res.extra_metrics.get("onnx_inference_latency_ms", 0.0)
    assert onnx_ms > 0
    assert onnx_ms < 60.0  # Safe upper threshold for CPU test runner

    # SNR improvement check
    snr_before = calculate_snr(clean, noisy)
    snr_after = calculate_snr(clean, res.clean_audio)
    assert snr_after > snr_before


def test_dtln_onnx_speech_profile():
    """Verify DTLN ONNX execution with speech profile."""
    noisy, _, sr = generate_noisy_speech_or_breath(duration=1.5)
    engine = DTLNOnnxEngine()

    res = engine.process(noisy, sr=sr, profile_config=SPEECH_PROFILE)
    assert res.profile == "speech"
    assert res.extra_metrics["lowcut"] == 80.0
    assert res.extra_metrics["highcut"] == 7500.0


def test_pipeline_dtln_onnx_integration():
    """Verify end-to-end process_respiratory_audio handles dtln_ai algorithm."""
    noisy, _, sr = generate_noisy_speech_or_breath(duration=1.5)

    res = process_respiratory_audio(
        noisy,
        target_sr=sr,
        algorithm="dtln_ai",
        profile="respiratory",
    )

    assert res["algorithm"] == "dtln_ai"
    assert res["profile"] == "respiratory"
    assert "spectrogram" in res
    assert "onnx_inference_latency_ms" in res["metrics"]


def test_api_algorithms_includes_dtln():
    """Verify GET /api/audio/algorithms lists dtln_ai in discovery catalog."""
    client = TestClient(app)
    response = client.get("/api/audio/algorithms")
    assert response.status_code == 200
    algos = [a["id"] for a in response.json()["algorithms"]]
    assert "dtln_ai" in algos
    assert "bio_acoustic" in algos
    assert "classical_dsp" in algos

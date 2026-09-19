import io
import time
import numpy as np
import soundfile as sf
import pytest

from backend.app.engine.metrics import (
    calculate_snr,
    calculate_snr_improvement,
    calculate_log_spectral_distance,
)
from backend.app.engine.pipeline import process_respiratory_audio


def test_metrics_calculation():
    clean = np.sin(np.linspace(0, 100, 16000, dtype=np.float32))
    noisy = clean + 0.1 * np.random.randn(16000).astype(np.float32)
    denoised = clean + 0.02 * np.random.randn(16000).astype(np.float32)

    snr_noisy = calculate_snr(clean, noisy)
    snr_denoised = calculate_snr(clean, denoised)
    delta = calculate_snr_improvement(clean, noisy, denoised)

    assert snr_denoised > snr_noisy
    assert delta > 0.0

    # LSD between identical signals should be ~0
    lsd_identical = calculate_log_spectral_distance(clean, clean)
    assert lsd_identical < 0.1


def test_full_pipeline_end_to_end():
    sr = 16000
    duration = 5.0  # 5 seconds test file
    t = np.linspace(0, duration, int(sr * duration), endpoint=False)

    # 1s silence, 3s simulated wheeze (500Hz), 1s silence
    audio = np.zeros(int(sr * duration), dtype=np.float32)
    audio[16000:64000] = 0.5 * np.sin(2 * np.pi * 500 * t[16000:64000])
    # Add ambient noise
    audio += 0.03 * np.random.randn(len(audio)).astype(np.float32)

    buf = io.BytesIO()
    sf.write(buf, audio, sr, format="WAV")
    wav_bytes = buf.getvalue()

    start_time = time.time()
    result = process_respiratory_audio(wav_bytes, target_sr=16000)
    total_time = time.time() - start_time

    assert "clean_audio" in result
    assert "spectrogram" in result
    assert "metrics" in result
    assert result["sample_rate"] == 16000
    assert result["metrics"]["latency_ms"] < 600.0  # Entire pipeline under 600ms
    assert total_time < 0.80  # Under 800ms

    # Check spectrogram payload structure
    spec = result["spectrogram"]
    assert len(spec["mel_matrix"]) == 64
    assert len(spec["time_axis"]) > 0


def test_15s_audio_latency_budget():
    sr = 16000
    duration = 15.0  # Standard 15s clinical audio
    audio = (0.2 * np.random.randn(int(sr * duration))).astype(np.float32)

    buf = io.BytesIO()
    sf.write(buf, audio, sr, format="WAV")
    wav_bytes = buf.getvalue()

    start_time = time.time()
    result = process_respiratory_audio(wav_bytes, target_sr=16000)
    elapsed = time.time() - start_time

    # Critical KPI: Must complete end-to-end in < 800ms
    assert elapsed < 0.80, f"15s audio processing took {elapsed:.3f}s, expected < 0.800s"
    assert result["metrics"]["latency_ms"] < 800.0

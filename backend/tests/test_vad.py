import numpy as np
import pytest

from backend.app.engine.vad import detect_breath_activity, trim_silence


def test_vad_detects_speech_and_trims_silence():
    sr = 16000
    # Create 6 seconds: 2s silence + 2s simulated breath sound + 2s silence
    silence_pre = np.zeros(2 * sr, dtype=np.float32)
    t_breath = np.linspace(0, 2.0, 2 * sr, endpoint=False)
    # Simulated breath: noise modulated sine wave
    breath = (0.4 * np.sin(2 * np.pi * 350 * t_breath) + 0.1 * np.random.randn(len(t_breath))).astype(np.float32)
    silence_post = np.zeros(2 * sr, dtype=np.float32)

    signal = np.concatenate([silence_pre, breath, silence_post])

    mask, segments = detect_breath_activity(signal, sr=sr, pre_pad_ms=150, post_pad_ms=200)

    # Active mask should cover breath portion
    assert len(segments) >= 1
    # Breath began at 2.0s, pre-pad 150ms means start should be <= 2.0s
    seg_start, seg_end = segments[0]
    assert seg_start <= 2.0
    # Breath ended at 4.0s, post-pad 200ms means end should be >= 4.0s
    assert seg_end >= 4.0

    # Trimming should reduce length by removing surrounding silence
    trimmed, segs, trimmed_sec = trim_silence(signal, sr=sr)
    assert len(trimmed) < len(signal)
    assert trimmed_sec > 3.0  # At least 3s of silence removed out of 4s


def test_vad_bridges_short_pauses():
    sr = 16000
    t = np.linspace(0, 0.5, int(0.5 * sr), endpoint=False)
    burst1 = 0.5 * np.sin(2 * np.pi * 400 * t).astype(np.float32)
    gap = np.zeros(int(0.15 * sr), dtype=np.float32)  # 150ms gap (< 300ms min_silence)
    burst2 = 0.5 * np.sin(2 * np.pi * 400 * t).astype(np.float32)

    signal = np.concatenate([burst1, gap, burst2])

    mask, segments = detect_breath_activity(signal, sr=sr, min_silence_ms=300)
    # Gap of 150ms should be bridged into a single segment
    assert len(segments) == 1


def test_vad_empty_or_pure_silence():
    sr = 16000
    pure_silence = np.zeros(sr, dtype=np.float32)
    trimmed, segs, trimmed_sec = trim_silence(pure_silence, sr=sr)
    # Shouldn't crash and returns array safely
    assert len(trimmed) == sr
    assert trimmed_sec == 0.0

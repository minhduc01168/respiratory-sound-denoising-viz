from typing import List, Tuple
import numpy as np


def compute_frame_energy(audio: np.ndarray, frame_len: int = 512, hop_len: int = 256) -> np.ndarray:
    """
    Compute Root-Mean-Square (RMS) energy for sliding frames.
    """
    if len(audio) < frame_len:
        return np.array([np.sqrt(np.mean(audio**2) + 1e-12)], dtype=np.float32)

    num_frames = 1 + (len(audio) - frame_len) // hop_len
    shape = (num_frames, frame_len)
    strides = (audio.strides[0] * hop_len, audio.strides[0])
    frames = np.lib.stride_tricks.as_strided(audio, shape=shape, strides=strides)

    rms = np.sqrt(np.mean(frames**2, axis=1) + 1e-12)
    return rms.astype(np.float32)


def detect_breath_activity(
    audio: np.ndarray,
    sr: int = 16000,
    frame_len: int = 512,
    hop_len: int = 256,
    pre_pad_ms: float = 150.0,
    post_pad_ms: float = 200.0,
    min_speech_ms: float = 150.0,
    min_silence_ms: float = 300.0,
) -> Tuple[np.ndarray, List[Tuple[float, float]]]:
    """
    Detect breath activity segments using adaptive decibel-scale energy thresholding
    with hangover bridging and pre/post margin padding.

    Args:
        audio: 1D numpy array of audio samples.
        sr: Sample rate in Hz.
        frame_len: Analysis frame length in samples (default 512 = 32ms at 16kHz).
        hop_len: Hop size in samples (default 256 = 16ms at 16kHz).
        pre_pad_ms: Safety margin before active burst (default 150ms).
        post_pad_ms: Safety margin after active burst (default 200ms).
        min_speech_ms: Minimum duration of breath event to retain (default 150ms).
        min_silence_ms: Minimum silence duration to split segments; shorter gaps are bridged (default 300ms).

    Returns:
        Tuple of (sample_mask: 1D boolean array, segments: list of (start_sec, end_sec))
    """
    n_samples = len(audio)
    if n_samples == 0:
        return np.zeros(0, dtype=bool), []

    rms = compute_frame_energy(audio, frame_len, hop_len)
    num_frames = len(rms)

    energy_db = 20.0 * np.log10(rms + 1e-6)
    max_db = float(np.max(energy_db))
    min_db = float(np.min(energy_db))
    dynamic_range = max_db - min_db

    # If sound level across whole file is below -55 dB, treat as silence
    if max_db < -55.0:
        return np.zeros(n_samples, dtype=bool), []

    # If dynamic range is very small (< 6 dB), signal is uniform
    if dynamic_range < 6.0:
        # Uniform loud/moderate signal -> fully active
        return np.ones(n_samples, dtype=bool), [(0.0, n_samples / sr)]

    # Robust adaptive threshold:
    # Set threshold between noise floor (min_db) and peak (max_db), capped at -30dB from peak
    threshold_db = max(min_db + 0.25 * dynamic_range, max_db - 28.0)
    raw_active_frames = energy_db > threshold_db

    # 1. Bridge short silence gaps (< min_silence_ms)
    min_silence_frames = max(1, int((min_silence_ms / 1000.0) * sr / hop_len))
    bridged = raw_active_frames.copy()

    silence_start = None
    for i in range(num_frames):
        if not bridged[i]:
            if silence_start is None:
                silence_start = i
        else:
            if silence_start is not None:
                silence_len = i - silence_start
                if silence_len < min_silence_frames and silence_start > 0:
                    bridged[silence_start:i] = True
                silence_start = None

    # 2. Filter out tiny blips (< min_speech_ms)
    min_speech_frames = max(1, int((min_speech_ms / 1000.0) * sr / hop_len))
    filtered_frames = bridged.copy()
    burst_start = None
    for i in range(num_frames):
        if filtered_frames[i]:
            if burst_start is None:
                burst_start = i
        else:
            if burst_start is not None:
                burst_len = i - burst_start
                if burst_len < min_speech_frames:
                    filtered_frames[burst_start:i] = False
                burst_start = None
    if burst_start is not None and (num_frames - burst_start) < min_speech_frames:
        filtered_frames[burst_start:num_frames] = False

    # 3. Find continuous active frame intervals and apply pre/post sample padding
    pre_pad_samples = int((pre_pad_ms / 1000.0) * sr)
    post_pad_samples = int((post_pad_ms / 1000.0) * sr)

    sample_mask = np.zeros(n_samples, dtype=bool)
    segments: List[Tuple[float, float]] = []

    in_segment = False
    start_frame = 0

    for i in range(num_frames):
        if filtered_frames[i] and not in_segment:
            in_segment = True
            start_frame = i
        elif not filtered_frames[i] and in_segment:
            in_segment = False
            s_start = max(0, start_frame * hop_len - pre_pad_samples)
            s_end = min(n_samples, (i * hop_len + frame_len) + post_pad_samples)
            sample_mask[s_start:s_end] = True
            segments.append((round(s_start / sr, 3), round(s_end / sr, 3)))

    if in_segment:
        s_start = max(0, start_frame * hop_len - pre_pad_samples)
        s_end = n_samples
        sample_mask[s_start:s_end] = True
        segments.append((round(s_start / sr, 3), round(s_end / sr, 3)))

    # Merge overlapping segments after padding
    if len(segments) > 1:
        merged: List[Tuple[float, float]] = []
        cur_start, cur_end = segments[0]
        for s, e in segments[1:]:
            if s <= cur_end:
                cur_end = max(cur_end, e)
            else:
                merged.append((cur_start, cur_end))
                cur_start, cur_end = s, e
        merged.append((cur_start, cur_end))
        segments = merged

    return sample_mask, segments


def trim_silence(
    audio: np.ndarray,
    sr: int = 16000,
    **vad_kwargs,
) -> Tuple[np.ndarray, List[Tuple[float, float]], float]:
    """
    Trim non-breath silence intervals from audio and concatenate active regions.

    Args:
        audio: 1D numpy array of audio samples.
        sr: Sample rate in Hz.
        vad_kwargs: Keyword arguments forwarded to detect_breath_activity.

    Returns:
        Tuple of:
            trimmed_audio: np.ndarray 1D float32
            segments: List of active intervals (start_sec, end_sec) in original timeline
            silence_trimmed_sec: Total duration of silence trimmed in seconds
    """
    if len(audio) == 0:
        return audio.astype(np.float32), [], 0.0

    mask, segments = detect_breath_activity(audio, sr=sr, **vad_kwargs)

    active_count = np.sum(mask)
    if active_count == 0 or active_count == len(audio):
        return audio.astype(np.float32), segments, 0.0

    trimmed = audio[mask].astype(np.float32)
    silence_trimmed_sec = round((len(audio) - len(trimmed)) / sr, 3)

    return trimmed, segments, silence_trimmed_sec

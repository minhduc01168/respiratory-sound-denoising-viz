import time
import tracemalloc
import numpy as np
from pathlib import Path

from backend.app.engine.audio_io import load_and_resample_audio, normalize_audio
from backend.app.engine.filters import apply_bandpass_filter
from backend.app.engine.vad import trim_silence
from backend.app.engine.spectral_gating import reduce_noise_spectral_gating
from backend.app.engine.spectrogram import compute_mel_spectrogram
from backend.app.engine.pipeline import process_respiratory_audio


def run_dsp_profiler():
    print("=" * 65)
    print("PULMO-SPECTRA AI: DSP ENGINE PERFORMANCE PROFILER")
    print("=" * 65)

    sr = 16000
    dur = 15.0
    n_samples = int(sr * dur)
    t = np.linspace(0, dur, n_samples, endpoint=False)
    # Synthetic 15s wheeze with background noise
    raw_signal = (
        0.4 * np.sin(2 * np.pi * 480 * t)
        + 0.05 * np.random.randn(n_samples)
        + 0.03 * np.sin(2 * np.pi * 50 * t)
    ).astype(np.float32)

    tracemalloc.start()
    t_start = time.perf_counter()

    # 1. Normalization
    t0 = time.perf_counter()
    norm_audio = normalize_audio(raw_signal)
    t_norm = (time.perf_counter() - t0) * 1000

    # 2. Butterworth Bandpass
    t0 = time.perf_counter()
    filtered_audio = apply_bandpass_filter(norm_audio, sr=sr, lowcut=50, highcut=4000)
    t_filter = (time.perf_counter() - t0) * 1000

    # 3. VAD Silence Trimming
    t0 = time.perf_counter()
    vad_audio, segments, silence_sec = trim_silence(filtered_audio, sr=sr)
    t_vad = (time.perf_counter() - t0) * 1000

    # 4. Spectral Gating
    t0 = time.perf_counter()
    clean_audio = reduce_noise_spectral_gating(vad_audio, sr=sr)
    t_spectral = (time.perf_counter() - t0) * 1000

    # 5. Mel-Spectrogram
    t0 = time.perf_counter()
    mel_db, times, freqs = compute_mel_spectrogram(clean_audio, sr=sr, n_mels=64)
    t_mel = (time.perf_counter() - t0) * 1000

    t_total = (time.perf_counter() - t_start) * 1000
    current_ram, peak_ram = tracemalloc.get_traced_memory()
    tracemalloc.stop()

    results = {
        "audio_duration_sec": dur,
        "sample_count": n_samples,
        "normalization_ms": round(t_norm, 2),
        "butterworth_bandpass_ms": round(t_filter, 2),
        "vad_trimming_ms": round(t_vad, 2),
        "spectral_gating_ms": round(t_spectral, 2),
        "mel_spectrogram_ms": round(t_mel, 2),
        "total_dsp_latency_ms": round(t_total, 2),
        "peak_ram_mb": round(peak_ram / (1024 * 1024), 2),
        "latency_budget_ms": 1200.0,
        "speedup_vs_budget": round(1200.0 / t_total, 2),
    }

    print(f"Test Signal: {dur}s ({n_samples:,} samples @ 16kHz)")
    print(f"1. RMS Amplitude Normalization:        {results['normalization_ms']} ms")
    print(f"2. Butterworth Bandpass Filter (IIR):  {results['butterworth_bandpass_ms']} ms")
    print(f"3. VAD Breath Silence Trimming:        {results['vad_trimming_ms']} ms")
    print(f"4. Wiener Spectral Gating Denoising:   {results['spectral_gating_ms']} ms")
    print(f"5. 64-Band Mel-Spectrogram Extraction: {results['mel_spectrogram_ms']} ms")
    print("-" * 65)
    print(f"-> TOTAL PIPELINE LATENCY:             {results['total_dsp_latency_ms']} ms")
    print(f"-> TARGET LATENCY BUDGET:              {results['latency_budget_ms']} ms")
    print(f"-> SPEED FACTOR:                       {results['speedup_vs_budget']}x FASTER THAN BUDGET")
    print(f"-> PEAK RAM USAGE:                     {results['peak_ram_mb']} MB (Budget: < 300MB)")
    print("=" * 65)

    return results


if __name__ == "__main__":
    run_dsp_profiler()

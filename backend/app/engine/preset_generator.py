import os
import urllib.request
from pathlib import Path
import numpy as np
from backend.app.core.config import settings
from backend.app.engine.audio_io import load_and_resample_audio, normalize_audio, save_wav

# Mapping of clinical presets to authentic open-source recordings
PRESET_SOURCES = {
    "preset_normal.wav": {
        "local_candidates": [
            Path("/app/testset_audio/Breathing_man.ogg"),
            Path("testset_audio/Breathing_man.ogg"),
            Path("/app/testset_audio/Breathing_man.ogg.mp3"),
        ],
        "remote_url": "https://upload.wikimedia.org/wikipedia/commons/2/29/Breathing_man.ogg",
    },
    "preset_wheeze.wav": {
        "local_candidates": [
            Path("/app/testset_audio/Wheeze2O.ogg.mp3"),
            Path("testset_audio/Wheeze2O.ogg.mp3"),
            Path("/app/testset_audio/Wheeze2O.ogg"),
        ],
        "remote_url": "https://upload.wikimedia.org/wikipedia/commons/4/47/Wheeze2O.ogg",
    },
    "preset_crackle.wav": {
        "local_candidates": [
            Path("/app/testset_audio/Crackles_pneumoniaO.ogg.mp3"),
            Path("testset_audio/Crackles_pneumoniaO.ogg.mp3"),
            Path("/app/testset_audio/Crackles_pneumoniaO.ogg"),
        ],
        "remote_url": "https://upload.wikimedia.org/wikipedia/commons/c/c7/Crackles_pneumoniaO.ogg",
    },
    "preset_cough.wav": {
        "local_candidates": [
            Path("/app/testset_audio/Cough_1.ogg"),
            Path("testset_audio/Cough_1.ogg"),
        ],
        "remote_url": "https://upload.wikimedia.org/wikipedia/commons/6/6a/Cough_1.ogg",
    },
}


def generate_clinical_presets(presets_dir: Path = settings.PRESETS_DIR):
    """
    Ensure 4 authentic clinical respiratory sound files (16kHz standard)
    exist in the presets directory, matching the verified reference sources.
    Replaces old synthetic placeholder waveforms with real recordings.
    """
    presets_dir.mkdir(parents=True, exist_ok=True)
    sr = settings.TARGET_SAMPLE_RATE

    for preset_filename, meta in PRESET_SOURCES.items():
        dest_path = presets_dir / preset_filename

        # If already exists, verify that peak amplitude is healthy (> 0.2)
        if dest_path.exists() and dest_path.stat().st_size != 128044:
            try:
                import soundfile as sf
                cur_data, _ = sf.read(str(dest_path))
                if np.max(np.abs(cur_data)) >= 0.2:
                    continue
            except Exception:
                pass

        # Try to load from authentic local audio candidates
        loaded = False
        for cand in meta["local_candidates"]:
            if cand.exists():
                try:
                    audio_data, _ = load_and_resample_audio(str(cand), target_sr=sr)
                    audio_data = normalize_audio(audio_data, target_peak=0.95)
                    save_wav(str(dest_path), audio_data, sr=sr)
                    loaded = True
                    break
                except Exception as e:
                    print(f"Failed to load local preset candidate {cand}: {e}")

        # If not found locally, fetch authentic recording directly from Wikimedia Commons
        if not loaded and meta.get("remote_url"):
            try:
                req = urllib.request.Request(
                    meta["remote_url"],
                    headers={"User-Agent": "RespiratorySoundViz/1.0 (Clinical research tool)"},
                )
                with urllib.request.urlopen(req, timeout=10) as response:
                    raw_bytes = response.read()
                    audio_data, _ = load_and_resample_audio(raw_bytes, target_sr=sr)
                    audio_data = normalize_audio(audio_data, target_peak=0.95)
                    save_wav(str(dest_path), audio_data, sr=sr)
                    loaded = True
            except Exception as e:
                print(f"Failed to fetch remote preset {meta['remote_url']}: {e}")

        # Fallback to mathematical modeling if offline and file missing
        if not loaded:
            _generate_fallback_synthetic(preset_filename, dest_path, sr)


def _generate_fallback_synthetic(preset_filename: str, dest_path: Path, sr: int):
    """Fallback mathematical synthesis in case of complete offline isolation without media."""
    dur = 4.0
    t = np.linspace(0, dur, int(sr * dur), endpoint=False)

    if preset_filename == "preset_normal.wav":
        envelope = 0.5 * (np.sin(np.pi * t / 2.0) ** 2)
        breath = np.convolve(np.random.randn(len(t)), np.ones(30) / 30, mode="same")
        room_noise = 0.03 * np.sin(2 * np.pi * 50 * t) + 0.04 * np.random.randn(len(t))
        signal = (0.4 * envelope * breath + room_noise).astype(np.float32)
        save_wav(str(dest_path), signal, sr=sr)

    elif preset_filename == "preset_wheeze.wav":
        wheeze_mask = (t >= 2.0) & (t <= 3.8)
        harmonics = (
            0.45 * np.sin(2 * np.pi * 520 * t)
            + 0.25 * np.sin(2 * np.pi * 1040 * t)
            + 0.1 * np.sin(2 * np.pi * 1560 * t)
        )
        breath_base = 0.2 * np.convolve(np.random.randn(len(t)), np.ones(20) / 20, mode="same")
        clinic_noise = 0.05 * np.random.randn(len(t)) + 0.02 * np.sin(2 * np.pi * 100 * t)
        signal = (breath_base + (harmonics * wheeze_mask) + clinic_noise).astype(np.float32)
        save_wav(str(dest_path), signal, sr=sr)

    elif preset_filename == "preset_crackle.wav":
        breath = 0.25 * np.convolve(np.random.randn(len(t)), np.ones(25) / 25, mode="same")
        crackles = np.zeros_like(t)
        crackle_times = [0.6, 0.75, 0.92, 1.15, 1.35, 1.5, 1.68]
        for ct in crackle_times:
            idx = int(ct * sr)
            width = int(0.015 * sr)
            pulse_t = np.linspace(0, 1, width)
            pulse = np.sin(2 * np.pi * 800 * pulse_t) * np.exp(-5 * pulse_t)
            if idx + width < len(crackles):
                crackles[idx : idx + width] += 0.5 * pulse
        noise = 0.04 * np.random.randn(len(t))
        signal = (breath + crackles + noise).astype(np.float32)
        save_wav(str(dest_path), signal, sr=sr)

    elif preset_filename == "preset_cough.wav":
        cough = np.zeros_like(t)
        burst_times = [0.8, 2.2]
        for bt in burst_times:
            idx = int(bt * sr)
            width = int(0.45 * sr)
            burst_t = np.linspace(0, 1, width)
            burst_env = np.sin(np.pi * burst_t) ** 0.5 * np.exp(-2.5 * burst_t)
            burst_sound = burst_env * (
                np.random.randn(width) * 0.5 + 0.3 * np.sin(2 * np.pi * 280 * burst_t)
            )
            if idx + width < len(cough):
                cough[idx : idx + width] += burst_sound
        noise = 0.03 * np.random.randn(len(t))
        signal = (cough + noise).astype(np.float32)
        save_wav(str(dest_path), signal, sr=sr)

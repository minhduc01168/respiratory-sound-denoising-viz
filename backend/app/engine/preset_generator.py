import numpy as np
from pathlib import Path
from backend.app.core.config import settings
from backend.app.engine.audio_io import save_wav


def generate_clinical_presets(presets_dir: Path = settings.PRESETS_DIR):
    """
    Generate 4 realistic clinical respiratory sound files (16kHz standard)
    if they do not already exist in the presets directory.
    """
    presets_dir.mkdir(parents=True, exist_ok=True)
    sr = settings.TARGET_SAMPLE_RATE

    # 1. Normal Vesicular Breath (Tiếng thở phế nang bình thường)
    normal_path = presets_dir / "preset_normal.wav"
    if not normal_path.exists():
        dur = 4.0
        t = np.linspace(0, dur, int(sr * dur), endpoint=False)
        # Low frequency murmur envelope (inspire 0-2s, expire 2-4s)
        envelope = 0.5 * (np.sin(np.pi * t / 2.0) ** 2)
        # Filtered pink/brown breath noise
        breath = np.convolve(np.random.randn(len(t)), np.ones(30) / 30, mode="same")
        # Clinic room acoustic noise (50Hz hum + white noise)
        room_noise = 0.03 * np.sin(2 * np.pi * 50 * t) + 0.04 * np.random.randn(len(t))
        signal = (0.4 * envelope * breath + room_noise).astype(np.float32)
        save_wav(str(normal_path), signal, sr=sr)

    # 2. Asthma Wheeze (Tiếng hen phế quản - Ran rít âm sắc cao)
    wheeze_path = presets_dir / "preset_wheeze.wav"
    if not wheeze_path.exists():
        dur = 4.0
        t = np.linspace(0, dur, int(sr * dur), endpoint=False)
        # Expiratory wheeze occurs in second half of cycle (2.0s to 3.8s)
        wheeze_mask = (t >= 2.0) & (t <= 3.8)
        # Musical sinusoidal harmonics around 520Hz and 1040Hz
        harmonics = (
            0.45 * np.sin(2 * np.pi * 520 * t)
            + 0.25 * np.sin(2 * np.pi * 1040 * t)
            + 0.1 * np.sin(2 * np.pi * 1560 * t)
        )
        breath_base = 0.2 * np.convolve(np.random.randn(len(t)), np.ones(20) / 20, mode="same")
        clinic_noise = 0.05 * np.random.randn(len(t)) + 0.02 * np.sin(2 * np.pi * 100 * t)
        signal = (breath_base + (harmonics * wheeze_mask) + clinic_noise).astype(np.float32)
        save_wav(str(wheeze_path), signal, sr=sr)

    # 3. Pneumonia Crackles (Viêm phổi - Tiếng ran nổ ngắt quãng thì hít vào)
    crackle_path = presets_dir / "preset_crackle.wav"
    if not crackle_path.exists():
        dur = 4.0
        t = np.linspace(0, dur, int(sr * dur), endpoint=False)
        # Breath envelope
        breath = 0.25 * np.convolve(np.random.randn(len(t)), np.ones(25) / 25, mode="same")
        # Sharp explosive impulses (15-20ms each) during inspiration (0.5s - 1.8s)
        crackles = np.zeros_like(t)
        crackle_times = [0.6, 0.75, 0.92, 1.15, 1.35, 1.5, 1.68]
        for ct in crackle_times:
            idx = int(ct * sr)
            width = int(0.015 * sr)  # 15ms pulse
            pulse_t = np.linspace(0, 1, width)
            pulse = np.sin(2 * np.pi * 800 * pulse_t) * np.exp(-5 * pulse_t)
            if idx + width < len(crackles):
                crackles[idx : idx + width] += 0.5 * pulse

        noise = 0.04 * np.random.randn(len(t))
        signal = (breath + crackles + noise).astype(np.float32)
        save_wav(str(crackle_path), signal, sr=sr)

    # 4. Spasmodic Cough (Cơn ho cấp / Ho có đờm)
    cough_path = presets_dir / "preset_cough.wav"
    if not cough_path.exists():
        dur = 4.0
        t = np.linspace(0, dur, int(sr * dur), endpoint=False)
        # Two successive explosive cough bursts at 0.8s and 2.2s
        cough = np.zeros_like(t)
        burst_times = [0.8, 2.2]
        for bt in burst_times:
            idx = int(bt * sr)
            width = int(0.45 * sr)  # 450ms cough burst
            burst_t = np.linspace(0, 1, width)
            burst_env = np.sin(np.pi * burst_t) ** 0.5 * np.exp(-2.5 * burst_t)
            burst_sound = burst_env * (
                np.random.randn(width) * 0.5 + 0.3 * np.sin(2 * np.pi * 280 * burst_t)
            )
            if idx + width < len(cough):
                cough[idx : idx + width] += burst_sound

        noise = 0.03 * np.random.randn(len(t))
        signal = (cough + noise).astype(np.float32)
        save_wav(str(cough_path), signal, sr=sr)

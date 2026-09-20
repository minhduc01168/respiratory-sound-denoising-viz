from dataclasses import dataclass
from enum import Enum
from typing import Union


class AudioProfile(str, Enum):
    RESPIRATORY = "respiratory"
    SPEECH = "speech"


@dataclass(frozen=True)
class AudioProfileConfig:
    """
    Acoustic parameter profile controlling bandpass boundaries, VAD margins,
    and spectral gating aggressiveness tailored to specific signal physics.
    """
    profile: AudioProfile
    lowcut: float
    highcut: float
    filter_order: int
    vad_pre_pad_ms: float
    vad_post_pad_ms: float
    vad_min_speech_ms: float
    vad_min_silence_ms: float
    spectral_alpha: float
    spectral_floor: float
    smooth_time_frames: int
    smooth_freq_bins: int
    preserve_transients: bool
    description: str


RESPIRATORY_PROFILE = AudioProfileConfig(
    profile=AudioProfile.RESPIRATORY,
    lowcut=50.0,
    highcut=2500.0,
    filter_order=4,
    vad_pre_pad_ms=200.0,
    vad_post_pad_ms=250.0,
    vad_min_speech_ms=150.0,
    vad_min_silence_ms=350.0,
    spectral_alpha=1.8,
    spectral_floor=0.12,          # -18.4 dB floor prevents erasing faint vesicular breath sounds
    smooth_time_frames=2,
    smooth_freq_bins=2,
    preserve_transients=True,     # Protect explosive 5-20ms crackles from clipping
    description="Tối ưu âm học hô hấp: Bảo tồn rale nổ (Crackles), rale rít (Wheezes), cắt tạp âm dải siêu cao.",
)

SPEECH_PROFILE = AudioProfileConfig(
    profile=AudioProfile.SPEECH,
    lowcut=80.0,                  # Cut micro wind rumble and 50Hz/60Hz mains hum
    highcut=7500.0,               # Wideband speech preservation up to 7.5kHz for unvoiced fricatives (/s/, /sh/)
    filter_order=4,
    vad_pre_pad_ms=80.0,
    vad_post_pad_ms=120.0,
    vad_min_speech_ms=80.0,
    vad_min_silence_ms=180.0,
    spectral_alpha=3.2,           # Aggressive noise suppression for crisp speech intelligibility
    spectral_floor=0.03,          # -30.5 dB floor gives quiet studio background
    smooth_time_frames=2,
    smooth_freq_bins=3,
    preserve_transients=False,    # Smooth transients to reduce background clicks
    description="Tối ưu tiếng nói lâm sàng: Bảo tồn dải tần rộng Formants, làm sạch sâu tiếng ồn buồng khám.",
)


def get_profile_config(profile: Union[str, AudioProfile] = AudioProfile.RESPIRATORY) -> AudioProfileConfig:
    """
    Resolve profile identifier into an AudioProfileConfig instance.
    Defaults to RESPIRATORY_PROFILE if unknown or unspecified.
    """
    if isinstance(profile, AudioProfile):
        target = profile
    elif isinstance(profile, str):
        val = profile.strip().lower()
        if val in ("speech", "voice"):
            target = AudioProfile.SPEECH
        else:
            target = AudioProfile.RESPIRATORY
    else:
        target = AudioProfile.RESPIRATORY

    if target == AudioProfile.SPEECH:
        return SPEECH_PROFILE
    return RESPIRATORY_PROFILE

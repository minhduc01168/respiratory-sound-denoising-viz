from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any, Dict
import numpy as np


@dataclass
class DenoiseResult:
    """
    Standardized result data container returned by any denoising engine.
    """
    clean_audio: np.ndarray
    sample_rate: int
    latency_ms: float
    algorithm: str
    profile: str
    extra_metrics: Dict[str, Any] = field(default_factory=dict)


class BaseDenoisingEngine(ABC):
    """
    Abstract Base Class representing a pluggable audio denoising strategy.
    Any new algorithm (Classical DSP, Deep Learning ONNX, Bio-Acoustic) must inherit from this class.
    """
    algorithm_name: str = "base"
    description: str = "Base Denoising Engine"

    @abstractmethod
    def process(
        self,
        audio: np.ndarray,
        sr: int,
        profile_config: Any,
        **kwargs: Any,
    ) -> DenoiseResult:
        """
        Process the input 1D float32 audio array and return a standardized DenoiseResult.

        Args:
            audio: 1D float32 numpy array.
            sr: Sampling rate in Hz.
            profile_config: An AudioProfileConfig object controlling acoustic parameters.
            **kwargs: Algorithm-specific runtime options.

        Returns:
            DenoiseResult containing cleaned audio and processing metadata.
        """
        pass

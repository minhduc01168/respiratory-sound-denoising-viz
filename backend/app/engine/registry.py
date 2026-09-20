from typing import Dict, List, Optional
from .base import BaseDenoisingEngine
from .classical_engine import ClassicalDspEngine
from .bio_acoustic import BioAcousticEngine
from .dl_onnx import DTLNOnnxEngine


class EngineRegistry:
    """
    Central Registry for all pluggable denoising algorithms in RSDV.
    Allows runtime dynamic discovery, lookup, and fallback handling.
    """

    def __init__(self) -> None:
        self._engines: Dict[str, BaseDenoisingEngine] = {}
        # Register standard classical DSP, bio-acoustic, and deep learning engines
        self.register(ClassicalDspEngine())
        self.register(BioAcousticEngine())
        try:
            self.register(DTLNOnnxEngine())
        except Exception:
            pass

    def register(self, engine: BaseDenoisingEngine) -> None:
        """Register a new denoising engine instance."""
        key = engine.algorithm_name.strip().lower()
        self._engines[key] = engine

    def get(self, algorithm_name: Optional[str] = None) -> BaseDenoisingEngine:
        """
        Get an engine by name. Falls back to 'classical_dsp' if name is None,
        unknown, or not registered yet.
        """
        if not algorithm_name:
            return self._engines["classical_dsp"]

        key = algorithm_name.strip().lower()
        if key in self._engines:
            return self._engines[key]

        # Fallback to classical DSP
        return self._engines["classical_dsp"]

    def list_algorithms(self) -> List[Dict[str, str]]:
        """Return metadata list of all available registered algorithms."""
        return [
            {
                "id": eng.algorithm_name,
                "name": eng.algorithm_name,
                "description": eng.description,
            }
            for eng in self._engines.values()
        ]


# Global singleton instance
engine_registry = EngineRegistry()

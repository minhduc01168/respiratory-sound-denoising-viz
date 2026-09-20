import os
from pathlib import Path
import torch
import torch.nn as nn


class DTLNAudioEnhancer(nn.Module):
    """
    Lightweight Dual-Signal Transformation & Masking Network (DTLN-inspired architecture).
    Processes audio through learned 1D convolution filterbanks and gated recurrent layers
    to estimate a dynamic non-linear suppression mask in the latent bio-acoustic space.
    """
    def __init__(self, channels: int = 64, kernel_size: int = 64, stride: int = 16):
        super().__init__()
        self.stride = stride
        self.kernel_size = kernel_size
        self.channels = channels
        self.pad = kernel_size // 2

        # 1. Learnable Analysis Filterbank (Time to Latent Domain)
        self.encoder = nn.Conv1d(
            1, channels, kernel_size=kernel_size, stride=stride, padding=self.pad, bias=False
        )

        # 2. Dual Recurrent Temporal & Spectral Pattern Estimator
        self.recurrent = nn.GRU(
            input_size=channels,
            hidden_size=channels,
            num_layers=2,
            batch_first=True,
            bidirectional=False,
        )

        # 3. Non-linear Gating Mask Projection
        self.mask_net = nn.Sequential(
            nn.Linear(channels, channels),
            nn.LeakyReLU(0.1),
            nn.Linear(channels, channels),
            nn.Sigmoid(),
        )

        # 4. Learnable Synthesis Filterbank (Latent to Time Domain)
        self.decoder = nn.ConvTranspose1d(
            channels, 1, kernel_size=kernel_size, stride=stride, padding=self.pad, bias=False
        )

        self._init_weights()

    def _init_weights(self):
        # Initialize encoder with pseudo-Hann windowed cosine basis
        with torch.no_grad():
            t = torch.linspace(0, 1, self.kernel_size)
            hann = 0.5 * (1 - torch.cos(2 * torch.pi * t))
            for i in range(self.channels):
                freq = float(i + 1) * 0.5
                cos_wave = torch.cos(2 * torch.pi * freq * t) * hann
                self.encoder.weight[i, 0] = cos_wave / (torch.norm(cos_wave) + 1e-8)
                self.decoder.weight[i, 0] = self.encoder.weight[i, 0]

            # Bias mask net towards clean pass-through for prominent energy
            nn.init.xavier_uniform_(self.mask_net[0].weight)
            nn.init.constant_(self.mask_net[0].bias, 0.1)
            nn.init.xavier_uniform_(self.mask_net[2].weight)
            nn.init.constant_(self.mask_net[2].bias, 1.2)  # Generous baseline transmission

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Args:
            x: Input audio tensor of shape (batch_size, num_samples)
        Returns:
            Denoised audio tensor of shape (batch_size, num_samples)
        """
        orig_len = x.shape[-1]
        x_in = x.unsqueeze(1)  # (B, 1, T)

        # Encode into latent feature space
        features = self.encoder(x_in)  # (B, C, T_frames)
        features_t = features.permute(0, 2, 1)  # (B, T_frames, C)

        # Recurrent temporal tracking
        out_rec, _ = self.recurrent(features_t)  # (B, T_frames, C)

        # Compute dynamic gating mask in [0, 1]
        mask = self.mask_net(out_rec)  # (B, T_frames, C)
        mask_t = mask.permute(0, 2, 1)  # (B, C, T_frames)

        # Apply soft gating in latent domain
        masked_features = features * mask_t

        # Reconstruct waveform
        enhanced = self.decoder(masked_features).squeeze(1)  # (B, T)

        # Ensure exact original length
        if enhanced.shape[-1] >= orig_len:
            enhanced = enhanced[..., :orig_len]
        else:
            enhanced = torch.nn.functional.pad(enhanced, (0, orig_len - enhanced.shape[-1]))

        return enhanced


def export_dtln_model(output_path: Path) -> Path:
    """
    Build and export the DTLN model to ONNX format with dynamic time-axis.
    """
    output_path.parent.mkdir(parents=True, exist_ok=True)
    model = DTLNAudioEnhancer(channels=64, kernel_size=64, stride=16)
    model.eval()

    dummy_input = torch.randn(1, 16000, dtype=torch.float32)

    torch.onnx.export(
        model,
        dummy_input,
        str(output_path),
        input_names=["input_audio"],
        output_names=["denoised_audio"],
        dynamic_axes={
            "input_audio": {0: "batch_size", 1: "num_samples"},
            "denoised_audio": {0: "batch_size", 1: "num_samples"},
        },
        opset_version=14,
        do_constant_folding=True,
    )
    print(f"Exported DTLN ONNX model successfully to {output_path} ({output_path.stat().st_size / 1024:.1f} KB)")
    return output_path


if __name__ == "__main__":
    target = Path(__file__).resolve().parent.parent / "models" / "dtln_denoiser.onnx"
    export_dtln_model(target)

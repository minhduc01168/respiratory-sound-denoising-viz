// Matplotlib Magma Colormap Key Anchor Points (Normalized 0.0 to 1.0)
const MAGMA_STOPS = [
  { pos: 0.00, r: 0,   g: 0,   b: 4   }, // Dark purple/black
  { pos: 0.12, r: 28,  g: 16,  b: 68  },
  { pos: 0.25, r: 81,  g: 18,  b: 124 }, // Deep violet
  { pos: 0.38, r: 140, g: 41,  b: 129 },
  { pos: 0.50, r: 182, g: 54,  b: 121 }, // Magenta rose
  { pos: 0.65, r: 227, g: 89,  b: 86  }, // Coral red
  { pos: 0.78, r: 251, g: 136, b: 97  }, // Orange
  { pos: 0.90, r: 254, g: 195, b: 139 }, // Amber yellow
  { pos: 1.00, r: 252, g: 253, b: 191 }, // Bright pale yellow
];

// Precompute 256-entry RGB Lookup Table (LUT) for O(1) pixel color mapping
export const MAGMA_LUT = new Uint8ClampedArray(256 * 3);

for (let i = 0; i < 256; i++) {
  const t = i / 255.0;
  // Find segment
  let idx = 0;
  while (idx < MAGMA_STOPS.length - 2 && MAGMA_STOPS[idx + 1].pos < t) {
    idx++;
  }
  const s0 = MAGMA_STOPS[idx];
  const s1 = MAGMA_STOPS[idx + 1];
  const factor = (t - s0.pos) / (s1.pos - s0.pos);

  const r = Math.round(s0.r + (s1.r - s0.r) * factor);
  const g = Math.round(s0.g + (s1.g - s0.g) * factor);
  const b = Math.round(s0.b + (s1.b - s0.b) * factor);

  MAGMA_LUT[i * 3] = r;
  MAGMA_LUT[i * 3 + 1] = g;
  MAGMA_LUT[i * 3 + 2] = b;
}

/**
 * Returns [r, g, b] for a value in range [0.0, 1.0]
 */
export function getMagmaColor(val) {
  const clamped = Math.max(0, Math.min(255, Math.floor(val * 255)));
  const offset = clamped * 3;
  return [MAGMA_LUT[offset], MAGMA_LUT[offset + 1], MAGMA_LUT[offset + 2]];
}

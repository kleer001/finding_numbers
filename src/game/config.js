// All tuning + geometry in one pure-data module (no imports).

export const GRID = {
  W: 23, // cell width in characters (odd, so a 3-wide center band sits on col 11)
  H: 17, // cell height in characters
  CX: 11, // center column
  CY: 8, // center row
  HALF: 1, // corridor half-width -> 3-wide paths
};

export const CANVAS = { W: 800, H: 600 };

export const TRANSITION_MS = 260; // static-cut between cells (<= 300ms)

export const LANGUAGES = ["english", "spanish", "italian", "chinese", "japanese", "hindi"];

export const GLYPH = {
  WALL: "#",
  FLOOR: " ",
  PLAYER: "@",
  SOURCE: "*", // cycling win glyph slot in the source cell center
};

// Monochrome amber phosphor: one brightness for every glyph on screen, like a
// single-color CRT monitor (A_God_in_the_dark STYLE_GUIDE).
export const PALETTE = {
  bg: "#000000",
  mono: "#ffd257",
};

export const CRT_CONFIG = {
  barrelDistortion: 0.02,
  curvature: 0.02,
  chromaticAberration: 0.0009,
  staticNoise: 0.02,
  glowBloom: 0.004,
  scanlineIntensity: 0.35,
  desaturation: 0.15,
  flicker: 0.02,
  signalLoss: 0.04,
};

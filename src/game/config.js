// All tuning + geometry in one pure-data module (no imports).

export const GRID = {
  W: 23, // cell width in characters (odd, so a 3-wide center band sits on col 11)
  H: 17, // cell height in characters
  CX: 11, // center column
  CY: 8, // center row
  HALF: 1, // corridor half-width -> 3-wide paths
};

export const CANVAS = { W: 800, H: 600 };

// The whole screen is one uniform character grid, like text-mode hardware:
// the maze occupies the top GRID.H rows, the HUD the bottom HUD_ROWS. Every
// glyph on screen is CHAR.FONT px — one character size, no exceptions.
export const HUD_ROWS = 3;
export const SCREEN = { COLS: GRID.W, ROWS: GRID.H + HUD_ROWS }; // 23 x 20
export const CHAR = {
  W: CANVAS.W / SCREEN.COLS, // 34.78...
  H: CANVAS.H / SCREEN.ROWS, // 30
  FONT: Math.floor((CANVAS.H / SCREEN.ROWS) * 0.95), // 28
};

// HUD column budget: cols 0-4 status field (LVL / digits / count),
// cols 5-17 waterfall, cols 18-22 PREFS — every box on whole cells.
export const WATERFALL = { col: 5, row: GRID.H, cols: 13, rows: HUD_ROWS };

// Bottom-right boxed "PREFS" button — also the touch tap-target.
// Shared by input hit-testing and the HUD draw.
export const PREFS_BTN = { x: 18 * CHAR.W, y: 17 * CHAR.H, w: 5 * CHAR.W, h: 3 * CHAR.H };

export const TRANSITION_MS = 260; // static-cut between cells (<= 300ms)

export const LANGUAGES = ["english", "spanish", "italian", "chinese", "japanese", "hindi"];

export const GLYPH = {
  WALL: "#",
  FLOOR: " ",
  PLAYER: "@",
  SOURCE: "*", // cycling win glyph slot in the source cell center
};

// Monochrome phosphor: one brightness for every glyph on screen, like a
// single-color CRT monitor (A_God_in_the_dark STYLE_GUIDE).
export const PALETTE = {
  bg: "#000000",
  mono: "#ffd257",
};

// The two classic monochrome CRT phosphors. The TINT pref swaps the single
// on-screen color; `rgb` drives the tinted TV-static wash. Keys are the stored
// pref values.
export const TINTS = {
  amber: { fg: "#ffd257", rgb: [255, 210, 87] },
  green: { fg: "#5bf58a", rgb: [91, 245, 138] },
};

export const CRT_CONFIG = {
  barrelDistortion: 0.02,
  curvature: 0.02,
  chromaticAberration: 0.0009,
  staticNoise: 0.02,
  glowBloom: 0.004,
  scanlineIntensity: 0.45,
  dotMask: true, // faint aperture grille over the mono phosphor
  desaturation: 0.15,
  flicker: 0.02,
  signalLoss: 0.04,
  horizontalTearing: 0.00012,
  verticalJitter: 0.001,
};

// CRT NOISE pref: 0..5 lerps each field here from its CRT_CONFIG value (at 0)
// to this ceiling (at 5) — interlacing, static, and distortion crank together.
export const CRT_NOISE_MAX = {
  barrelDistortion: 0.05,
  chromaticAberration: 0.004,
  staticNoise: 0.2,
  glowBloom: 0.012,
  scanlineIntensity: 1.1,
  flicker: 0.09,
  signalLoss: 0.2,
  horizontalTearing: 0.002,
  verticalJitter: 0.004,
};

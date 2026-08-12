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
// The one font, self-hosted at assets/fonts/station-grid.woff2 (built by
// make_font.py: VT323 plus the block glyphs it lacks). Named once so the maze
// grid and the HUD can never drift onto different faces.
export const FONT_STACK = '"Station Grid", "Courier New", monospace';

export const CHAR = {
  W: CANVAS.W / SCREEN.COLS, // 34.78...
  H: CANVAS.H / SCREEN.ROWS, // 30
  FONT: Math.floor((CANVAS.H / SCREEN.ROWS) * 0.95), // 28
};

// HUD column budget: cols 0-4 status field (LVL / digits / count),
// cols 5-17 waterfall, cols 18-22 PREFS — every box on whole cells.
export const WATERFALL = { col: 5, row: GRID.H, cols: 13, rows: HUD_ROWS };

// Real shortwave frequencies (kHz) that famous number stations broadcast on —
// one is shown under the LV badge as radio-dial flavor. Every value here is a
// logged frequency for the station named beside it; listeners of these stations
// are the audience, so an invented number is a bug. Sources: UVB-76 "The
// Buzzer" 4625; Lincolnshire Poacher (E03) 11545; Cuban Atención (V02a) 7887
// and HM01 11530; Yosemite Sam 3700/4300/6500/10500; The Pip (S30) 5448 day /
// 3756 night; Squeaky Wheel (S32) 5367 current day, 5473 / 3828 its earlier
// day / night pair; The Goose 4310 day / 3243 night.
export const STATION_FREQS = [
  4625, 11545, 7887, 11530, 3700, 4300, 6500, 10500,
  5448, 3756, 3828, 5367, 5473, 4310, 3243,
];

// Cold-open banner shown in the waterfall strip until the first move. It
// flickers through this pool like a dial drifting across stations: index 0 is
// the plain instruction (always shown first) so the player knows what to do;
// the rest drift into station patter and foreign commands (move / listen /
// attention / begin — languages the station voices). The shipped face carries
// the accented Latin natively; Cyrillic falls back to a mono one and reads as a
// different, older transmitter under the CRT — kept deliberately. Each line must fit WATERFALL.cols wide, at
// most WATERFALL.rows lines.
export const INTRO_MESSAGES = [
  ["MOVE TO BEGIN"],
  ["STEP INTO", "THE SIGNAL"],
  ["FOLLOW THE", "NUMBERS"],
  ["WE HEAR YOU"],
  ["WE KNOW", "YOU HEAR US"],
  ["COUNT WITH US"],
  ["COME CLOSER"],
  ["DON'T STOP", "MOVING"],
  ["ARE YOU", "RECEIVING"],
  ["ATENCIÓN"],
  ["ACHTUNG"],
  ["READY READY"],
  ["GROUPS OF", "FIVE"],
  ["MESSAGE", "MESSAGE"],
  ["FOR YOU ONLY"],
  ["MUÉVETE"],
  ["ESCUCHA"],
  ["MUOVITI"],
  ["ASCOLTA"],
  ["HÖREN"],
  ["UGOKE"],
  ["KIKE"],
  ["HAJIME"],
  ["YIDONG"],
  ["ZHUYI"],
  ["CHALO"],
  ["SUNO"],
  ["SHURU"],
  ["ВНИМАНИЕ"],
  ["СЛУШАЙ"],
  ["ДВИГАЙСЯ"],
  ["МОНОЛИТ"],
  ["НАЧАЛО"],
  ["СООБЩЕНИЕ"],
  ["ГОТОВЬ"],
  ["ЖДИ"],
];

// Bottom-right boxed "PREFS" button — also the touch tap-target.
// Shared by input hit-testing and the HUD draw.
export const PREFS_BTN = { x: 18 * CHAR.W, y: 17 * CHAR.H, w: 5 * CHAR.W, h: 3 * CHAR.H };

export const TRANSITION_MS = 260; // static-cut between cells (<= 300ms)
export const WIN_WIPE_MS = 2000; // spiral-numbers wipe when stepping the source gate
export const WIN_BLACK_MS = 350; // blank screen held after the wipe, before the new level

export const LANGUAGES = ["english", "spanish", "german", "russian", "polish",
  "turkish", "arabic", "mandarin", "welsh", "georgian"];

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
};

// Ceiling of the 0..N integer dials (CRT NOISE, jukebox STATIC): the stored
// value, its clamp, and the 0..1 normalizers all read from here so they agree.
export const DIAL_MAX = 5;

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

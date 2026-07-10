// Quantized text-mode spectrogram: the waterfall is glyph cells like the rest
// of the screen, but on a half-cell sub-grid — a finer "graphics page" density
// inside the same strip. Time on X (one sub-column per ADVANCE_MS, peak-held
// between advances so short utterances still register), frequency on Y (low at
// the bottom), brightness on the block-gradient RAMP. VT323 lacks the block
// glyphs, but they're geometric fills, so the monospace fallback face renders
// them indistinguishably.

import { WATERFALL } from "../game/config.js";

export const RAMP = " ░▒▓█"; // 5 levels
export const VOICE_BAND = 0.32; // voice sits in the low FFT bins
export const SUB = 2; // sub-cells per character cell

const COLS = WATERFALL.cols * SUB;
const ROWS = WATERFALL.rows * SUB;
const ADVANCE_MS = 65; // half-width columns at twice the rate: same ~1.7s window

export function quantize(v) {
  return Math.min(RAMP.length - 1, Math.floor((v / 256) * RAMP.length));
}

// Split the voice band into `rows` bands and return each band's peak bin.
// Index 0 is the lowest frequency.
export function spectrumToColumn(spectrum, rows) {
  const cut = Math.floor(spectrum.length * VOICE_BAND);
  const col = [];
  for (let r = 0; r < rows; r++) {
    const a = Math.floor((cut * r) / rows);
    const b = Math.floor((cut * (r + 1)) / rows);
    let peak = 0;
    for (let i = a; i < b; i++) peak = Math.max(peak, spectrum[i]);
    col.push(peak);
  }
  return col;
}

let levels = null; // [cols][rows] ramp indices, persists so the strip scrolls
let acc = null; // per-band peak accumulated since the last advance
let lastAdvance = 0;

export function stepWaterfall(spectrum, now) {
  if (!levels) {
    levels = Array.from({ length: COLS }, () => Array(ROWS).fill(0));
    acc = Array(ROWS).fill(0);
    lastAdvance = now;
  }
  const col = spectrumToColumn(spectrum, ROWS);
  for (let r = 0; r < ROWS; r++) acc[r] = Math.max(acc[r], col[r]);
  if (now - lastAdvance >= ADVANCE_MS) {
    levels.shift();
    levels.push(acc.map(quantize));
    acc.fill(0);
    lastAdvance = now;
  }
  return levels;
}

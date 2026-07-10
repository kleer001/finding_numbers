// Quantized text-mode spectrogram: the waterfall is character cells on the
// same grid as the maze, not a raster. Time on X (one cell per ADVANCE_MS,
// peak-held between advances so short utterances still register), frequency
// on Y (one band per HUD row, low at the bottom), brightness on the RAMP.

import { WATERFALL } from "../game/config.js";

export const RAMP = " .:*#"; // 5 levels; VT323's latin subset has no block glyphs
export const VOICE_BAND = 0.32; // voice sits in the low FFT bins

const ADVANCE_MS = 130;

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
    levels = Array.from({ length: WATERFALL.cols }, () => Array(WATERFALL.rows).fill(0));
    acc = Array(WATERFALL.rows).fill(0);
    lastAdvance = now;
  }
  const col = spectrumToColumn(spectrum, WATERFALL.rows);
  for (let r = 0; r < WATERFALL.rows; r++) acc[r] = Math.max(acc[r], col[r]);
  if (now - lastAdvance >= ADVANCE_MS) {
    levels.shift();
    levels.push(acc.map(quantize));
    acc.fill(0);
    lastAdvance = now;
  }
  return levels;
}

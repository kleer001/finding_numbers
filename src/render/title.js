// Boot / title splash — a full-screen takeover in the same phosphor character
// mode as the game. The name renders as a two-line block banner built from
// half-cell rectangles (the waterfall's sub-cell technique), so seven-letter
// words fit the 23-column screen and still read as block letters. Two buttons:
// CONTINUE resumes the saved level, NEW restarts at level 1. Below the bezel
// sits the game's own three-section HUD bar: a scrolling station-frequency
// readout, the cold-open message banner, and the PREFS box. Design lifted from
// the sister repo's OVERRIDE 1983 title.

import { CANVAS, CHAR, GRID, HUD_ROWS, STATION_FREQS, PREFS_BTN } from "../game/config.js";
import { CADENCES } from "../game/levels.js";
import { renderIntroBanner } from "./render.js";

// 3x5 block font — only the glyphs FINDING NUMBERS needs. Rows top->bottom.
const GLYPH3 = {
  F: ["###", "#  ", "## ", "#  ", "#  "],
  I: ["###", " # ", " # ", " # ", "###"],
  N: ["# #", "###", "# #", "# #", "# #"],
  D: ["## ", "# #", "# #", "# #", "## "],
  G: ["###", "#  ", "# #", "# #", "###"],
  U: ["# #", "# #", "# #", "# #", "###"],
  M: ["# #", "###", "###", "# #", "# #"],
  B: ["## ", "# #", "## ", "# #", "## "],
  E: ["###", "#  ", "## ", "#  ", "###"],
  R: ["## ", "# #", "## ", "# #", "# #"],
  S: ["###", "#  ", "###", "  #", "###"],
};

const BP_W = CHAR.W / 2; // block pixel = half a character cell
const BP_H = CHAR.H / 2;
const GLYPH_COLS = 3;
const GLYPH_ROWS = 5;
const PITCH = (GLYPH_COLS + 1) * BP_W; // one blank column between letters

const wordWidth = (word) => word.length * PITCH - BP_W; // drop the trailing gap

function drawWord(ctx, word, topY) {
  const startX = (CANVAS.W - wordWidth(word)) / 2;
  for (let i = 0; i < word.length; i++) {
    const g = GLYPH3[word[i]];
    const gx = startX + i * PITCH;
    for (let r = 0; r < GLYPH_ROWS; r++) {
      for (let c = 0; c < GLYPH_COLS; c++) {
        // +1 so sub-cells tile with no seams (same trick as the waterfall)
        if (g[r][c] === "#") ctx.fillRect(gx + c * BP_W, topY + r * BP_H, BP_W + 1, BP_H + 1);
      }
    }
  }
}

// Buttons in whole grid cells: CONTINUE (wide) and NEW, side by side. Lifted
// above the bottom HUD bar so the three-section panel has room.
export const BTN_CONTINUE = { x: 2 * CHAR.W, y: 12 * CHAR.H, w: 11 * CHAR.W, h: 3 * CHAR.H, label: "[C]ONTINUE" };
export const BTN_NEW = { x: 15 * CHAR.W, y: 12 * CHAR.H, w: 6 * CHAR.W, h: 3 * CHAR.H, label: "[N]EW" };

const inside = (r, x, y) => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h;

// Map a canvas-space tap to a title action: 'continue' | 'new' | null.
export function titleHit(x, y) {
  if (inside(BTN_CONTINUE, x, y)) return "continue";
  if (inside(BTN_NEW, x, y)) return "new";
  return null;
}

function drawButton(ctx, b, tint) {
  ctx.strokeStyle = tint.fg;
  ctx.lineWidth = 2;
  ctx.strokeRect(b.x, b.y, b.w, b.h);
  ctx.fillStyle = tint.fg;
  ctx.fillText(b.label, b.x + b.w / 2, b.y + b.h / 2);
}

// Left HUD field (cols 0-4): the station frequencies scroll upward like a tuner
// sweeping the shortwave band, clipped to the 5x3 field.
const FREQ_PERIOD_MS = 900; // one frequency advances past per beat
function drawFreqScroll(ctx, tint, now) {
  const x = 0, y = GRID.H * CHAR.H, w = 5 * CHAR.W, h = HUD_ROWS * CHAR.H;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.fillStyle = tint.fg;
  ctx.font = `${CHAR.FONT}px VT323, "Courier New", monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const rows = now / FREQ_PERIOD_MS;
  const base = Math.floor(rows);
  const frac = (rows - base) * CHAR.H;
  const n = STATION_FREQS.length;
  for (let i = -1; i <= HUD_ROWS; i++) {
    const f = STATION_FREQS[(((base + i) % n) + n) % n];
    ctx.fillText(String(f), x + w / 2, y + i * CHAR.H - frac + CHAR.H / 2);
  }
  ctx.restore();
}

// Right HUD field (cols 18-22): the PREFS box, one letter per cell — same draw
// as the in-game HUD so the panel reads identically.
function drawPrefsBox(ctx, tint) {
  const b = PREFS_BTN;
  ctx.strokeStyle = tint.fg;
  ctx.lineWidth = 2;
  ctx.strokeRect(b.x, b.y, b.w, b.h);
  ctx.fillStyle = tint.fg;
  ctx.font = `${CHAR.FONT}px VT323, "Courier New", monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const label = "PREFS";
  for (let i = 0; i < label.length; i++) {
    ctx.fillText(label[i], (18 + i) * CHAR.W + CHAR.W / 2, 18 * CHAR.H + CHAR.H / 2);
  }
}

export function renderTitle(ctx, tint, level, now) {
  ctx.fillStyle = tint.bg;
  ctx.fillRect(0, 0, CANVAS.W, CANVAS.H);

  // Bezel frames the title + buttons only; the HUD bar sits below it.
  ctx.strokeStyle = tint.fg;
  ctx.lineWidth = 2;
  ctx.strokeRect(CHAR.W * 0.5, CHAR.H * 0.5, CANVAS.W - CHAR.W, 16 * CHAR.H);

  ctx.fillStyle = tint.fg;
  drawWord(ctx, "FINDING", 2 * CHAR.H);
  drawWord(ctx, "NUMBERS", 2 * CHAR.H + (GLYPH_ROWS + 1) * BP_H); // one blank block-row between

  ctx.font = `${CHAR.FONT}px VT323, "Courier New", monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  if (level > 1) ctx.fillText(`RESUME - LEVEL ${level}`, CANVAS.W / 2, 9.5 * CHAR.H);

  drawButton(ctx, BTN_CONTINUE, tint);
  drawButton(ctx, BTN_NEW, tint);

  // The game's three-section HUD bar underneath.
  drawFreqScroll(ctx, tint, now);
  renderIntroBanner(ctx, tint, now, CADENCES.CALM);
  drawPrefsBox(ctx, tint);
}

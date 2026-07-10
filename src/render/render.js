// Draws the current cell as a monospace glyph grid, the @ overlay, and the HUD.
// Everything is one phosphor color at one brightness: a monochrome monitor.

import { GRID, CANVAS, PALETTE, GLYPH, PREFS_BTN } from "../game/config.js";

const HUD_H = 96; // reserved band at the bottom for the waterfall + badges
const cellW = CANVAS.W / GRID.W;
const cellH = (CANVAS.H - HUD_H) / GRID.H;
const fontPx = Math.floor(cellH * 0.95);

// Bottom-strip waterfall (scrolling spectrogram): time on X, frequency on Y.
const WATERFALL = { x: 132, y: 510, w: 496, h: 80 };
let wfCanvas = null; // persists across frames so the spectrogram can scroll
let wfCtx = null;

function ensureWaterfall() {
  if (wfCanvas) return;
  wfCanvas = document.createElement("canvas");
  wfCanvas.width = WATERFALL.w;
  wfCanvas.height = WATERFALL.h;
  wfCtx = wfCanvas.getContext("2d", { willReadFrequently: true });
  wfCtx.fillStyle = PALETTE.bg;
  wfCtx.fillRect(0, 0, WATERFALL.w, WATERFALL.h);
}

function drawGlyph(ctx, ch, gx, gy) {
  ctx.fillText(ch, gx * cellW + cellW / 2, gy * cellH + cellH / 2);
}

// `tint` is the current phosphor {fg, rgb}; `spectrum` is the live FFT bins.
export function render(ctx, state, showCount, tint, spectrum) {
  ctx.fillStyle = PALETTE.bg;
  ctx.fillRect(0, 0, CANVAS.W, CANVAS.H);

  ctx.fillStyle = tint.fg;
  ctx.font = `${fontPx}px VT323, "Courier New", monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const cell = state.cell;
  for (let y = 0; y < GRID.H; y++) {
    for (let x = 0; x < GRID.W; x++) {
      const ch = cell.grid[y][x];
      if (ch === GLYPH.WALL) drawGlyph(ctx, cell.wallGlyph ?? GLYPH.WALL, x, y);
      else if (ch === GLYPH.SOURCE) drawGlyph(ctx, state.sourceGlyph ?? "*", x, y);
      // floor left blank (void) for a stark corridor read
    }
  }
  drawGlyph(ctx, GLYPH.PLAYER, state.player.x, state.player.y);

  renderHud(ctx, state, showCount, tint, spectrum);
}

function renderHud(ctx, state, showCount, tint, spectrum) {
  ctx.textBaseline = "alphabetic";

  drawWaterfall(ctx, spectrum, tint);
  drawLevelBadge(ctx, state.level ?? 1, tint.fg);

  // Numbers readout under the LVL badge (SHOW NUMBERS): revealed digits + count.
  if (showCount) {
    ctx.fillStyle = tint.fg;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    const digits = (state.audibleDigits ?? []).map((e) => e.digit).join("");
    ctx.font = `26px VT323, "Courier New", monospace`;
    ctx.fillText(digits || "—", 14, 576);
    ctx.font = `20px VT323, "Courier New", monospace`;
    ctx.fillText(`${state.score ?? 0} / ${state.goal ?? "?"}`, 14, 596);
  }

  // Bottom-right preferences button: a bordered "PREFS" box that is also the
  // touch tap-target (see PREFS_BTN / tapZone), easy to hit on a phone.
  const b = PREFS_BTN;
  ctx.strokeStyle = tint.fg;
  ctx.lineWidth = 2;
  ctx.strokeRect(b.x, b.y, b.w, b.h);
  ctx.fillStyle = tint.fg;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `30px VT323, "Courier New", monospace`;
  ctx.fillText("PREFS", b.x + b.w / 2, b.y + b.h / 2 + 2);
  ctx.textBaseline = "alphabetic";
}

// Scroll the spectrogram left one column and paint the newest spectrum slice at
// the right edge, tinted to the phosphor; then blit it into the HUD strip.
function drawWaterfall(ctx, spectrum, tint) {
  ensureWaterfall();
  const W = WATERFALL.w, H = WATERFALL.h;
  const [r, g, b] = tint.rgb;
  wfCtx.drawImage(wfCanvas, -1, 0);
  const col = wfCtx.createImageData(1, H);
  const bins = Math.floor(spectrum.length * 0.32); // voice band sits low in the FFT
  for (let y = 0; y < H; y++) {
    const m = (spectrum[Math.floor((1 - y / H) * bins)] || 0) / 255; // low freq at bottom
    const o = y * 4;
    col.data[o] = r * m;
    col.data[o + 1] = g * m;
    col.data[o + 2] = b * m;
    col.data[o + 3] = 255;
  }
  wfCtx.putImageData(col, W - 1, 0);

  ctx.drawImage(wfCanvas, WATERFALL.x, WATERFALL.y);
  ctx.strokeStyle = tint.fg;
  ctx.lineWidth = 1;
  ctx.strokeRect(WATERFALL.x - 0.5, WATERFALL.y - 0.5, W + 1, H + 1);
}

// Reverse-video level badge, bottom-left: phosphor-filled box, dark letters.
function drawLevelBadge(ctx, level, mono) {
  const label = `LVL ${level}`;
  const h = 40;
  const padX = 12;
  ctx.font = `${Math.floor(h * 0.66)}px VT323, "Courier New", monospace`;
  const w = Math.ceil(ctx.measureText(label).width) + padX * 2;
  const x = 12;
  const y = WATERFALL.y; // top-aligned with the waterfall strip
  ctx.fillStyle = mono;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = PALETTE.bg;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(label, x + padX, y + h / 2 + 1);
  ctx.textBaseline = "alphabetic";
}

// Full-screen TV-static wash used during a cell transition. `t` in [0,1].
// `rgb` tints the static to the current phosphor (amber/green).
export function renderStatic(ctx, t, rgb) {
  const rm = rgb[0] / 255, gm = rgb[1] / 255, bm = rgb[2] / 255;
  const img = ctx.createImageData(CANVAS.W, CANVAS.H);
  const d = img.data;
  const bias = 90 * (1 - Math.abs(0.5 - t) * 2); // brightest at mid-transition
  for (let i = 0; i < d.length; i += 4) {
    const v = Math.random() * 160 + bias;
    d[i] = (v * rm) | 0;
    d[i + 1] = (v * gm) | 0;
    d[i + 2] = (v * bm) | 0;
    d[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
}

// Draws the whole screen as one monospace glyph grid — maze on top, HUD on
// the bottom rows — every glyph the same CHAR.FONT size in one phosphor
// color at one brightness: a character-mode monochrome monitor.

import { GRID, CANVAS, PALETTE, GLYPH, PREFS_BTN, CHAR, WATERFALL } from "../game/config.js";
import { RAMP, SUB, stepWaterfall } from "./waterfall.js";

function drawGlyph(ctx, ch, gx, gy) {
  ctx.fillText(ch, gx * CHAR.W + CHAR.W / 2, gy * CHAR.H + CHAR.H / 2);
}

function drawText(ctx, str, col, row) {
  for (let i = 0; i < str.length; i++) drawGlyph(ctx, str[i], col + i, row);
}

// `tint` is the current phosphor {fg, rgb}; `spectrum` is the live FFT bins.
export function render(ctx, state, showCount, tint, spectrum, now) {
  ctx.fillStyle = PALETTE.bg;
  ctx.fillRect(0, 0, CANVAS.W, CANVAS.H);

  ctx.fillStyle = tint.fg;
  ctx.font = `${CHAR.FONT}px VT323, "Courier New", monospace`; // the ONE font
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

  renderHud(ctx, state, showCount, tint, spectrum, now);
}

// HUD rows 17-19: status field cols 0-4, waterfall cols 5-17, PREFS 18-22.
function renderHud(ctx, state, showCount, tint, spectrum, now) {
  drawWaterfall(ctx, spectrum, tint, now);
  drawLevelBadge(ctx, state.level ?? 1, tint.fg);

  // Digits readout + count under the LVL badge (SHOW NUMBERS). Natural glyph
  // advance instead of per-cell tracking: 23 columns is too few for prose.
  if (showCount) {
    ctx.fillStyle = tint.fg;
    ctx.textAlign = "left";
    const digits = (state.audibleDigits ?? []).map((e) => e.digit).join("");
    ctx.fillText(digits || "—", 6, 18.5 * CHAR.H);
    ctx.fillText(`${state.score ?? 0} / ${state.goal ?? "?"}`, 6, 19.5 * CHAR.H);
    ctx.textAlign = "center";
  }

  // Bottom-right preferences button: a bordered "PREFS" box that is also the
  // touch tap-target (see PREFS_BTN / tapZone), one letter per cell.
  const b = PREFS_BTN;
  ctx.strokeStyle = tint.fg;
  ctx.lineWidth = 2;
  ctx.strokeRect(b.x, b.y, b.w, b.h);
  ctx.fillStyle = tint.fg;
  drawText(ctx, "PREFS", 18, 18);
}

// Scrolling text-mode spectrogram in the middle of the HUD band. Block glyphs
// on a half-cell sub-grid: a graphics element, so it alone drops to half size.
function drawWaterfall(ctx, spectrum, tint, now) {
  const wf = stepWaterfall(spectrum, now);
  const rows = WATERFALL.rows * SUB;
  ctx.fillStyle = tint.fg;
  ctx.font = `${CHAR.FONT / 2}px VT323, "Courier New", monospace`;
  for (let c = 0; c < wf.length; c++) {
    for (let r = 0; r < rows; r++) {
      const lv = wf[c][rows - 1 - r]; // low freq at the bottom row
      if (lv === 0) continue;
      ctx.fillText(
        RAMP[lv],
        (WATERFALL.col + (c + 0.5) / SUB) * CHAR.W,
        (WATERFALL.row + (r + 0.5) / SUB) * CHAR.H,
      );
    }
  }
  ctx.font = `${CHAR.FONT}px VT323, "Courier New", monospace`;
  ctx.strokeStyle = tint.fg;
  ctx.lineWidth = 1;
  ctx.strokeRect(
    WATERFALL.col * CHAR.W - 0.5,
    WATERFALL.row * CHAR.H - 0.5,
    WATERFALL.cols * CHAR.W + 1,
    WATERFALL.rows * CHAR.H + 1,
  );
}

// Reverse-video level badge: phosphor-filled top HUD row of the status field,
// dark letters, one per cell.
function drawLevelBadge(ctx, level, mono) {
  const label = `LV ${level}`;
  ctx.fillStyle = mono;
  ctx.fillRect(0, GRID.H * CHAR.H, 5 * CHAR.W, CHAR.H);
  ctx.fillStyle = PALETTE.bg;
  drawText(ctx, label, Math.floor((5 - label.length) / 2), GRID.H);
}

// Full-screen TV-static wash used during a cell transition. `t` in [0,1].
// `rgb` tints the static to the current phosphor (amber/green). Snow is
// quantized into 2x2 blocks at 4 brightness levels — coarse, like the rest
// of the constrained screen.
export function renderStatic(ctx, t, rgb) {
  const rm = rgb[0] / 255, gm = rgb[1] / 255, bm = rgb[2] / 255;
  const img = ctx.createImageData(CANVAS.W, CANVAS.H);
  const d = img.data;
  const bias = 90 * (1 - Math.abs(0.5 - t) * 2); // brightest at mid-transition
  for (let y = 0; y < CANVAS.H; y += 2) {
    for (let x = 0; x < CANVAS.W; x += 2) {
      const v = (((Math.random() * 160 + bias) / 64) | 0) * 64;
      const r = (v * rm) | 0, g = (v * gm) | 0, b = (v * bm) | 0;
      for (const o of [(y * CANVAS.W + x) * 4, (y * CANVAS.W + x + 1) * 4, ((y + 1) * CANVAS.W + x) * 4, ((y + 1) * CANVAS.W + x + 1) * 4]) {
        d[o] = r;
        d[o + 1] = g;
        d[o + 2] = b;
        d[o + 3] = 255;
      }
    }
  }
  ctx.putImageData(img, 0, 0);
}

// Draws the current cell as a monospace glyph grid, the @ overlay, and the HUD.
// Everything is one phosphor color at one brightness: a monochrome monitor.

import { GRID, CANVAS, PALETTE, GLYPH } from "../game/config.js";

const HUD_H = 60; // reserved band at the bottom for the readout + controls
const cellW = CANVAS.W / GRID.W;
const cellH = (CANVAS.H - HUD_H) / GRID.H;
const fontPx = Math.floor(cellH * 0.95);
const MONO = PALETTE.mono;

function drawGlyph(ctx, ch, gx, gy) {
  ctx.fillText(ch, gx * cellW + cellW / 2, gy * cellH + cellH / 2);
}

export function render(ctx, state, showCount) {
  ctx.fillStyle = PALETTE.bg;
  ctx.fillRect(0, 0, CANVAS.W, CANVAS.H);

  ctx.fillStyle = MONO;
  ctx.font = `${fontPx}px VT323, "Courier New", monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const cell = state.cell;
  for (let y = 0; y < GRID.H; y++) {
    for (let x = 0; x < GRID.W; x++) {
      const ch = cell.grid[y][x];
      if (ch === GLYPH.WALL) drawGlyph(ctx, "#", x, y);
      else if (ch === GLYPH.SOURCE) drawGlyph(ctx, state.sourceGlyph ?? "*", x, y);
      // floor left blank (void) for a stark corridor read
    }
  }
  drawGlyph(ctx, GLYPH.PLAYER, state.player.x, state.player.y);

  renderHud(ctx, state, showCount);
}

function renderHud(ctx, state, showCount) {
  ctx.fillStyle = MONO;
  ctx.textBaseline = "alphabetic";

  if (showCount) {
    const digits = (state.audibleDigits ?? []).map((e) => e.digit).join(" ");
    ctx.font = `${Math.floor(HUD_H * 0.4)}px VT323, "Courier New", monospace`;
    ctx.textAlign = "left";
    ctx.fillText(`TRANSMISSION  ${digits || "—"}`, 16, CANVAS.H - 34);
    ctx.textAlign = "right";
    ctx.fillText(`${state.score ?? 0} / ${state.goal ?? "?"}`, CANVAS.W - 16, CANVAS.H - 34);
  }

  ctx.font = `${Math.floor(HUD_H * 0.26)}px VT323, "Courier New", monospace`;
  ctx.textAlign = "center";
  ctx.fillText("ARROWS / WASD / HJKL MOVE  ·  C CRT  ·  P PREFS", CANVAS.W / 2, CANVAS.H - 10);

  // Top-right preferences button (also a touch tap-target); level top-left.
  ctx.font = `${Math.floor(HUD_H * 0.5)}px VT323, "Courier New", monospace`;
  ctx.textAlign = "right";
  ctx.fillText("[P]", CANVAS.W - 16, 34);
  ctx.textAlign = "left";
  ctx.fillText(`LVL ${state.level ?? 1}`, 16, 34);
}

// Full-screen TV-static wash used during a cell transition. `t` in [0,1].
export function renderStatic(ctx, t) {
  const img = ctx.createImageData(CANVAS.W, CANVAS.H);
  const d = img.data;
  const bias = 90 * (1 - Math.abs(0.5 - t) * 2); // brightest at mid-transition
  for (let i = 0; i < d.length; i += 4) {
    const v = (Math.random() * 160 + bias) | 0;
    d[i] = v; // amber-tinted static: strong R, mid G, low B
    d[i + 1] = (v * 0.7) | 0;
    d[i + 2] = (v * 0.15) | 0;
    d[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
}

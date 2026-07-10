// Preferences overlay, drawn on the canvas (so the CRT shader treats it) in the
// same monochrome phosphor as everything else. Navigated with up/down (select
// row) and left/right (change value); P closes.

import { CANVAS, PALETTE } from "../game/config.js";

const MONO = PALETTE.mono;

export const MENU_ROWS = ["CRT FX", "SHOW NUMBERS"];

export function menuValue(row, prefs) {
  if (row === 0) return prefs.crt ? "ON" : "OFF";
  return prefs.showCount ? "ON" : "OFF";
}

export function renderMenu(ctx, index, prefs) {
  const w = 520;
  const h = 300;
  const x = (CANVAS.W - w) / 2;
  const y = (CANVAS.H - h) / 2;

  ctx.fillStyle = PALETTE.bg;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = MONO;
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);

  ctx.fillStyle = MONO;
  ctx.textBaseline = "alphabetic";

  ctx.font = `40px VT323, "Courier New", monospace`;
  ctx.textAlign = "center";
  ctx.fillText("PREFERENCES", CANVAS.W / 2, y + 56);

  ctx.font = `30px VT323, "Courier New", monospace`;
  MENU_ROWS.forEach((label, i) => {
    const ry = y + 110 + i * 46;
    ctx.textAlign = "left";
    ctx.fillText(`${i === index ? ">" : " "} ${label}`, x + 40, ry);
    ctx.textAlign = "right";
    ctx.fillText(menuValue(i, prefs), x + w - 40, ry);
  });

  ctx.font = `22px VT323, "Courier New", monospace`;
  ctx.textAlign = "center";
  ctx.fillText("↑↓ SELECT   ←→ CHANGE   P CLOSE", CANVAS.W / 2, y + h - 26);
}

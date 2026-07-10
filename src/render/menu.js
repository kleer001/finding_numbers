// Preferences overlay, drawn on the canvas (so the CRT shader treats it) in the
// same monochrome phosphor — and the same single character size — as everything
// else. Rows are generic {label, value} pairs supplied by main.js. Fully
// tappable: each row has < and > stepper zones, [X] (or anywhere outside the
// panel) closes. Keyboard still works: up/down select, left/right change,
// P closes.

import { CANVAS, PALETTE, CHAR, GRID, SCREEN } from "../game/config.js";

const PANEL_COLS = 19; // whole columns, so the panel snaps to the grid
const PANEL_W = PANEL_COLS * CHAR.W;
const ROW_H = 2 * CHAR.H;
const PAD = 28;
const TITLE_H = 2 * CHAR.H;
const FOOTER_H = 2 * CHAR.H;
const ARROW_W = 96; // tap zone width for each < > stepper
const CLOSE = 48; // [X] tap box edge

// Title + footer + 2-row pitch make the panel a whole number of grid rows,
// centered over the maze band (never the HUD, which stays live underneath).
export function layout(rowCount) {
  const panelRows = 4 + 2 * rowCount;
  const h = panelRows * CHAR.H;
  const y = Math.round((GRID.H - panelRows) / 2) * CHAR.H;
  return { x: ((SCREEN.COLS - PANEL_COLS) / 2) * CHAR.W, y, w: PANEL_W, h };
}

function rowRect(box, i) {
  return { x: box.x + PAD, y: box.y + TITLE_H + i * ROW_H, w: box.w - PAD * 2, h: ROW_H };
}

const inside = (r, x, y) => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h;

// Map a canvas-space tap to a menu action:
//   {type:'close'} | {type:'change', row, delta} | null (tap eaten by panel chrome)
export function menuHit(x, y, rowCount) {
  const box = layout(rowCount);
  if (!inside(box, x, y)) return { type: "close" };
  if (inside({ x: box.x + box.w - CLOSE - 10, y: box.y + 10, w: CLOSE, h: CLOSE }, x, y)) {
    return { type: "close" };
  }
  for (let i = 0; i < rowCount; i++) {
    const r = rowRect(box, i);
    if (!inside(r, x, y)) continue;
    // dec zone hugs the < glyph; the value itself and > both increment
    const delta = x >= r.x + r.w - 2 * ARROW_W && x < r.x + r.w - ARROW_W * 1.2 ? -1 : 1;
    return { type: "change", row: i, delta };
  }
  return null;
}

export function renderMenu(ctx, index, rows, mono) {
  const box = layout(rows.length);

  ctx.fillStyle = PALETTE.bg;
  ctx.fillRect(box.x, box.y, box.w, box.h);
  ctx.strokeStyle = mono;
  ctx.lineWidth = 2;
  ctx.strokeRect(box.x, box.y, box.w, box.h);

  ctx.fillStyle = mono;
  ctx.font = `${CHAR.FONT}px VT323, "Courier New", monospace`; // same ONE size
  ctx.textBaseline = "middle";

  ctx.textAlign = "center";
  ctx.fillText("PREFERENCES", CANVAS.W / 2, box.y + TITLE_H / 2);
  ctx.textAlign = "right";
  ctx.fillText("[X]", box.x + box.w - 18, box.y + TITLE_H / 2);

  rows.forEach((row, i) => {
    const r = rowRect(box, i);
    const cy = r.y + r.h / 2;
    ctx.textAlign = "left";
    ctx.fillText(`${i === index ? ">" : " "} ${row.label}`, r.x + 8, cy);
    // value strip: [<] value [>], each arrow a big tap zone; arrows drawn at
    // the outer edge of their zones so long values (SUSPENDED) don't collide
    ctx.textAlign = "center";
    ctx.fillText("<", r.x + r.w - ARROW_W * 1.7, cy);
    ctx.fillText(row.value, r.x + r.w - ARROW_W, cy);
    ctx.fillText(">", r.x + r.w - ARROW_W * 0.3, cy);
  });

  ctx.textAlign = "center";
  ctx.fillText("< > CHANGE - P CLOSES", CANVAS.W / 2, box.y + box.h - FOOTER_H / 2);
}

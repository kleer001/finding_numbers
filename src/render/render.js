// Draws the whole screen as one monospace glyph grid — maze on top, HUD on
// the bottom rows — every glyph the same CHAR.FONT size in one phosphor
// color at one brightness: a character-mode monochrome monitor.

import { GRID, CANVAS, GLYPH, PREFS_BTN, CHAR, WATERFALL, INTRO_MESSAGES, SIGNAL_LOST_MESSAGES } from "../game/config.js";
import { RAMP, SUB, stepWaterfall } from "./waterfall.js";

function drawGlyph(ctx, ch, gx, gy) {
  ctx.fillText(ch, gx * CHAR.W + CHAR.W / 2, gy * CHAR.H + CHAR.H / 2);
}

function drawText(ctx, str, col, row) {
  for (let i = 0; i < str.length; i++) drawGlyph(ctx, str[i], col + i, row);
}

// `tint` is the current phosphor {fg, rgb}; `spectrum` is the live FFT bins.
export function render(ctx, state, showCount, tint, spectrum, now) {
  ctx.fillStyle = tint.bg;
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
  if (state.started) drawWaterfall(ctx, spectrum, tint, now);
  else drawIntroBanner(ctx, tint, now, state.spec.interval);
  drawLevelBadge(ctx, state.level ?? 1, tint);

  // Digits readout + count under the LVL badge (SHOW NUMBERS). Natural glyph
  // advance instead of per-cell tracking: 23 columns is too few for prose.
  if (showCount) {
    ctx.fillStyle = tint.fg;
    ctx.textAlign = "left";
    const digits = (state.audibleDigits ?? []).map((e) => e.digit).join("");
    ctx.fillText(digits || "—", 6, 18.5 * CHAR.H);
    ctx.fillText(`${state.score ?? 0} / ${state.goal ?? "?"}`, 6, 19.5 * CHAR.H);
    ctx.textAlign = "center";
  } else {
    // Idle status field: a number-station dial reading, freq on 18, unit on 19.
    ctx.fillStyle = tint.fg;
    const freq = String(state.frequency ?? "");
    drawText(ctx, freq, Math.floor((5 - freq.length) / 2), 18);
    drawText(ctx, "kHz", 1, 19);
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

// Scrolling text-mode spectrogram in the middle of the HUD band. Solid filled
// sub-cells on a half-cell grid — brightness rides globalAlpha up the RAMP.
// (Block glyphs render far narrower than a sub-cell, so they left column gaps.)
function drawWaterfall(ctx, spectrum, tint, now) {
  const wf = stepWaterfall(spectrum, now);
  const rows = WATERFALL.rows * SUB;
  const cw = CHAR.W / SUB;
  const ch = CHAR.H / SUB;
  ctx.fillStyle = tint.fg;
  for (let c = 0; c < wf.length; c++) {
    for (let r = 0; r < rows; r++) {
      const lv = wf[c][rows - 1 - r]; // low freq at the bottom row
      if (lv === 0) continue;
      ctx.globalAlpha = lv / (RAMP.length - 1);
      ctx.fillRect(
        WATERFALL.col * CHAR.W + c * cw,
        WATERFALL.row * CHAR.H + r * ch,
        cw + 1, // +1 overlap so sub-cells tile with no seams
        ch + 1,
      );
    }
  }
  ctx.globalAlpha = 1;
  waterfallFrame(ctx, tint);
}

function waterfallFrame(ctx, tint) {
  ctx.strokeStyle = tint.fg;
  ctx.lineWidth = 1;
  ctx.strokeRect(
    WATERFALL.col * CHAR.W - 0.5,
    WATERFALL.row * CHAR.H - 0.5,
    WATERFALL.cols * CHAR.W + 1,
    WATERFALL.rows * CHAR.H + 1,
  );
}

// Cold-open banner: flicker through INTRO_MESSAGES in the waterfall box until
// the first move. Each message holds for one digit-readout beat (the same
// quantized-random cadence the station speaks numbers at, see station.js), so
// the banner drifts in time with how the station would be reading the signal.
let introLines = null;
let introSwitchAt = 0;

function introHold(interval) {
  const { min, max, step } = interval;
  const steps = Math.floor((max - min) / step);
  return min + step * ((Math.random() * (steps + 1)) | 0);
}

function drawIntroBanner(ctx, tint, now, interval) {
  if (introLines === null) {
    introLines = INTRO_MESSAGES[0]; // open on the plain instruction
    introSwitchAt = now + introHold(interval);
  } else if (now >= introSwitchAt) {
    let next;
    do {
      next = INTRO_MESSAGES[Math.floor(Math.random() * INTRO_MESSAGES.length)];
    } while (next === introLines);
    introLines = next;
    introSwitchAt = now + introHold(interval);
  }
  ctx.fillStyle = tint.fg;
  const top = WATERFALL.row + Math.floor((WATERFALL.rows - introLines.length) / 2);
  for (let i = 0; i < introLines.length; i++) {
    const line = introLines[i];
    const col = WATERFALL.col + Math.floor((WATERFALL.cols - line.length) / 2);
    drawText(ctx, line, col, top + i);
  }
  waterfallFrame(ctx, tint);
}

// Jukebox mode backdrop: a clean themed screen with the live spectrum waterfall
// as a "now playing" spectrogram under the picker panel (drawn by renderMenu).
export function renderJukebox(ctx, tint, spectrum, now) {
  ctx.fillStyle = tint.bg;
  ctx.fillRect(0, 0, CANVAS.W, CANVAS.H);
  drawWaterfall(ctx, spectrum, tint, now);
}

// Server heartbeat failed: a full-width lost-signal bar across screen center,
// drawn over whatever the loop last rendered. Flickers randomly through
// SIGNAL_LOST_MESSAGES (English tag + "signal lost" in the station's languages)
// and blinks, like a dying relay hunting for the carrier.
let lostPhrase = null;
let lostSwitchAt = 0;

export function renderLostConnection(ctx, tint, now) {
  const row = GRID.CY;
  ctx.fillStyle = tint.bg;
  ctx.fillRect(0, (row - 1) * CHAR.H, CANVAS.W, 3 * CHAR.H);
  ctx.strokeStyle = tint.fg;
  ctx.lineWidth = 2;
  ctx.strokeRect(1, (row - 1) * CHAR.H + 1, CANVAS.W - 2, 3 * CHAR.H - 2);
  if (lostPhrase === null || now >= lostSwitchAt) {
    let next;
    do {
      next = SIGNAL_LOST_MESSAGES[Math.floor(Math.random() * SIGNAL_LOST_MESSAGES.length)];
    } while (next === lostPhrase && SIGNAL_LOST_MESSAGES.length > 1);
    lostPhrase = next;
    lostSwitchAt = now + 450 + Math.random() * 450; // ~0.45-0.9s per language
  }
  if (Math.floor(now / 300) % 2) return; // blink: text off half the time
  ctx.fillStyle = tint.fg;
  ctx.font = `${CHAR.FONT}px VT323, "Courier New", monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  drawText(ctx, lostPhrase, Math.floor((GRID.W - lostPhrase.length) / 2), row);
}

// Reverse-video level badge: ink-filled top HUD row of the status field,
// page-colored letters, one per cell.
function drawLevelBadge(ctx, level, tint) {
  const label = `LV ${level}`;
  ctx.fillStyle = tint.fg;
  ctx.fillRect(0, GRID.H * CHAR.H, 5 * CHAR.W, CHAR.H);
  ctx.fillStyle = tint.bg;
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

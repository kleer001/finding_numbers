// Draws the whole screen as one monospace glyph grid — maze on top, HUD on
// the bottom rows — every glyph the same CHAR.FONT size in one phosphor
// color at one brightness: a character-mode monochrome monitor.

import { GRID, CANVAS, GLYPH, PREFS_BTN, CHAR, SCREEN, WATERFALL, INTRO_MESSAGES, SIGNAL_LOST_MESSAGES } from "../game/config.js";
import { RAMP, SUB, stepWaterfall } from "./waterfall.js";
import { pickInterval } from "../game/levels.js";

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
  return pickInterval(interval);
}

// Draw the cold-open banner standalone (title splash reuses it, so the same
// message pool and flicker state drive both). Sets the shared font/alignment
// the in-game caller already has set.
export function renderIntroBanner(ctx, tint, now, interval) {
  ctx.font = `${CHAR.FONT}px VT323, "Courier New", monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  drawIntroBanner(ctx, tint, now, interval);
}

// Clear the flicker state so the next draw re-opens on the plain instruction at
// the live clock. The burn-in sampler advances this state with its own clock and
// calls this afterwards to hand a clean banner back to the live loop.
export function resetIntroBanner() {
  introLines = null;
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

// Level-complete wipe: a spiral arm of changing numbers sweeps outward from the
// number gate at screen center. Behind the arm (swept interior) is the incoming
// level; ahead of it (outside) the outgoing level still shows — the arm is the
// seam between them. `t` in [0,1]; `oldCanvas`/`newCanvas` are full-screen
// snapshots of the two levels. Only the source-step win uses this.
const WIPE_TURNS = 2.5; // default spiral arms swept before the screen is full
const WIPE_MAXR = 16; // cells from center to the far corner of the 23x20 grid
const WIPE_BAND = 0.09; // thickness of the number arm, in spiral-phase units

// Spiral coordinate of a cell: grows outward, twisted by angle into arms.
function wipePhase(x, y, turns) {
  const dx = x - GRID.CX;
  const dy = y - GRID.CY;
  const d = Math.hypot(dx, dy) / WIPE_MAXR;
  const a = Math.atan2(dy, dx) / (2 * Math.PI); // -0.5..0.5
  return d - a / turns;
}

export function renderSpiralWipe(ctx, t, tint, now, oldCanvas, newCanvas, turns = WIPE_TURNS) {
  ctx.drawImage(oldCanvas, 0, 0); // outgoing level is the base

  const pMin = -0.5 / turns;
  const pMax = 1 + 0.5 / turns;
  const front = pMin + t * (pMax - pMin);

  // Reveal the incoming level in the swept interior: clip to swept cells, one blit.
  ctx.save();
  ctx.beginPath();
  let anySwept = false;
  for (let y = 0; y < SCREEN.ROWS; y++) {
    for (let x = 0; x < SCREEN.COLS; x++) {
      if (front - wipePhase(x, y, turns) >= WIPE_BAND) {
        ctx.rect(x * CHAR.W, y * CHAR.H, CHAR.W + 1, CHAR.H + 1);
        anySwept = true;
      }
    }
  }
  if (anySwept) {
    ctx.clip();
    ctx.drawImage(newCanvas, 0, 0);
  }
  ctx.restore();

  // The changing-number arm riding the spiral front, between the two levels.
  ctx.font = `${CHAR.FONT}px VT323, "Courier New", monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const frame = Math.floor(now / 70); // digit shimmer
  for (let y = 0; y < SCREEN.ROWS; y++) {
    for (let x = 0; x < SCREEN.COLS; x++) {
      const age = front - wipePhase(x, y, turns);
      if (age < 0 || age >= WIPE_BAND) continue;
      ctx.fillStyle = tint.bg;
      ctx.fillRect(x * CHAR.W, y * CHAR.H, CHAR.W + 1, CHAR.H + 1);
      ctx.fillStyle = tint.fg;
      drawGlyph(ctx, String((x * 7 + y * 13 + frame) % 10), x, y);
    }
  }
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

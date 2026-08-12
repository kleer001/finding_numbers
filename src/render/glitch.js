// Overflow corruption: what the screen does once the level counter has run past
// the four bits it has in the fiction and started writing over memory it does not
// own. Drawn on top of a finished frame, so the maze underneath is the real one.
//
// Two guarantees hold at every depth, and the level is unplayable without both:
//
//   1. The route is MASKED. Corruption never selects a cell the player can stand
//      on, nor the ring of wall touching one, so a dropout hole can never appear at
//      a corridor edge and read as a door.
//   2. The route is REPAINTED LAST. After every pass, the walkable cells are put
//      back and the player and source glyphs redrawn on top. The effects compose,
//      and one of them reaching the floor makes a level impossible rather than
//      merely ugly, so the guarantee does not rest on each effect behaving.
//
// The transmission is not in this file. Corruption is entirely a render pass: the
// message, the route and the readout's contents are untouched, so the station stays
// honest by construction rather than by discipline.

import { GRID, CHAR, GLYPH, FONT_STACK } from "../game/config.js";
import { WALL_RAMP } from "../game/levels.js";
import { DIRS, isFloor } from "../maze/cell.js";
import { roomRng } from "../game/state.js";
import { drawGlyph, setGridText } from "./chargrid.js";

// A corrupt cell draws from the machine's own character ROM — the wall glyphs the
// game already ships, plus the digits, which are the only other thing it knows.
const GLYPH_POOL = [...WALL_RAMP, ..."0123456789"];

// Ceilings, reached at the deepest corruption. Every density is scaled by the level's
// `corruption` dial, so the first overflow level is a few wrong cells and the last is
// a wreck.
const CEILING = { tileRot: 0.5, dropout: 0.5, clash: 0.22 };
const CLASH_BLOCK = 4; // cells per side of a reverse-video patch
const CHURN_MS = 1300; // how often the corrupt set re-rolls; static between ticks

// The dial is the last stable thing on the screen. Walls rot, the waterfall
// scrolls, rooms move — the frequency holding still is the fixed point all of that
// is measured against, and a picture where everything degrades reads as nothing
// degrading. So it gives way late and never completely: past DIAL_ONSET a couple of
// characters at most fall into the character ROM, and the reading stays legible.
// Unlike the readout it replaces, this field is on screen for every player, which
// is the only reason the rot reaches them at all.
const DIAL_ONSET = 0.55; // corruption depth before the dial moves at all
const DIAL_MAX_HITS = 2; // characters it will ever lose at once

// Every cell the player can stand on, plus the wall ring that touches one. Keys are
// "x,y". Exported for the test that pins the masking guarantee.
export function protectedMask(cell, edgeGuard = true) {
  const mask = new Set();
  const floors = [];
  for (let y = 0; y < GRID.H; y++) {
    for (let x = 0; x < GRID.W; x++) {
      if (!isFloor(cell, x, y)) continue;
      mask.add(`${x},${y}`);
      floors.push([x, y]);
    }
  }
  if (edgeGuard) {
    for (const [x, y] of floors) {
      for (const { dx, dy } of Object.values(DIRS)) mask.add(`${x + dx},${y + dy}`);
    }
  }
  return mask;
}

// The whole corruption for one frame, as data. Pure given (state, now) so the
// masking guarantee is testable without a canvas.
export function glitchPlan(state, now) {
  const depth = state.spec.corruption;
  const plan = { depth, rot: [], drop: [], clash: [] };
  if (depth <= 0) return plan; // before the overflow, nothing is built at all

  const cell = state.cell;
  const mask = protectedMask(cell);
  const free = (x, y) => !mask.has(`${x},${y}`);
  const tick = Math.floor(now / CHURN_MS);

  // Corruption that moves (rot) is keyed to the churn tick as well as the room;
  // corruption that eats the walls stays put for as long as the room does.
  const rotRng = roomRng(state, `rot${tick}:`);
  const dropRng = roomRng(state, "drop");
  const clashRng = roomRng(state, "clash");

  for (let y = 0; y < GRID.H; y++) {
    for (let x = 0; x < GRID.W; x++) {
      // Unmasked already implies wall: the mask holds every non-wall cell.
      const open = free(x, y);
      if (open && rotRng.chance(CEILING.tileRot * depth)) {
        plan.rot.push({ x, y, g: rotRng.pick(GLYPH_POOL) });
      }
      if (open && dropRng.chance(CEILING.dropout * depth)) {
        plan.drop.push({ x, y });
      }
      if (x % CLASH_BLOCK === 0 && y % CLASH_BLOCK === 0
          && clashRng.chance(CEILING.clash * depth)) {
        // A clash block may straddle a corridor; the repaint pass clears whatever
        // part of it lands on floor, so the block itself takes no mask test.
        plan.clash.push({ x, y });
      }
    }
  }
  return plan;
}

// What the frequency field reads this frame. Pure given (state, now), like
// glitchPlan, so the damage ceiling is testable without a canvas.
export function dialReading(state, now) {
  const freq = String(state.frequency ?? "");
  const depth = state.spec.corruption ?? 0;
  if (!freq || depth <= DIAL_ONSET) return freq;

  const past = (depth - DIAL_ONSET) / (1 - DIAL_ONSET); // 0..1 across the tail
  const hits = Math.min(DIAL_MAX_HITS, Math.round(past * DIAL_MAX_HITS));
  if (hits <= 0) return freq;

  const rng = roomRng(state, `dial${Math.floor(now / CHURN_MS)}:`);
  const out = [...freq];
  const spare = [...out.keys()];
  for (let i = 0; i < hits && spare.length; i++) {
    const at = rng.pick(spare);
    spare.splice(spare.indexOf(at), 1); // one hit per character, so the ceiling holds
    out[at] = rng.pick(GLYPH_POOL);
  }
  return out.join("");
}

export function drawGlitch(ctx, state, tint, now) {
  const plan = glitchPlan(state, now);
  if (plan.depth <= 0) return;

  setGridText(ctx, tint.fg);
  for (const c of plan.rot) {
    ctx.fillStyle = tint.bg;
    ctx.fillRect(c.x * CHAR.W, c.y * CHAR.H, CHAR.W, CHAR.H);
    ctx.fillStyle = tint.fg;
    drawGlyph(ctx, c.g, c.x, c.y);
  }

  ctx.fillStyle = tint.bg;
  for (const c of plan.drop) ctx.fillRect(c.x * CHAR.W, c.y * CHAR.H, CHAR.W, CHAR.H);

  for (const c of plan.clash) swapInkAndPage(ctx, c, tint);

  repaintRoute(ctx, state, tint);
}

// Reverse video without leaving the monochrome palette, and without reading the
// canvas back. The screen only ever holds two colours, so complementing a pixel
// along the page-to-ink ramp is exactly `ink + page - pixel` — which is what a
// `difference` blend against a fill of `ink + page` computes, in the compositor
// rather than in a per-pixel JS loop. An ordinary RGB invert would not do: it turns
// amber into blue, and this is one phosphor with no exceptions.
function swapInkAndPage(ctx, { x, y }, tint) {
  const ink = rgbOf(tint.fg), page = rgbOf(tint.bg);
  const sum = ink.map((c, i) => Math.min(255, c + page[i]));
  ctx.save();
  ctx.globalCompositeOperation = "difference";
  ctx.fillStyle = `rgb(${sum[0]},${sum[1]},${sum[2]})`;
  ctx.fillRect(x * CHAR.W, y * CHAR.H, CLASH_BLOCK * CHAR.W, CLASH_BLOCK * CHAR.H);
  ctx.restore();
}

// The floor is void in this game, so putting the route back is a fill in the page
// colour — then the two glyphs that must always be findable go on top.
function repaintRoute(ctx, state, tint) {
  const cell = state.cell;
  ctx.fillStyle = tint.bg;
  for (let y = 0; y < GRID.H; y++) {
    for (let x = 0; x < GRID.W; x++) {
      if (isFloor(cell, x, y)) ctx.fillRect(x * CHAR.W, y * CHAR.H, CHAR.W, CHAR.H);
    }
  }
  setGridText(ctx, tint.fg);
  if (cell.kind === "source") drawGlyph(ctx, state.sourceGlyph ?? "*", GRID.CX, GRID.CY);
  drawGlyph(ctx, GLYPH.PLAYER, state.player.x, state.player.y);
}

function rgbOf(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

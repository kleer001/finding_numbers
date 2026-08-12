import test from "node:test";
import assert from "node:assert/strict";

import { CHAR, GRID } from "../src/game/config.js";
import { layout, menuHit } from "../src/render/menu.js";

const ROWS = 6; // an arbitrary count: the hit-testing below is parametric on it

test("panel snaps to the character grid", () => {
  const box = layout(ROWS);
  assert.equal(box.w, 19 * CHAR.W);
  assert.equal(box.x, 2 * CHAR.W);
  assert.equal(box.y, 4 * CHAR.H); // snapped to a whole grid row
  assert.equal(box.h, 300);
  assert.ok(box.y + box.h <= 17 * CHAR.H, "panel stays out of the HUD band");
});

// The panel is title + footer + one row per option and must stay clear of the
// HUD band, so the row list has a hard ceiling — and the live menu is sitting on
// it, spending all 13 (CRT FX, CRT NOISE, BURN-IN, SHOW NUMBERS, TINT, MODE,
// JUKEBOX, TONE, VOLUME, SEED, SEED CHAR, RESTART LEVEL, RESTART GAME). A 14th
// row would be drawn over the waterfall with no other warning, so anything new
// has to displace something.
test("the panel holds 13 rows and no more", () => {
  const fits = layout(13);
  assert.ok(fits.y >= 0 && fits.y + fits.h <= GRID.H * CHAR.H, "13 rows fit above the HUD");
  const over = layout(14);
  assert.ok(over.y + over.h > GRID.H * CHAR.H, "14 rows overrun the HUD band");
});

test("taps land where they look: steppers, close, chrome", () => {
  const box = layout(ROWS);
  const rowY = box.y + 60 + 15; // vertical center of the first row band

  assert.deepEqual(menuHit(400, box.y - 10, ROWS), { type: "close" }); // outside
  assert.deepEqual(menuHit(box.x + box.w - 20, box.y + 20, ROWS), { type: "close" }); // [X]

  const right = box.x + box.w - 28; // row right edge (PAD inset)
  assert.deepEqual(menuHit(right - 20, rowY, ROWS), { type: "change", row: 0, delta: 1 }); // >
  assert.deepEqual(menuHit(right - 150, rowY, ROWS), { type: "change", row: 0, delta: -1 }); // <

  assert.equal(menuHit(box.x + 20, box.y + 30, ROWS), null); // title chrome eats the tap
});

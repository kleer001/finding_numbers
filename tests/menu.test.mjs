import test from "node:test";
import assert from "node:assert/strict";

import { CHAR } from "../src/game/config.js";
import { layout, menuHit } from "../src/render/menu.js";

const ROWS = 6; // the live menu has six rows

test("panel snaps to the character grid", () => {
  const box = layout(ROWS);
  assert.equal(box.w, 19 * CHAR.W);
  assert.equal(box.x, 2 * CHAR.W);
  assert.equal(box.y, 60); // whole rows above and below for any row count
  assert.equal(box.h, 480);
  assert.ok(box.y + box.h <= 17 * CHAR.H, "panel stays out of the HUD band");
});

test("taps land where they look: steppers, close, chrome", () => {
  const box = layout(ROWS);
  const rowY = box.y + 60 + 30; // vertical center of the first row band

  assert.deepEqual(menuHit(400, box.y - 10, ROWS), { type: "close" }); // outside
  assert.deepEqual(menuHit(box.x + box.w - 20, box.y + 20, ROWS), { type: "close" }); // [X]

  const right = box.x + box.w - 28; // row right edge (PAD inset)
  assert.deepEqual(menuHit(right - 20, rowY, ROWS), { type: "change", row: 0, delta: 1 }); // >
  assert.deepEqual(menuHit(right - 150, rowY, ROWS), { type: "change", row: 0, delta: -1 }); // <

  assert.equal(menuHit(box.x + 20, box.y + 30, ROWS), null); // title chrome eats the tap
});

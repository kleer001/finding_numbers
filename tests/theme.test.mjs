import test from "node:test";
import assert from "node:assert/strict";

import { levelSpec } from "../src/game/levels.js";
import { buildCell, makeCell, atDoor } from "../src/maze/cell.js";
import { makeRng } from "../src/core/rng.js";

test("zones own the look: glyph and corridor width shift per zone", () => {
  assert.deepEqual(levelSpec(1).theme, { wall: "#", half: 1 });
  assert.equal(levelSpec(4).theme.half, 2);
  assert.equal(levelSpec(7).theme.half, 0);
  assert.ok(Array.isArray(levelSpec(10).theme.wall)); // deep station: per cell
  assert.ok(Array.isArray(levelSpec(13).theme.half));
});

test("half-width drives the carve", () => {
  const narrow = buildCell({ E: true }, "interior", 0);
  assert.equal(narrow.grid[8][22], " ");
  assert.equal(narrow.grid[7][22], "#");
  const wide = buildCell({ E: true }, "interior", 2);
  assert.equal(wide.grid[6][22], " ");
  assert.equal(wide.grid[10][22], " ");
});

test("door openings match the cell's width", () => {
  const narrow = buildCell({ E: true }, "interior", 0);
  assert.ok(atDoor("E", 22, 8, narrow));
  assert.ok(!atDoor("E", 22, 7, narrow));
  const wide = buildCell({ E: true }, "interior", 2);
  assert.ok(atDoor("E", 22, 10, wide));
});

test("array theme values are picked per cell; theme never moves doors", () => {
  const rng = makeRng(9);
  const theme = { wall: ["%", "&"], half: [0, 1, 2] };
  const seen = new Set();
  for (let i = 0; i < 20; i++) {
    const c = makeCell("N", "interior", rng, true, 2, theme);
    seen.add(c.wallGlyph);
    assert.ok([0, 1, 2].includes(c.half));
    assert.ok(c.doors.N); // entry door untouched by theme
    assert.ok(["%", "&"].includes(c.wallGlyph));
  }
  assert.equal(seen.size, 2);
});

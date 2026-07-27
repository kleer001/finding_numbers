import test from "node:test";
import assert from "node:assert/strict";

import { levelSpec, MAX_LEVEL } from "../src/game/levels.js";
import { buildCell, makeCell, atDoor } from "../src/maze/cell.js";
import { makeRng } from "../src/core/rng.js";

test("zones own the corridor width", () => {
  assert.equal(levelSpec(1).theme.half, 1);
  assert.equal(levelSpec(4).theme.half, 2);
  assert.equal(levelSpec(7).theme.half, 0);
  assert.ok(Array.isArray(levelSpec(13).theme.half));
});

// Three levels of a zone used to share one glyph, so stepping up a level looked
// like nowhere new -- 1 to 2 read as the same room with a longer number.
test("no two neighbouring levels wear the same walls", () => {
  const surface = (level) => {
    const w = levelSpec(level).theme.wall;
    return Array.isArray(w) ? [...w].sort().join("") : w;
  };
  for (let level = 2; level <= MAX_LEVEL; level++) {
    assert.notEqual(surface(level), surface(level - 1), `levels ${level - 1} and ${level} match`);
  }
});

test("the deep station stops holding one surface", () => {
  assert.equal(typeof levelSpec(1).theme.wall, "string"); // near the surface: solid
  assert.ok(Array.isArray(levelSpec(10).theme.wall)); // deep station: per cell
  assert.ok(levelSpec(MAX_LEVEL).theme.wall.length > levelSpec(10).theme.wall.length);
});

// A glyph the shipped font does not carry renders in whatever fallback the OS
// supplies -- a second typeface mid-grid, or tofu. Latin-1 comes from VT323;
// the blocks are the ones make_font.py draws in, and nothing else is available.
test("every wall glyph is one the shipped font actually carries", () => {
  const BLOCKS = new Set([0x2591, 0x2592, 0x2593, 0x2588, 0x2580, 0x2584, 0x258c, 0x2590,
    0x259a, 0x1fb95, 0x2571, 0x2572, 0x2573]);
  const ours = (c) => c >= 0xe000 && c <= 0xe003; // the masonry make_font.py draws
  const served = (c) => (c >= 0x20 && c <= 0xff) || BLOCKS.has(c) || ours(c);
  for (let level = 1; level <= MAX_LEVEL; level++) {
    const w = levelSpec(level).theme.wall;
    for (const g of Array.isArray(w) ? w : [w]) {
      assert.ok(served(g.codePointAt(0)),
        `level ${level}: ${g} (U+${g.codePointAt(0).toString(16).toUpperCase()}) is outside VT323's served range`);
    }
  }
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

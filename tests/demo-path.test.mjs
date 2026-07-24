import test from "node:test";
import assert from "node:assert/strict";

import { GRID } from "../src/game/config.js";
import { makeCell, doorEntryTile, isFloor, atDoor, DIRS } from "../src/maze/cell.js";
import { makeRng } from "../src/core/rng.js";
import { centerKeys, exitKeys, onwardDir, wrongDir } from "../src/demo.js";

const DIR_OF = { ArrowUp: "N", ArrowDown: "S", ArrowRight: "E", ArrowLeft: "W" };
const ALL = ["N", "S", "E", "W"];

// Replay a key sequence over a cell's grid the way tryMove does: every step must
// land on floor except the last, which must cross a door opening.
function replay(cell, start, keys) {
  const p = { ...start };
  for (let i = 0; i < keys.length; i++) {
    const dir = DIR_OF[keys[i]];
    const { dx, dy } = DIRS[dir];
    const nx = p.x + dx;
    const ny = p.y + dy;
    if (isFloor(cell, nx, ny)) {
      p.x = nx;
      p.y = ny;
      continue;
    }
    return { crossed: atDoor(dir, p.x, p.y, cell), stoppedAt: i, p };
  }
  return { crossed: false, stoppedAt: keys.length, p };
}

test("exitKeys leaves an interior cell through any of its doors, at every corridor width", () => {
  for (const half of [0, 1, 2]) {
    for (const entryDir of ALL) {
      const cell = makeCell(entryDir, "interior", makeRng(7), true, 3, { wall: "#", half });
      const start = doorEntryTile(entryDir);
      for (const dir of ALL.filter((d) => cell.doors[d])) {
        const keys = exitKeys(cell, dir);
        const out = replay(cell, start, keys);
        assert.ok(out.crossed, `half=${half} entry=${entryDir} exit=${dir} never reached the door`);
        assert.equal(
          out.stoppedAt,
          keys.length - 1,
          `half=${half} entry=${entryDir} exit=${dir} left the cell early`,
        );
      }
    }
  }
});

test("exitKeys skips the inward leg on a start cell, where the player begins at the junction", () => {
  const cell = makeCell(null, "start", makeRng(3), false, 2, {}, { exit: "E" });
  const keys = exitKeys(cell, "E");
  const out = replay(cell, { x: GRID.CX, y: GRID.CY }, keys);
  assert.ok(out.crossed);
  assert.equal(out.stoppedAt, keys.length - 1);
});

test("centerKeys walks a source cell's entry door onto the glyph", () => {
  for (const entryDir of ALL) {
    const cell = makeCell(entryDir, "source", makeRng(5), false);
    const out = replay(cell, doorEntryTile(entryDir), centerKeys(cell));
    assert.deepEqual({ x: out.p.x, y: out.p.y }, { x: GRID.CX, y: GRID.CY }, `entry=${entryDir}`);
  }
});

test("onwardDir follows the plan; wrongDir picks a door that is neither correct nor back", () => {
  const cell = makeCell("W", "interior", makeRng(11), true, 3, {}, {
    back: "W",
    forwards: ["N", "S", "E"],
    correctDir: "N",
  });
  assert.equal(onwardDir(cell), "N");

  const wrong = wrongDir(cell);
  assert.ok(cell.doors[wrong]);
  assert.notEqual(wrong, cell.correctDir);
  assert.notEqual(wrong, cell.backDir);

  const corridor = makeCell("N", "corridor", makeRng(2), false);
  assert.equal(onwardDir(corridor), Object.keys(corridor.doors).find((d) => d !== "N"));
});

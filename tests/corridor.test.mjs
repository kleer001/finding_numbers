import test from "node:test";
import assert from "node:assert/strict";

import { createState, tryMove, update } from "../src/game/state.js";
import { doorEntryTile, DIRS } from "../src/maze/cell.js";

const commit = (s) => update(s, 300, 0); // TRANSITION_MS is 260

function crossDoor(s, dir) {
  s.player = { ...doorEntryTile(dir) };
  const ev = tryMove(s, dir);
  commit(s);
  return ev;
}

const exitOf = (cell) =>
  Object.keys(DIRS).find((d) => cell.doors[d] && d !== cell.backDir);

test("a forward crossing can insert a corridor; walking on reaches a real cell", () => {
  const s = createState(11, 6);
  s.spec = { ...s.spec, corridorChance: 1 };
  assert.equal(crossDoor(s, s.cell.correctDir), "advance");
  assert.equal(s.cell.kind, "corridor");
  assert.equal(s.progress.depth, 1);
  assert.equal(Object.values(s.cell.doors).filter(Boolean).length, 2);
  // onward: no progression change, lands in an interior junction
  assert.equal(crossDoor(s, exitOf(s.cell)), null);
  assert.equal(s.cell.kind, "interior");
  assert.equal(s.progress.depth, 1);
});

test("backing out of a corridor undoes the crossing that inserted it", () => {
  const s = createState(12, 6);
  s.spec = { ...s.spec, corridorChance: 1 };
  crossDoor(s, s.cell.correctDir); // advance -> corridor, depth 1
  assert.equal(s.cell.kind, "corridor");
  const ev = crossDoor(s, s.cell.backDir);
  assert.equal(ev, "retreat");
  assert.equal(s.progress.depth, 0);
  assert.equal(s.cell.kind, "start");
});

test("corridors never pad backtracks", () => {
  const s = createState(13, 6);
  s.spec = { ...s.spec, corridorChance: 1 };
  crossDoor(s, s.cell.correctDir); // corridor
  crossDoor(s, exitOf(s.cell)); // interior at depth 1
  const ev = crossDoor(s, s.cell.backDir); // retreat: must NOT insert a corridor
  assert.equal(ev, "retreat");
  assert.equal(s.cell.kind, "start");
  assert.equal(s.progress.depth, 0);
});

test("corridorChance 0 never inserts corridors", () => {
  const s = createState(14, 3);
  for (let i = 0; i < 8 && s.progress.depth < 3; i++) {
    crossDoor(s, s.cell.correctDir ?? s.cell.backDir);
    assert.notEqual(s.cell.kind, "corridor");
  }
});

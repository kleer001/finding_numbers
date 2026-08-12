import test from "node:test";
import assert from "node:assert/strict";

import { createState, setLevel, tryMove, update, roomKey } from "../src/game/state.js";
import { doorEntryTile } from "../src/maze/cell.js";
import { levelSpec } from "../src/game/levels.js";

const commit = (s) => update(s, 300, 0); // TRANSITION_MS is 260

function crossDoor(s, dir) {
  s.player = { ...doorEntryTile(dir) };
  const ev = tryMove(s, dir);
  commit(s);
  return ev;
}

const surface = (s) => ({ half: s.cell.half, wall: s.cell.wallGlyph });

// The deep zones offer a choice of corridor width and wall glyph per cell. Drawing
// those from the live maze stream meant a room's shape changed under the player
// between visits: doors stayed put, so it was still solvable, but it could not be
// recognised — and a maze whose rooms cannot be told apart has nothing for the
// lying rooms to lie against.
test("the deep zones really do offer a choice, or this test proves nothing", () => {
  const spec = levelSpec(40);
  assert.ok(Array.isArray(spec.theme.half), "corridor width is a per-cell pick");
  assert.ok(Array.isArray(spec.theme.wall), "wall glyph is a per-cell pick");
});

test("a room keeps its surface when the level is rebuilt from the same seed", () => {
  const s = createState(31337, 1);
  setLevel(s, 40);
  const first = surface(s);
  for (let i = 0; i < 5; i++) {
    setLevel(s, 12);
    setLevel(s, 40);
    assert.deepEqual(surface(s), first, `rebuild ${i + 1} wore a different surface`);
  }
});

// Corridor insertion is still drawn from the live maze stream, so a pass-through
// cell can pad a forward walk on one visit and not the next. That is a separate
// dial from the room's surface; walk on through whatever turns up.
function advanceToRoom(s) {
  const ev = crossDoor(s, s.cell.correctDir);
  while (s.cell.kind === "corridor") {
    crossDoor(s, Object.keys(s.cell.doors).find((d) => d !== s.cell.backDir));
  }
  return ev;
}

test("a room keeps its surface when the player walks out and back in", () => {
  const s = createState(4242, 1);
  setLevel(s, 40);
  const start = surface(s);
  const startKey = roomKey(s);

  assert.equal(advanceToRoom(s), "advance");
  assert.notEqual(roomKey(s), startKey, "we actually left the room");
  const away = surface(s);
  const awayKey = roomKey(s);

  crossDoor(s, s.cell.backDir); // retreat; corridors pad forward walks only
  assert.equal(roomKey(s), startKey, "back where we began");
  assert.deepEqual(surface(s), start, "the start room changed shape while we were out");

  advanceToRoom(s);
  assert.equal(roomKey(s), awayKey, "back in the same room");
  assert.deepEqual(surface(s), away, "the second room changed shape while we were out");
});

test("different rooms still wear different surfaces", () => {
  const s = createState(777, 1);
  setLevel(s, 40);
  const seen = new Set();
  for (let i = 0; i < 8; i++) {
    seen.add(JSON.stringify(surface(s)));
    advanceToRoom(s); // walks through any corridor padding, which has no correctDir
  }
  assert.ok(seen.size > 1, "every room wore the same surface: the zone dial is dead");
});

test("levels with a single authored surface are untouched by any of this", () => {
  const s = createState(9, 1);
  setLevel(s, 1);
  const spec = levelSpec(1);
  assert.equal(s.cell.half, spec.theme.half);
  assert.equal(s.cell.wallGlyph, spec.theme.wall);
});

import test from "node:test";
import assert from "node:assert/strict";

import { buildRoomPlan, changeBudget, honestyAt, OPPOSITE } from "../src/maze/cell.js";
import { levelSpec, honestyCurve, MAX_LEVEL } from "../src/game/levels.js";
import { makeRng } from "../src/core/rng.js";
import { createState, tryMove, update } from "../src/game/state.js";
import { doorEntryTile, DIRS } from "../src/maze/cell.js";

test("changeBudget: a 0.1 honesty drop buys one more change", () => {
  assert.equal(changeBudget(1.0), 0);
  assert.equal(changeBudget(0.9), 1);
  assert.equal(changeBudget(0.8), 2);
  assert.equal(changeBudget(0.5), 5);
  assert.equal(changeBudget(0.0), 10);
});

test("honestyAt: number is uniform, array is per-depth, missing is honest", () => {
  assert.equal(honestyAt({ honesty: 0.7 }, 4), 0.7);
  assert.equal(honestyAt({ honesty: [1, 0.9, 0.8] }, 2), 0.8);
  assert.equal(honestyAt({ honesty: [1, 0.9] }, 5), 1); // past the array -> honest
  assert.equal(honestyAt({}, 3), 1); // unset -> honest
});

test("honesty 1.0 lays out one fixed correct door per room (never changes)", () => {
  const plan = buildRoomPlan(makeRng(7), { digits: 6, forwardDoors: 2, honesty: 1 });
  for (let d = 1; d < 6; d++) {
    assert.equal(plan.rooms[d].budget, 0);
    assert.equal(plan.rooms[d].correctSeq.length, 1);
  }
});

test("below 1.0: budget changes, each different from the one before", () => {
  const plan = buildRoomPlan(makeRng(3), { digits: 5, forwardDoors: 3, honesty: 0.7 });
  for (let d = 1; d < 5; d++) {
    const { correctSeq, budget } = plan.rooms[d];
    assert.equal(budget, 3);
    assert.equal(correctSeq.length, 4); // budget + 1 states
    for (let k = 1; k < correctSeq.length; k++) {
      assert.notEqual(correctSeq[k], correctSeq[k - 1]); // a real change, not a reroll onto itself
    }
  }
});

test("forwards exclude the toward-start door; correct is always a forward", () => {
  const spec = { digits: 5, forwardDoors: 2, honesty: 0.5 };
  const plan = buildRoomPlan(makeRng(42), spec);
  let prevCorrect = plan.startExit;
  for (let d = 1; d < 5; d++) {
    const room = plan.rooms[d];
    assert.ok(!room.forwards.includes(OPPOSITE[prevCorrect])); // never "the way you came"
    for (const c of room.correctSeq) assert.ok(room.forwards.includes(c));
    prevCorrect = room.correctSeq[0];
  }
});

// Integration: honest (default) rooms hold still under backtracking.
const commit = (s) => update(s, 300, 0);
function crossDoor(s, dir) {
  s.player = { ...doorEntryTile(dir) };
  const ev = tryMove(s, dir);
  commit(s);
  return ev;
}
const decoyOf = (cell) =>
  Object.keys(DIRS).find((d) => cell.doors[d] && d !== cell.backDir && d !== cell.correctDir);

test("honesty 1.0: a room's correct door survives straying and returning", () => {
  const s = createState(21, 1); // level 1: honest, forwardDoors 2, no corridors
  assert.equal(crossDoor(s, s.cell.correctDir), "advance"); // depth 1 frontier room
  const correct = s.cell.correctDir;
  for (let i = 0; i < 4; i++) {
    assert.equal(crossDoor(s, decoyOf(s.cell)), "stray"); // wander off
    assert.equal(crossDoor(s, s.cell.backDir), "return"); // walk back in
    assert.equal(s.cell.correctDir, correct); // the door never moved
  }
});

// Inject a dishonest correct-door sequence onto the real planned geometry (back
// + forwards stay coherent) to drive the in-engine change-then-freeze path.
const straysBackIn = (s) => {
  crossDoor(s, decoyOf(s.cell));
  crossDoor(s, s.cell.backDir);
};

test("below 1.0: the room betrays a bounded number of times, then freezes", () => {
  const s = createState(21, 1);
  const room = s.roomPlan[1];
  room.budget = 1; // one change allowed
  room.correctSeq = [room.forwards[0], room.forwards[1]]; // then a different door
  s.roomVisits = [];

  crossDoor(s, s.cell.correctDir); // enter depth 1 (visit 0 -> forwards[0])
  const first = s.cell.correctDir;
  assert.equal(first, room.forwards[0]);
  assert.equal(Object.values(s.cell.doors).filter(Boolean).length, 3); // full layout

  straysBackIn(s); // visit 1 -> the one change
  const second = s.cell.correctDir;
  assert.notEqual(second, first); // it moved: the horror
  assert.equal(second, room.forwards[1]);
  assert.equal(Object.values(s.cell.doors).filter(Boolean).length, 3); // still full

  straysBackIn(s); // visit 2 -> budget spent, frozen
  assert.equal(s.cell.correctDir, second);
  straysBackIn(s); // stays put
  assert.equal(s.cell.correctDir, second);
});

// --- the authored difficulty curve ------------------------------------------

const roomsOf = (level) => levelSpec(level).honesty.slice(1); // drop the start slot

test("levels 1-2 are pure: nothing lies while you learn the game", () => {
  for (const level of [1, 2]) {
    assert.ok(levelSpec(level).honesty.every((h) => h === 1));
  }
});

test("no level lies in more than half its rooms", () => {
  for (let level = 1; level <= MAX_LEVEL; level++) {
    const rooms = roomsOf(level);
    const lying = rooms.filter((h) => h < 1).length;
    assert.ok(lying <= Math.floor(rooms.length * 0.5), `level ${level}: ${lying}/${rooms.length}`);
  }
});

test("honesty stays on the 0.1 grid and never dips below the 0.5 floor", () => {
  for (let level = 1; level <= MAX_LEVEL; level++) {
    for (const h of levelSpec(level).honesty) {
      assert.ok(h >= 0.5 && h <= 1, `level ${level}: ${h}`);
      assert.equal(Math.round(h * 10), h * 10);
    }
  }
});

test("each level hides one contiguous stretch that worsens as you walk it", () => {
  for (let level = 3; level <= MAX_LEVEL; level++) {
    const rooms = roomsOf(level);
    const lying = rooms.map((h, i) => (h < 1 ? i : -1)).filter((i) => i >= 0);
    if (!lying.length) continue;
    const span = lying[lying.length - 1] - lying[0] + 1;
    assert.equal(span, lying.length, `level ${level}: stretch is not contiguous`);
    for (let i = 1; i < lying.length; i++) {
      assert.ok(rooms[lying[i]] <= rooms[lying[i - 1]], `level ${level}: severity eased off`);
    }
  }
});

test("the unstable stretch moves around from level to level", () => {
  const starts = new Set();
  for (let level = 3; level <= MAX_LEVEL; level++) {
    const rooms = roomsOf(level);
    starts.add(rooms.findIndex((h) => h < 1) / rooms.length);
  }
  assert.ok(starts.size > 5, `stretch barely moves: ${starts.size} distinct positions`);
});

test("the curve is stable per level and a hand-authored honesty wins", () => {
  assert.deepEqual(honestyCurve(9, 10), honestyCurve(9, 10)); // same level -> same shape
  assert.deepEqual(levelSpec(9).honesty, honestyCurve(9, levelSpec(9).digits));
});

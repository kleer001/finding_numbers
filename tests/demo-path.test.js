import test from "node:test";
import assert from "node:assert/strict";

import { GRID, LANGUAGES, DIAL_MAX } from "../src/game/config.js";
import { CADENCES } from "../src/game/levels.js";
import { makeCell, doorEntryTile, isFloor, atDoor, DIRS } from "../src/maze/cell.js";
import { makeRng } from "../src/core/rng.js";
import { centerKeys, exitKeys, onwardDir, wrongDir, JUKEBOX_WALK } from "../src/demo.js";

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

// --- the jukebox walk -------------------------------------------------------

// The picker's stepping rules, mirrored from JUKEBOX_ROWS in main.js: cycling
// lists for language/coherence/cadence, a clamped dial for static, a toggle for
// numbers. The option sets come from the modules that own them, so adding a
// language moves this test rather than quietly passing a stale count.
const JB_LANGS = [...LANGUAGES, "babel"];
const JB_COHERENCE = ["LOOP", "RANDOM", "ORDERED"];
const JB_CADENCE = Object.keys(CADENCES);
const cycle = (arr, cur, d) => arr[(arr.indexOf(cur) + d + arr.length) % arr.length];
const clampDial = (v) => Math.max(0, Math.min(DIAL_MAX, v));

// Replay the walk over those rules, recording every value each row settles on,
// so it is judged by where it lands rather than by how many keys it presses.
function replayWalk() {
  const s = { lang: "english", coherence: "LOOP", cadence: "CALM", stat: 2, numbers: true };
  const seen = { lang: [s.lang], coherence: [s.coherence], cadence: [s.cadence], stat: [s.stat], numbers: [s.numbers] };
  for (const step of JUKEBOX_WALK) {
    const d = step.key === "ArrowRight" ? 1 : -1;
    for (let i = 0; i < step.times; i++) {
      if (step.row === 0) seen.lang.push((s.lang = cycle(JB_LANGS, s.lang, d)));
      else if (step.row === 1) seen.coherence.push((s.coherence = cycle(JB_COHERENCE, s.coherence, d)));
      else if (step.row === 2) seen.cadence.push((s.cadence = cycle(JB_CADENCE, s.cadence, d)));
      else if (step.row === 3) seen.stat.push((s.stat = clampDial(s.stat + d)));
      else seen.numbers.push((s.numbers = !s.numbers));
    }
  }
  return { s, seen };
}

test("the jukebox walk reaches every language, coherence and cadence the picker offers", () => {
  const { seen } = replayWalk();
  const uniq = (a) => [...new Set(a)].sort();
  assert.deepEqual(uniq(seen.lang), uniq(JB_LANGS));
  assert.deepEqual(uniq(seen.coherence), uniq(JB_COHERENCE));
  assert.deepEqual(uniq(seen.cadence), uniq(JB_CADENCE));
});

test("the jukebox walk runs static up then down, and leaves the transmission on", () => {
  const { s, seen } = replayWalk();
  assert.equal(Math.max(...seen.stat), DIAL_MAX);
  assert.equal(Math.min(...seen.stat), 0);
  assert.ok(seen.stat.indexOf(DIAL_MAX) < seen.stat.lastIndexOf(0), "static must rise before it falls");
  assert.ok(seen.numbers.includes(false), "numbers never cut out");
  assert.equal(s.numbers, true, "the clip has to end with the transmission back on");
});

// The failure this guards against is silent: the row changes on screen, no digit
// arrives before the next press, and the clip shows a setting it never played.
test("every setting the walk changes by ear is held longer than CALM's widest gap", () => {
  const audible = JUKEBOX_WALK.filter((step) => step.row <= 2);
  assert.ok(audible.length, "the walk changes nothing that has to be heard");
  for (const step of audible) {
    assert.ok(
      step.hold >= CADENCES.CALM.max,
      `row ${step.row} holds ${step.hold}ms, under CALM's ${CADENCES.CALM.max}ms gap between digits`,
    );
  }
});

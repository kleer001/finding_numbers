// The source-gate step: what it sounds like, and the blank beat that follows
// the spiral before the next level appears.
import test from "node:test";
import assert from "node:assert/strict";

import { WIN_WIPE_MS, WIN_BLACK_MS, GRID } from "../src/game/config.js";
import { winWipePhase } from "../src/render/render.js";
import { VICTORY_NOTES, GATE_NOTES } from "../src/audio/station.js";
import { createState, tryMove, update } from "../src/game/state.js";
import { doorEntryTile } from "../src/maze/cell.js";

const commit = (s) => update(s, 300, 0); // past TRANSITION_MS

// Walk the golden path until the source cell's glyph is one step away.
function reachSource(seed) {
  const s = createState(seed, 1);
  for (let i = 0; i < 40 && s.cell.kind !== "source"; i++) {
    const dir = s.cell.kind === "corridor"
      ? Object.keys(s.cell.doors).find((d) => d !== s.cell.backDir)
      : s.cell.correctDir;
    s.player = { ...doorEntryTile(dir) };
    tryMove(s, dir);
    commit(s);
  }
  assert.equal(s.cell.kind, "source", "never reached the source cell");
  return s;
}

test("the gate tone is the victory arpeggio inverted", () => {
  assert.deepEqual(GATE_NOTES, [...VICTORY_NOTES].reverse());
  for (let i = 1; i < VICTORY_NOTES.length; i++) {
    assert.ok(VICTORY_NOTES[i] > VICTORY_NOTES[i - 1], "victory must rise");
    assert.ok(GATE_NOTES[i] < GATE_NOTES[i - 1], "the gate must fall");
  }
});

test("stepping the source glyph reports 'reset', which is what fires the gate tone", () => {
  const s = reachSource(21);
  s.player = { x: GRID.CX, y: GRID.CY - 1 };
  assert.equal(tryMove(s, "S"), "reset");
});

test("the win transition runs long enough to hold blank after the spiral", () => {
  const s = reachSource(21);
  s.player = { x: GRID.CX, y: GRID.CY - 1 };
  tryMove(s, "S");
  assert.equal(s.transition.dur, WIN_WIPE_MS + WIN_BLACK_MS);
});

test("winWipePhase spirals for the wipe, then blanks", () => {
  assert.deepEqual(winWipePhase(0), { spiral: 0 });
  assert.deepEqual(winWipePhase(WIN_WIPE_MS / 2), { spiral: 0.5 });
  assert.ok(winWipePhase(WIN_WIPE_MS - 1).spiral > 0.999);
  assert.deepEqual(winWipePhase(WIN_WIPE_MS), { blank: true });
  assert.deepEqual(winWipePhase(WIN_WIPE_MS + WIN_BLACK_MS - 1), { blank: true });
});

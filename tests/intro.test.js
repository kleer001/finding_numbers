import test from "node:test";
import assert from "node:assert/strict";

import { INTRO_MESSAGES, WATERFALL } from "../src/game/config.js";
import { createState, tryMove } from "../src/game/state.js";

test("every cold-open banner fits the waterfall box", () => {
  assert.deepEqual(INTRO_MESSAGES[0], ["MOVE TO BEGIN"]); // clear instruction first
  for (const lines of INTRO_MESSAGES) {
    assert.ok(lines.length >= 1 && lines.length <= WATERFALL.rows, `rows: ${lines}`);
    for (const line of lines) {
      assert.ok(line.length <= WATERFALL.cols, `too wide (${line.length}): ${line}`);
    }
  }
});

test("the banner clears on the first move", () => {
  const state = createState(1);
  assert.equal(state.started, false); // shown before the player does anything
  tryMove(state, "N");
  assert.equal(state.started, true); // any directional input begins the game
});

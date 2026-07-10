import test from "node:test";
import assert from "node:assert/strict";

import { SIGNAL_LOST_MESSAGES, GRID } from "../src/game/config.js";

test("every lost-signal phrase fits one screen line", () => {
  assert.ok(SIGNAL_LOST_MESSAGES.length >= 2, "need a pool to flicker through");
  for (const msg of SIGNAL_LOST_MESSAGES) {
    assert.ok(msg.length > 0 && msg.length <= GRID.W, `too wide (${msg.length}): ${msg}`);
  }
});

test("the pool keeps the original English tag", () => {
  assert.ok(SIGNAL_LOST_MESSAGES.includes("<LOST CONNECTION>"));
});

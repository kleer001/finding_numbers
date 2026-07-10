import test from "node:test";
import assert from "node:assert/strict";

import { STATION_FREQS } from "../src/game/config.js";
import { createState, setLevel } from "../src/game/state.js";

test("each level's dial frequency is a real station frequency", () => {
  const state = createState(0xC0FFEE, 1);
  for (let lv = 1; lv <= 12; lv++) {
    setLevel(state, lv);
    assert.ok(STATION_FREQS.includes(state.frequency), `level ${lv}: ${state.frequency}`);
  }
});

test("the frequency is deterministic per seed+level and varies across levels", () => {
  const a = createState(42, 1);
  const b = createState(42, 1);
  assert.equal(a.frequency, b.frequency); // same seed+level -> same dial

  const seen = new Set();
  for (let lv = 1; lv <= 12; lv++) {
    setLevel(a, lv);
    seen.add(a.frequency);
  }
  assert.ok(seen.size > 1, "the dial should not be stuck on one frequency");
});

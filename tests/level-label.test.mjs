import test from "node:test";
import assert from "node:assert/strict";

import { levelLabel } from "../src/render/render.js";
import { OVERFLOW_FROM, NAMED_LEVELS } from "../src/game/levels.js";
import { GRID } from "../src/game/config.js";

test("up to the overflow the counter just counts", () => {
  assert.equal(levelLabel(1), "LV 1");
  assert.equal(levelLabel(9), "LV 9");
  assert.equal(levelLabel(OVERFLOW_FROM - 1), "LV 16");
});

test("past the overflow it prints the four bits it has left, in hex", () => {
  assert.equal(levelLabel(17), "LV 11");
  assert.equal(levelLabel(32), "LV 20");
  assert.equal(levelLabel(NAMED_LEVELS), "LV 40");
});

test("past the last nameable level it stops claiming a number", () => {
  assert.equal(levelLabel(NAMED_LEVELS + 1), "LV???");
  assert.equal(levelLabel(NAMED_LEVELS * 10), "LV???");
  assert.equal(levelLabel(99999), "LV???");
});

test("every label fits the five-column status field", () => {
  const FIELD = 5;
  for (const l of [1, 9, 10, 16, 17, 32, 63, NAMED_LEVELS, NAMED_LEVELS + 1, 100000]) {
    assert.ok(levelLabel(l).length <= FIELD, `level ${l}: ${levelLabel(l)} overruns the field`);
  }
  assert.ok(FIELD < GRID.W);
});

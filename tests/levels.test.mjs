import test from "node:test";
import assert from "node:assert/strict";

import { levelSpec, MAX_LEVEL } from "../src/game/levels.js";
import { LANGUAGES } from "../src/game/config.js";

test("first three levels ramp 3/6/10 digits in english", () => {
  assert.equal(levelSpec(1).digits, 3);
  assert.equal(levelSpec(2).digits, 6);
  assert.equal(levelSpec(3).digits, 10);
  for (const l of [1, 2, 3]) {
    assert.equal(levelSpec(l).language, "english");
    assert.equal(levelSpec(l).repeats, 1);
    assert.equal(levelSpec(l).forwardDoors, 2);
  }
});

test("repeats arrive at level 5, third door at level 7", () => {
  assert.equal(levelSpec(4).repeats, 1);
  assert.equal(levelSpec(5).repeats, 2);
  assert.equal(levelSpec(6).forwardDoors, 2);
  assert.equal(levelSpec(7).forwardDoors, 3);
});

test("authored levels use real languages; 12 is the babel finale", () => {
  for (let l = 1; l <= 11; l++) assert.ok(LANGUAGES.includes(levelSpec(l).language));
  assert.equal(levelSpec(12).language, "babel");
  assert.equal(levelSpec(12).ordered, true);
});

test("levels 13+ grow one digit per level, random and babel", () => {
  assert.equal(levelSpec(13).digits, 11);
  assert.equal(levelSpec(20).digits, 18);
  assert.equal(levelSpec(MAX_LEVEL).digits, 30);
  for (const l of [13, 20, MAX_LEVEL]) {
    const s = levelSpec(l);
    assert.equal(s.ordered, false);
    assert.equal(s.language, "babel");
    assert.equal(s.repeats, 2);
    assert.equal(s.forwardDoors, 3);
  }
});

test("levelSpec fails loudly out of range", () => {
  assert.throws(() => levelSpec(0));
  assert.throws(() => levelSpec(MAX_LEVEL + 1));
  assert.throws(() => levelSpec(1.5));
});

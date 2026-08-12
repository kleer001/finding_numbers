import test from "node:test";
import assert from "node:assert/strict";

import { levelSpec, NAMED_LEVELS } from "../src/game/levels.js";
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
  // one per level with no ceiling: the deepest level reads back a message as long
  // as the climb has made it, however far NAMED_LEVELS is moved
  assert.equal(levelSpec(NAMED_LEVELS).digits, 10 + (NAMED_LEVELS - 12));
  for (const l of [13, 20, NAMED_LEVELS]) {
    const s = levelSpec(l);
    assert.equal(s.ordered, false);
    assert.equal(s.language, "babel");
    assert.equal(s.repeats, 2);
    assert.equal(s.forwardDoors, 3);
  }
});

test("noise stays out of the tutorial, washes in at 4, bursts at 7", () => {
  for (const l of [1, 2, 3]) assert.deepEqual(levelSpec(l).noise, { wash: 0, burst: 0 });
  assert.ok(levelSpec(4).noise.wash > 0);
  assert.equal(levelSpec(4).noise.burst, 0);
  assert.equal(levelSpec(6).noise.burst, 0);
  assert.ok(levelSpec(7).noise.burst > 0);
  for (const l of [12, 13, NAMED_LEVELS]) {
    const n = levelSpec(l).noise;
    assert.ok(n.wash >= 0.6 && n.burst >= 1);
  }
});

test("levelSpec fails loudly on a level that cannot exist", () => {
  assert.throws(() => levelSpec(0));
  assert.throws(() => levelSpec(-3));
  assert.throws(() => levelSpec(1.5));
});

test("levels do not stop at the last one the counter can name", () => {
  for (const l of [NAMED_LEVELS + 1, NAMED_LEVELS * 4, 1000]) {
    const s = levelSpec(l);
    assert.equal(s.digits, 10 + (l - 12), `level ${l} keeps growing`);
    assert.ok(s.theme.wall.length > 0);
  }
});

test("past the overflow the gap between numbers closes, then holds at its floor", () => {
  const mean = ({ min, max, step }) => min + (step * Math.floor((max - min) / step)) / 2;
  // levels 13-16 are still RAPID: the crank-down starts at the overflow, not before
  assert.deepEqual(levelSpec(16).interval, levelSpec(13).interval);
  const at = (l) => mean(levelSpec(l).interval);
  assert.ok(at(20) < at(16), "17+ reads faster than the authored tail");
  assert.ok(at(40) < at(20));
  // The floor arrives before the deepest named level and holds from there — the
  // crank-down was only ever there to keep a pass from growing without limit, and
  // past this point the gaps are as tight as they can be and still be counted.
  // The exact floors live in tests/readout-gaps.test.js.
  assert.equal(at(64), at(40), "the gap has bottomed out by the deepest levels");
  assert.equal(at(1000), at(64), "and stays there however long the message gets");
});

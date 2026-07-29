import test from "node:test";
import assert from "node:assert/strict";

import { gapFor } from "../src/audio/station.js";
import {
  levelSpec, overflowGaps, readoutCadence, GAP_FLOOR, OVERFLOW_FROM, NAMED_LEVELS,
} from "../src/game/levels.js";

const mean = ({ min, max, step }) => min + (step * Math.floor((max - min) / step)) / 2;

test("the floors are the ones set by ear and never crossed", () => {
  assert.equal(GAP_FLOOR.repeat, 390);
  assert.equal(GAP_FLOOR.group, 780);
  for (const digits of [15, 20, 30, 62, 200, 5000]) {
    const g = overflowGaps(digits);
    assert.ok(g.repeatInterval.min >= GAP_FLOOR.repeat,
      `${digits} digits: repeat gap ${g.repeatInterval.min}ms is under the floor`);
    assert.ok(g.interval.min >= GAP_FLOOR.group,
      `${digits} digits: group gap ${g.interval.min}ms is under the floor`);
  }
});

test("a number is always separated more widely than its own repeats", () => {
  for (const digits of [15, 22, 40, 62, 500]) {
    const g = overflowGaps(digits);
    assert.ok(g.interval.min >= g.repeatInterval.min,
      `${digits} digits: numbers crowd closer than their repeats`);
  }
});

test("min never exceeds max, whatever the crank-down does", () => {
  for (const digits of [11, 14, 15, 18, 30, 62, 1000]) {
    for (const spec of Object.values(overflowGaps(digits))) {
      assert.ok(spec.max >= spec.min, `${digits}: ${JSON.stringify(spec)}`);
      assert.ok(spec.step > 0);
    }
  }
});

test("the crank-down still tightens with depth, down to the floors", () => {
  const at = (l) => levelSpec(l);
  assert.ok(mean(at(20).repeatInterval) > mean(at(40).repeatInterval), "still cranking");
  assert.equal(at(NAMED_LEVELS).repeatInterval.min, GAP_FLOOR.repeat, "and lands on the floor");
  assert.equal(at(NAMED_LEVELS).interval.min, GAP_FLOOR.group);
  assert.deepEqual(at(200).repeatInterval, at(NAMED_LEVELS).repeatInterval, "then holds");
});

test("the authored levels keep their single gap and are untouched", () => {
  for (let level = 1; level < OVERFLOW_FROM; level++) {
    assert.equal(levelSpec(level).repeatInterval, undefined,
      `level ${level} grew a second gap it never had`);
  }
  assert.deepEqual(levelSpec(13).interval, levelSpec(16).interval);
});

test("gapFor gives a new number the group gap and a repeat the tight one", () => {
  const group = { min: 780, max: 900, step: 10 };
  const repeat = { min: 390, max: 500, step: 10 };
  // repeats = 2: cursor 0 starts a number, 1 is its second utterance, 2 the next
  assert.equal(gapFor(0, 2, group, repeat), group);
  assert.equal(gapFor(1, 2, group, repeat), repeat);
  assert.equal(gapFor(2, 2, group, repeat), group);
  assert.equal(gapFor(3, 2, group, repeat), repeat);
  // the wrap point: total is a multiple of repeats, so it begins a number
  assert.equal(gapFor(4, 2, group, repeat), group);
  // repeats = 3
  assert.deepEqual([0, 1, 2, 3].map((i) => gapFor(i, 3, group, repeat)),
    [group, repeat, repeat, group]);
});

test("gapFor falls back when there is nothing to cluster", () => {
  const group = { min: 780, max: 900, step: 10 };
  const repeat = { min: 390, max: 500, step: 10 };
  assert.equal(gapFor(0, 1, group, repeat), group, "one utterance per number");
  assert.equal(gapFor(1, 1, group, repeat), group);
  assert.equal(gapFor(1, 2, group, undefined), group, "an authored level's single gap");
});

// The regression that produced readoutCadence: the tighter gap was computed
// correctly and then dropped on the way to the audio, because the readout that
// feeds the station listed the cadence fields by hand.
test("every gap a level computes reaches the readout the station reads", () => {
  // Concrete values, not the spec compared against itself: the regression was a
  // field silently missing, which a self-comparison would have reported as fine.
  const deep = readoutCadence(levelSpec(NAMED_LEVELS));
  assert.equal(deep.repeatInterval.min, GAP_FLOOR.repeat);
  assert.equal(deep.interval.min, GAP_FLOOR.group);
  assert.equal(deep.repeats, 2);
  assert.ok(deep.noise.wash > 0);

  const authored = readoutCadence(levelSpec(10));
  assert.equal(authored.repeatInterval, undefined, "authored levels carry one gap");
  assert.ok(authored.interval.min > 0);
});

test("the forwarded cadence actually drives the two-tier gap", () => {
  const c = readoutCadence(levelSpec(NAMED_LEVELS));
  assert.notEqual(gapFor(0, c.repeats, c.interval, c.repeatInterval),
    gapFor(1, c.repeats, c.interval, c.repeatInterval),
    "a repeat is timed exactly like a new number: the tiers collapsed");
  assert.equal(gapFor(1, c.repeats, c.interval, c.repeatInterval).min, GAP_FLOOR.repeat);
});

test("a deep readout pass stays countable rather than a smear", () => {
  const s = levelSpec(NAMED_LEVELS);
  // one number = its first utterance plus (repeats - 1) tighter ones
  const perNumber = mean(s.interval) + (s.repeats - 1) * mean(s.repeatInterval);
  assert.ok(perNumber >= GAP_FLOOR.group + GAP_FLOOR.repeat,
    "a number goes by faster than the floors allow");
  // and the whole message is a bounded listen rather than minutes
  const pass = s.digits * perNumber;
  assert.ok(pass < 180_000, `a full pass takes ${(pass / 1000).toFixed(0)}s`);
});

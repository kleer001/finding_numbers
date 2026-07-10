import test from "node:test";
import assert from "node:assert/strict";

import { makeMessage, createProgress, step, score, atSource } from "../src/game/progression.js";
import { levelSpec } from "../src/game/levels.js";
import { LANGUAGES } from "../src/game/config.js";
import { makeRng } from "../src/core/rng.js";
import { makeCell, doorRole } from "../src/maze/cell.js";

test("ordered message climbs 0..n-1 in the level language", () => {
  const m = makeMessage(makeRng(1), levelSpec(2));
  assert.deepEqual(m.map((e) => e.digit), [0, 1, 2, 3, 4, 5]);
  assert.ok(m.every((e) => e.lang === "english"));
});

test("babel finale keeps digits ordered but scatters languages", () => {
  const m = makeMessage(makeRng(2), levelSpec(12));
  assert.deepEqual(m.map((e) => e.digit), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  assert.ok(m.every((e) => LANGUAGES.includes(e.lang)));
});

test("expert message: right length, valid random digits and languages", () => {
  const m = makeMessage(makeRng(3), levelSpec(13));
  assert.equal(m.length, 11);
  assert.ok(m.every((e) => Number.isInteger(e.digit) && e.digit >= 0 && e.digit <= 9));
  assert.ok(m.every((e) => LANGUAGES.includes(e.lang)));
});

test("message is deterministic for a given seed", () => {
  assert.deepEqual(makeMessage(makeRng(42), levelSpec(15)), makeMessage(makeRng(42), levelSpec(15)));
});

test("a 3-digit level wins after three correct steps", () => {
  const p = createProgress(makeMessage(makeRng(7), levelSpec(1)));
  assert.equal(step(p, "correct"), "advance");
  assert.equal(step(p, "correct"), "advance");
  assert.equal(atSource(p), false);
  assert.equal(step(p, "correct"), "win");
  assert.equal(atSource(p), true);
});

test("stray grace: first wrong step free, further strays cost digits", () => {
  const p = createProgress(makeMessage(makeRng(7), levelSpec(3)));
  step(p, "correct");
  step(p, "correct");
  step(p, "wrong");
  assert.equal(score(p), 2);
  step(p, "wrong");
  assert.equal(score(p), 1);
  step(p, "back");
  step(p, "back");
  assert.equal(score(p), 2);
});

test("interior cells deal the requested forward doors", () => {
  const rng = makeRng(3);
  const c2 = makeCell("N", "interior", rng, true, 2);
  assert.equal(Object.values(c2.doors).filter(Boolean).length, 3);
  const c3 = makeCell("N", "interior", rng, true, 3);
  assert.equal(Object.values(c3.doors).filter(Boolean).length, 4);
  assert.notEqual(c3.correctDir, "N");
  assert.equal(doorRole(c3, "N"), "back");
  assert.equal(doorRole(c3, c3.correctDir), "correct");
});

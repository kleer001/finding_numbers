import test from "node:test";
import assert from "node:assert/strict";

import { makeRng } from "../src/core/rng.js";
import { LANGUAGES } from "../src/game/config.js";
import { CADENCES } from "../src/game/levels.js";
import { buildDigits, staticToNoise, makeJukebox } from "../src/game/jukebox.js";

test("ORDERED builds a 0..9 counting melody in the chosen language", () => {
  const rng = makeRng(1);
  const d = buildDigits(rng, "english", "ORDERED");
  assert.equal(d.length, 25);
  d.forEach((e, i) => {
    assert.equal(e.digit, i % 10, `digit at ${i}`);
    assert.equal(e.lang, "english");
  });
});

test("a chosen language locks every digit to that language", () => {
  const rng = makeRng(2);
  const d = buildDigits(rng, "spanish", "LOOP");
  assert.ok(d.every((e) => e.lang === "spanish"));
  assert.ok(d.every((e) => e.digit >= 0 && e.digit <= 9));
});

test("BABEL mixes languages, each a real language", () => {
  const rng = makeRng(3);
  const d = buildDigits(rng, "babel", "LOOP");
  assert.ok(d.every((e) => LANGUAGES.includes(e.lang)));
  assert.ok(new Set(d.map((e) => e.lang)).size > 1, "should not all be one language");
});

test("STATIC dial maps 0..5 to the dread bed monotonically", () => {
  assert.deepEqual(staticToNoise(0), { wash: 0, burst: 0 });
  assert.deepEqual(staticToNoise(5), { wash: 0.7, burst: 1 });
  let prev = -1;
  for (let l = 0; l <= 5; l++) {
    const { wash } = staticToNoise(l);
    assert.ok(wash > prev, `wash rises at ${l}`);
    prev = wash;
  }
});

test("readout: NUMBERS off silences the voice but keeps a cadence/noise", () => {
  const jb = makeJukebox(9);
  const r = jb.readout({ lang: "english", coherence: "LOOP", cadence: "CALM", static: 3, voice: false });
  assert.equal(r.digits.length, 0);
  assert.equal(r.interval, CADENCES.CALM);
  assert.ok(r.noise.wash > 0);
});

test("readout: LOOP repeats the same message, RANDOM keeps changing", () => {
  const jb = makeJukebox(11);
  const loopA = jb.readout({ lang: "english", coherence: "LOOP", cadence: "CALM", static: 0, voice: true }).digits;
  const loopB = jb.readout({ lang: "english", coherence: "LOOP", cadence: "CALM", static: 0, voice: true }).digits;
  assert.deepEqual(loopA, loopB); // stable loop

  const randA = jb.readout({ lang: "english", coherence: "RANDOM", cadence: "CALM", static: 0, voice: true }).digits;
  const randB = jb.readout({ lang: "english", coherence: "RANDOM", cadence: "CALM", static: 0, voice: true }).digits;
  assert.notDeepEqual(randA, randB); // fresh each call
});

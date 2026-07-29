import test from "node:test";
import assert from "node:assert/strict";

import {
  SEED_LEN, SEED_MAX, encodeSeed, decodeSeed, normalizeSeed, cycleSeedChar, markSeedChar,
} from "../src/game/seed.js";
import { CHAR } from "../src/game/config.js";

test("a seed code is always four characters of 0-9A-Z", () => {
  for (const n of [0, 1, 35, 36, 1234, 124000, SEED_MAX - 1]) {
    const code = encodeSeed(n);
    assert.equal(code.length, SEED_LEN, `${n} -> ${code}`);
    assert.match(code, /^[0-9A-Z]{4}$/);
  }
  assert.equal(encodeSeed(0), "0000");
  assert.equal(encodeSeed(SEED_MAX - 1), "ZZZZ");
});

test("every code round-trips through the seed it names", () => {
  for (const n of [0, 7, 1234, 99999, 124000, SEED_MAX - 1]) {
    assert.equal(decodeSeed(encodeSeed(n)), normalizeSeed(n));
  }
  // and every displayable code decodes back to itself
  for (const code of ["0000", "K3F9", "ZZZZ", "0Y1A"]) {
    assert.equal(encodeSeed(decodeSeed(code)), code);
  }
});

test("the URL parser takes codes, and the numbers capture.sh has always passed", () => {
  assert.equal(decodeSeed("K3F9"), parseInt("K3F9", 36));
  assert.equal(decodeSeed("k3f9"), parseInt("K3F9", 36), "case insensitive");
  assert.equal(decodeSeed(" K3F9 "), parseInt("K3F9", 36), "trimmed");
  // a long decimal (a pinned take from before the code format) still lands
  // somewhere deterministic rather than falling back to a random seed
  assert.equal(decodeSeed("124000"), 124000);
  assert.equal(decodeSeed("124000"), decodeSeed("124000"), "and lands there every time");
  assert.ok(decodeSeed("999999999") < SEED_MAX, "folded into the code space");
});

test("the parser reports absence rather than guessing", () => {
  for (const bad of ["", "   ", "K3F9X", "K3-9", "!!", null, undefined, 42]) {
    assert.equal(decodeSeed(bad), null, `${JSON.stringify(bad)} is not a seed`);
  }
});

test("cycling a character wraps within that position only", () => {
  assert.equal(cycleSeedChar("K3F9", 1, 1), "K4F9");
  assert.equal(cycleSeedChar("K3F9", 1, -1), "K2F9");
  assert.equal(cycleSeedChar("K0F9", 1, -1), "KZF9", "0 wraps back to Z");
  assert.equal(cycleSeedChar("KZF9", 1, 1), "K0F9", "Z wraps on to 0");
  assert.equal(cycleSeedChar("K3F9", 0, 1), "L3F9");
  assert.equal(cycleSeedChar("K3F9", 3, 1), "K3FA");
});

test("the marked code still fits the menu's value column", () => {
  const marked = markSeedChar("K3F9", 2);
  assert.equal(marked, "K3[F]9");
  // the panel is 19 columns wide with a label on the left; the value column has
  // room for a stepper on each side of this
  assert.ok(marked.length <= 8, `too wide for the value column: ${marked}`);
  assert.ok(CHAR.W > 0); // config is real, not stubbed
});

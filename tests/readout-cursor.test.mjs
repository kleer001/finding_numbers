import test from "node:test";
import assert from "node:assert/strict";

import { capturedIdx } from "../src/audio/station.js";
import { levelSpec } from "../src/game/levels.js";

// The readout is a flat cursor over (digits x repeats), read in order and wrapped.
// capturedIdx names the slot whose next utterance is the digit just captured.
const spoken = (idx, digits, repeats) => digits[Math.floor(idx / repeats)];

test("the cursor lands so the very next digit spoken is the new one", () => {
  for (const repeats of [1, 2, 3]) {
    for (const count of [1, 2, 5, 14, 62]) {
      const digits = Array.from({ length: count }, (_, i) => i);
      const idx = capturedIdx(count, repeats);
      assert.equal(spoken(idx, digits, repeats), count - 1,
        `count ${count}, repeats ${repeats}: expected the last digit`);
      assert.ok(idx < count * repeats, "and stays inside the pass");
    }
  }
});

test("the new digit is still spoken its full number of repeats", () => {
  const repeats = 2;
  const digits = [0, 1, 2, 3];
  let idx = capturedIdx(digits.length, repeats);
  const heard = [];
  const total = digits.length * repeats;
  for (let i = 0; i < repeats; i++) {
    heard.push(spoken(idx, digits, repeats));
    idx += 1;
  }
  assert.deepEqual(heard, [3, 3], "said as many times as every other digit");
  assert.equal(idx, total, "and the pass is then complete, so it wraps to the start");
});

test("a one-digit message needs no jump", () => {
  assert.equal(capturedIdx(1, 1), 0);
  assert.equal(capturedIdx(1, 2), 0);
});

// The point of the change: what it costs to learn a turn was correct stops
// depending on how long the message has become.
test("confirmation cost no longer scales with the message", () => {
  const cost = (count, repeats) => count * repeats - capturedIdx(count, repeats);
  assert.equal(cost(14, 2), 2, "level 16's message");
  assert.equal(cost(62, 2), 2, "and a message four times longer costs the same");
  const deep = levelSpec(64);
  assert.equal(cost(deep.digits, deep.repeats), deep.repeats);
});

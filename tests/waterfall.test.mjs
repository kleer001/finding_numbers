import test from "node:test";
import assert from "node:assert/strict";

import { RAMP, VOICE_BAND, quantize, spectrumToColumn } from "../src/render/waterfall.js";

test("brightness quantizes to the full character ramp", () => {
  assert.equal(quantize(0), 0);
  assert.equal(quantize(255), RAMP.length - 1);
  let prev = 0;
  for (let v = 0; v <= 255; v++) {
    const q = quantize(v);
    assert.ok(q >= prev, `monotonic at ${v}`);
    prev = q;
  }
});

test("column samples band peaks across the low voice band only", () => {
  const spectrum = new Uint8Array(512);
  const cut = Math.floor(512 * VOICE_BAND);
  spectrum[0] = 40; // lowest band
  spectrum[cut - 1] = 200; // top of the voice band
  spectrum[cut] = 255; // just above the cut: must be ignored
  const col = spectrumToColumn(spectrum, 3);
  assert.equal(col.length, 3);
  assert.equal(col[0], 40);
  assert.equal(col[2], 200);
});

test("band peaks pick the loudest bin in each band", () => {
  const spectrum = new Uint8Array(512);
  const cut = Math.floor(512 * VOICE_BAND);
  const mid = Math.floor(cut / 2);
  spectrum[mid] = 99;
  spectrum[mid + 1] = 150;
  const col = spectrumToColumn(spectrum, 3);
  assert.equal(col[1], 150);
});

import test from "node:test";
import assert from "node:assert/strict";

import { WATERFALL } from "../src/game/config.js";
import { RAMP, SUB, VOICE_BIN_FRACTION, quantize, spectrumToColumn, stepWaterfall } from "../src/render/waterfall.js";

test("brightness quantizes to the full block-gradient ramp", () => {
  assert.equal(RAMP, " ░▒▓█");
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
  const cut = Math.floor(512 * VOICE_BIN_FRACTION);
  spectrum[0] = 40; // lowest band
  spectrum[cut - 1] = 200; // top of the voice band
  spectrum[cut] = 255; // just above the cut: must be ignored
  const col = spectrumToColumn(spectrum, 3);
  assert.equal(col.length, 3);
  assert.equal(col[0], 40);
  assert.equal(col[2], 200);
});

test("waterfall runs on a half-cell sub-grid inside its strip", () => {
  const levels = stepWaterfall(new Uint8Array(512), 0);
  assert.equal(levels.length, WATERFALL.cols * SUB);
  assert.equal(levels[0].length, WATERFALL.rows * SUB);
});

test("band peaks pick the loudest bin in each band", () => {
  const spectrum = new Uint8Array(512);
  const cut = Math.floor(512 * VOICE_BIN_FRACTION);
  const mid = Math.floor(cut / 2);
  spectrum[mid] = 99;
  spectrum[mid + 1] = 150;
  const col = spectrumToColumn(spectrum, 3);
  assert.equal(col[1], 150);
});

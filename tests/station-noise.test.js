// Render the live hiss bed through an OfflineAudioContext and measure its
// spectrum, so a regression that re-brightens it (e.g. white noise or a raised
// lowpass) fails here instead of only in players' ears. Drives the real
// buildHissChain from station.js — same graph the game runs. The recipe (headless
// OfflineAudioContext + FFT) comes from the sister cyber_synth repo.
import test from "node:test";
import assert from "node:assert/strict";
import { OfflineAudioContext } from "node-web-audio-api";

import { buildHissChain } from "../src/audio/station.js";

const SR = 48000;

// Hann-windowed radix-2 magnitude spectrum of a pow2-length frame.
function magnitude(frame) {
  const n = frame.length;
  const re = new Float64Array(n), im = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const w = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (n - 1));
    re[i] = frame[i] * w;
  }
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len, wr = Math.cos(ang), wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < len >> 1; k++) {
        const a = i + k, b = a + (len >> 1);
        const tr = re[b] * cr - im[b] * ci, ti = re[b] * ci + im[b] * cr;
        re[b] = re[a] - tr; im[b] = im[a] - ti;
        re[a] += tr; im[a] += ti;
        const ncr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = ncr;
      }
    }
  }
  const mag = new Float64Array(n >> 1);
  for (let i = 0; i < n >> 1; i++) mag[i] = Math.hypot(re[i], im[i]);
  return mag;
}

// Average the magnitude spectrum over several windows (noise is stationary), then
// report the 2-5 kHz "harsh"/fatigue-band share of total energy and the centroid.
function measure(data, N = 16384) {
  const acc = new Float64Array(N >> 1);
  const windows = 6, stride = ((data.length - N) / windows) | 0;
  for (let w = 0; w < windows; w++) {
    const off = w * stride, fr = new Float64Array(N);
    for (let i = 0; i < N; i++) fr[i] = data[off + i] || 0;
    const mag = magnitude(fr);
    for (let k = 0; k < acc.length; k++) acc[k] += mag[k];
  }
  let total = 0, harsh = 0, cn = 0;
  for (let k = 0; k < acc.length; k++) {
    const f = (k * SR) / N;
    total += acc[k];
    if (f >= 2000 && f <= 5000) harsh += acc[k];
    cn += f * acc[k];
  }
  return { harshFrac: harsh / total, centroid: cn / total };
}

async function centroidFor(color) {
  const ctx = new OfflineAudioContext(1, SR * 4, SR);
  buildHissChain(ctx, color).out.connect(ctx.destination);
  const rendered = await ctx.startRendering();
  return measure(rendered.getChannelData(0));
}

test("default (pink) hiss stays mellow: harsh 2-5 kHz band and centroid held down", async () => {
  const { harshFrac, centroid } = await centroidFor("pink");

  // The old white-noise / 3 kHz-lowpass bed measured ~45% harsh, ~3400 Hz centroid;
  // pink noise + the 2.2 kHz de-ess + 2.5 kHz lowpass land near ~26% / ~2000 Hz.
  // These bounds sit between the two, so a re-brightening regression trips them.
  assert.ok(harshFrac < 0.35, `harsh 2-5 kHz share ${(harshFrac * 100).toFixed(1)}% should be < 35%`);
  assert.ok(centroid < 2500, `spectral centroid ${centroid.toFixed(0)} Hz should be < 2500`);
});

test("TONE colors order by brightness: brown < pink < white", async () => {
  const brown = (await centroidFor("brown")).centroid;
  const pink = (await centroidFor("pink")).centroid;
  const white = (await centroidFor("white")).centroid;
  assert.ok(brown < pink, `brown ${brown.toFixed(0)} Hz should be darker than pink ${pink.toFixed(0)} Hz`);
  assert.ok(pink < white, `pink ${pink.toFixed(0)} Hz should be darker than white ${white.toFixed(0)} Hz`);
});

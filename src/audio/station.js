// The number-station audio: an always-on band-limited hiss bed (never fades) and
// a voice bus that reads the currently-audible digits in sequence. Built to the
// NUMBER_STATION_SOUND_DESIGN reference: mono, band-limited 300-3000 Hz, light
// saturation, slow irregular QSB fade on the voice only.

import { LANGUAGES } from "../game/config.js";

const VOICE_BAND = [300, 3000];

let ctx = null;
let master = null;
let voiceIn = null; // input node of the voice chain (per-digit sources connect here)
let buffers = {}; // lang -> [10 AudioBuffer]
// getReadout() -> { digits: [{digit, lang}], repeats, interval } (see levels.js)
let getReadout = () => ({ digits: [], repeats: 1, interval: { min: 1000, max: 4000, step: 250 } });
let armed = false;
let counter = 0; // total digits played (debug)
let readIdx = 0; // position in the current in-order readout (repeats expanded)

export function init(readoutFn) {
  getReadout = readoutFn;
}

export function debug() {
  return {
    armed,
    ctxState: ctx && ctx.state,
    langsLoaded: Object.keys(buffers).filter((l) => buffers[l].every(Boolean)).length,
    digitsPlayed: counter,
  };
}

// Must be called from a user gesture (autoplay policy). Idempotent.
export async function arm() {
  if (armed) return;
  armed = true;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  ctx = new AC();
  await ctx.resume();

  master = ctx.createGain();
  master.gain.value = 0.9;
  master.connect(ctx.destination);

  buildHissBed();
  buildVoiceBus();
  await loadDigits();
  scheduleNext();
}

function buildHissBed() {
  const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.loop = true;

  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = VOICE_BAND[0];
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = VOICE_BAND[1];
  const gain = ctx.createGain();
  gain.gain.value = 0.06; // constant floor — the voice rides ~15dB above this

  src.connect(hp).connect(lp).connect(gain).connect(master);
  src.start();
}

function buildVoiceBus() {
  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = VOICE_BAND[0];
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = VOICE_BAND[1];

  const shaper = ctx.createWaveShaper();
  shaper.curve = saturationCurve(0.4);

  // QSB: slow irregular amplitude fade on the voice bus only.
  const qsb = ctx.createGain();
  qsb.gain.value = 0.8;
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.15;
  const lfoDepth = ctx.createGain();
  lfoDepth.gain.value = 0.35;
  lfo.connect(lfoDepth).connect(qsb.gain);
  lfo.start();

  hp.connect(lp).connect(shaper).connect(qsb).connect(master);
  voiceIn = hp;
}

function saturationCurve(amount) {
  const n = 1024;
  const curve = new Float32Array(n);
  const k = amount * 12;
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1;
    curve[i] = ((1 + k) * x) / (1 + k * Math.abs(x));
  }
  return curve;
}

async function loadDigits() {
  const jobs = [];
  for (const lang of LANGUAGES) {
    buffers[lang] = new Array(10).fill(null);
    for (let n = 0; n < 10; n++) {
      jobs.push(
        fetch(`assets/audio/${lang}_0${n}.wav`)
          .then((r) => r.arrayBuffer())
          .then((b) => ctx.decodeAudioData(b))
          .then((buf) => { buffers[lang][n] = buf; }),
      );
    }
  }
  await Promise.all(jobs);
}

function playDigit(entry) {
  const buf = buffers[entry.lang] && buffers[entry.lang][entry.digit];
  if (!buf || !voiceIn) return;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const g = ctx.createGain();
  g.gain.value = 0.9 * (1 + (Math.random() * 0.3 - 0.15)); // +/-1.5dB level jitter
  src.connect(g).connect(voiceIn);
  src.start();
}

function scheduleNext() {
  const { min, max, step } = getReadout().interval;
  const steps = Math.floor((max - min) / step);
  const wait = min + step * ((Math.random() * (steps + 1)) | 0);
  setTimeout(() => {
    const { digits, repeats } = getReadout();
    const total = digits.length * repeats;
    if (total > 0) {
      // Read strictly in order (each digit spoken `repeats` times) and wrap, so
      // the newest digit is always the last one spoken before the pass repeats.
      if (readIdx >= total) readIdx = 0;
      playDigit(digits[Math.floor(readIdx / repeats)]);
      readIdx++;
      counter++;
    }
    scheduleNext();
  }, wait);
}

// Victory chime: a rising ten-note square-wave arpeggio (C major pentatonic),
// short blips with a gain fade, kept quiet. Routed direct to master (no QSB).
const VICTORY_NOTES = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51, 1567.98, 1760];

export function victory() {
  if (!ctx || !master) return;
  const t0 = ctx.currentTime;
  const gap = 0.09;
  VICTORY_NOTES.forEach((freq, i) => {
    const t = t0 + i * gap;
    const osc = ctx.createOscillator();
    osc.type = "square";
    osc.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.12, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + gap * 1.6);
    osc.connect(g).connect(master);
    osc.start(t);
    osc.stop(t + gap * 1.8);
  });
}

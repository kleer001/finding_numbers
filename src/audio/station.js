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
// getReadout() -> { digits: [{digit, lang}], repeats, interval, noise } (levels.js)
let getReadout = () => ({
  digits: [],
  repeats: 1,
  interval: { min: 1000, max: 4000, step: 250 },
  noise: { wash: 0, burst: 0 },
});
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
    noise: washLevel && {
      wash: washLevel.gain.value,
      burst: burstGain.gain.value,
      duck: duck.gain.value,
    },
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
  buildNoiseBed();
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

// --- brown-noise dread bed ---------------------------------------------------
// Slow washes that swell and recede, plus bursts placed in the gaps between
// digits. The clues are sacred: the bed sits below the voice band (lowpass) AND
// hard-ducks whenever a digit speaks, so it threatens the signal but never
// touches it. Intensities come from the current level via getReadout().noise.

let washLevel = null; // slow-swell gain, scaled by the level's wash intensity
let burstGain = null; // envelope gain for between-digit stabs
let duck = null; // sidechain: dips while a digit speaks

const WASH_PEAK = 0.3; // wash gain at intensity 1 (voice rides ~0.9)
const BURST_PEAK = 0.4;
const DUCK_FLOOR = 0.12;

function buildNoiseBed() {
  // brown noise: leaky-integrated white noise, looped; edges windowed to kill
  // the loop-seam click
  const buf = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let b = 0;
  for (let i = 0; i < d.length; i++) {
    b += 0.02 * (Math.random() * 2 - 1 - b);
    d[i] = b * 3.5;
  }
  for (let i = 0; i < 400; i++) {
    d[i] *= i / 400;
    d[d.length - 1 - i] *= i / 400;
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.loop = true;

  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 700; // stay under the 300-3000 voice band's core

  washLevel = ctx.createGain();
  washLevel.gain.value = 0;
  burstGain = ctx.createGain();
  burstGain.gain.value = 0;
  duck = ctx.createGain();
  duck.gain.value = 1;

  src.connect(lp);
  lp.connect(washLevel).connect(duck);
  lp.connect(burstGain).connect(duck);
  duck.connect(master);
  src.start();
  scheduleWash();
}

// Irregular swells: ramp toward a random fraction of the level's wash
// intensity, then re-aim. Reads the level fresh each cycle.
function scheduleWash() {
  const { wash } = getReadout().noise;
  const t = ctx.currentTime;
  const target = wash * WASH_PEAK * (0.3 + Math.random() * 0.7);
  const rise = 2 + Math.random() * 4;
  washLevel.gain.cancelScheduledValues(t);
  washLevel.gain.setValueAtTime(washLevel.gain.value, t);
  washLevel.gain.linearRampToValueAtTime(target, t + rise);
  setTimeout(scheduleWash, (rise + 1 + Math.random() * 5) * 1000);
}

// A burst that lives entirely inside the pause before the next digit: it is
// scheduled to hit zero 350ms before the digit fires. Structural guarantee, not
// a mixing hope.
function scheduleBurst(waitMs) {
  const { burst } = getReadout().noise;
  if (!burstGain || burst <= 0 || waitMs < 1400) return;
  const now = ctx.currentTime;
  const t0 = now + 0.15;
  const end = now + waitMs / 1000 - 0.35;
  const peak = burst * BURST_PEAK * (0.4 + Math.random() * 0.6);
  const g = burstGain.gain;
  g.cancelScheduledValues(now);
  g.setValueAtTime(0, t0);
  g.linearRampToValueAtTime(peak, t0 + (end - t0) * 0.4);
  g.linearRampToValueAtTime(0, end);
}

function duckFor(seconds) {
  const t = ctx.currentTime;
  const g = duck.gain;
  g.cancelScheduledValues(t);
  g.setValueAtTime(g.value, t);
  g.linearRampToValueAtTime(DUCK_FLOOR, t + 0.05);
  g.setValueAtTime(DUCK_FLOOR, t + seconds + 0.1);
  g.linearRampToValueAtTime(1, t + seconds + 0.5);
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
  duckFor(buf.duration);
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
  scheduleBurst(wait);
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

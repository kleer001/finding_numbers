// Boot: wire canvas, input, update+render loop, the CRT filter, and prefs menu.

import { CANVAS, CRT_CONFIG, CRT_NOISE_MAX, TRANSITION_MS, TINTS } from "./game/config.js";
import { MAX_LEVEL } from "./game/levels.js";
import { createState, setLevel, tryMove, update } from "./game/state.js";
import { installInput, installTouch, tapZone } from "./game/input.js";
import { render, renderStatic } from "./render/render.js";
import { renderMenu, menuHit } from "./render/menu.js";
import { CRTFilterWebGL } from "./lib/CRTFilter.js";
import * as station from "./audio/station.js";

const canvas = document.getElementById("game");
canvas.width = CANVAS.W;
canvas.height = CANVAS.H;
// willReadFrequently: the CRT filter reads the canvas back every frame.
const ctx = canvas.getContext("2d", { willReadFrequently: true });

// --- persistence: prefs + current level survive a reload -------------------

const SAVE_KEY = "finding_numbers.v1";

function loadSave() {
  let s = {};
  try {
    s = JSON.parse(localStorage.getItem(SAVE_KEY)) ?? {};
  } catch {
    s = {}; // corrupt or unavailable storage: start fresh
  }
  return {
    crt: typeof s.crt === "boolean" ? s.crt : true,
    crtNoise: Number.isInteger(s.crtNoise) && s.crtNoise >= 0 && s.crtNoise <= 5 ? s.crtNoise : 0,
    showCount: typeof s.showCount === "boolean" ? s.showCount : false,
    tint: s.tint === "green" ? "green" : "amber",
    level: Number.isInteger(s.level) && s.level >= 1 && s.level <= MAX_LEVEL ? s.level : 1,
  };
}

function save() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ ...prefs, level: state.level }));
  } catch {
    // storage unavailable (private mode etc.): play on without persistence
  }
}

const saved = loadSave();
const prefs = { crt: saved.crt, crtNoise: saved.crtNoise, showCount: saved.showCount, tint: saved.tint };
const state = createState((performance.now() * 1000) | 0 || 1, saved.level);
const menu = { open: false, index: 0 };
window.game = state; // dev handles: inspect / drive from the console
window.station = station;
window.prefs = prefs;
window.menu = menu;

// The station reads whatever the current level says: audible entries, how many
// times each is spoken, the cadence between digits, and the dread-noise levels.
station.init(() => ({
  digits: state.audibleDigits,
  repeats: state.spec.repeats,
  interval: state.spec.interval,
  noise: state.spec.noise,
}));

// --- preferences menu: rows are data; keyboard and taps share change() -----

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

const MENU_ROWS = [
  {
    label: "CRT FX",
    value: () => (prefs.crt ? "ON" : "OFF"),
    change: () => { prefs.crt = !prefs.crt; applyCrt(); },
  },
  {
    label: "CRT NOISE",
    value: () => String(prefs.crtNoise),
    change: (d) => { prefs.crtNoise = clamp(prefs.crtNoise + d, 0, 5); applyCrtNoise(); },
  },
  {
    label: "SHOW NUMBERS",
    value: () => (prefs.showCount ? "ON" : "OFF"),
    change: () => { prefs.showCount = !prefs.showCount; },
  },
  {
    label: "TINT",
    value: () => prefs.tint.toUpperCase(),
    change: () => { prefs.tint = prefs.tint === "amber" ? "green" : "amber"; },
  },
  {
    label: "LEVEL",
    value: () => String(state.level),
    change: (d) => setLevel(state, clamp(state.level + d, 1, MAX_LEVEL)),
  },
  {
    // Tap to play the winning tones; value shows the live audio state so a
    // silent device tells us whether the context is running or suspended.
    label: "SOUND TEST",
    value: () => (station.debug().ctxState ?? "off").toUpperCase(),
    change: () => station.testTone(),
  },
];

function menuChange(row, delta) {
  menu.index = row;
  MENU_ROWS[row].change(delta);
  save();
}

function menuNav(dir) {
  const n = MENU_ROWS.length;
  if (dir === "N") menu.index = (menu.index + n - 1) % n;
  else if (dir === "S") menu.index = (menu.index + 1) % n;
  else menuChange(menu.index, dir === "E" ? 1 : -1);
}

// --- input ------------------------------------------------------------------

function handleMove(dir) {
  station.arm();
  if (menu.open) menuNav(dir);
  else if (tryMove(state, dir) === "win") station.victory();
}

function handleKey(code) {
  station.arm();
  if (code === "KeyP") menu.open = !menu.open;
  else if (code === "Escape") menu.open = false;
  else if (code === "KeyC") { prefs.crt = !prefs.crt; applyCrt(); save(); }
}

function handleTap(x, y) {
  station.arm();
  if (menu.open) {
    const hit = menuHit(x, y, MENU_ROWS.length);
    if (!hit) return;
    if (hit.type === "close") menu.open = false;
    else menuChange(hit.row, hit.delta);
    return;
  }
  const zone = tapZone(x, y);
  if (zone.type === "prefs") menu.open = true;
  else handleMove(zone.dir);
}

// Held finger auto-repeats movement only; menu steppers stay tap-only.
function handleHold(x, y) {
  if (menu.open) return;
  const zone = tapZone(x, y);
  if (zone.type === "move") handleMove(zone.dir);
}

installInput(handleMove, handleKey);
installTouch(handleTap, handleHold);

// --- CRT filter --------------------------------------------------------------

// NOISE dial: lerp each field from its base value (0) to CRT_NOISE_MAX (5).
function crtNoiseConfig() {
  const t = prefs.crtNoise / 5;
  const cfg = { ...CRT_CONFIG };
  for (const k of Object.keys(CRT_NOISE_MAX)) {
    cfg[k] = CRT_CONFIG[k] + (CRT_NOISE_MAX[k] - CRT_CONFIG[k]) * t;
  }
  return cfg;
}

let crt = null;
function applyCrt() {
  if (prefs.crt && !crt) {
    crt = new CRTFilterWebGL(canvas, crtNoiseConfig());
    crt.start();
  } else if (!prefs.crt && crt) {
    crt.stop();
    crt = null;
  }
}

function applyCrtNoise() {
  if (crt) Object.assign(crt.config, crtNoiseConfig());
}

// --- main loop ----------------------------------------------------------------

const spectrum = new Uint8Array(station.SPECTRUM_BINS);
let savedLevel = state.level;
let last = performance.now();
function frame(now) {
  const dt = now - last;
  last = now;
  update(state, dt, now);
  if (state.level !== savedLevel) {
    savedLevel = state.level; // level advanced by a win: persist it
    save();
  }
  const tint = TINTS[prefs.tint];
  station.getSpectrum(spectrum);
  if (state.transition) renderStatic(ctx, Math.min(1, state.transition.t / TRANSITION_MS), tint.rgb);
  else render(ctx, state, prefs.showCount, tint, spectrum);
  if (menu.open) renderMenu(ctx, menu.index, MENU_ROWS.map((r) => ({ label: r.label, value: r.value() })), tint.fg);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

applyCrt();

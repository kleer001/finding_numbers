// Boot: wire canvas, input, update+render loop, the CRT filter, and prefs menu.

import { CANVAS, CRT_CONFIG, CRT_NOISE_MAX, TINTS, PALETTE, LANGUAGES, DIAL_MAX } from "./game/config.js";
import { MAX_LEVEL } from "./game/levels.js";
import { createState, setLevel, tryMove, update, commitWin } from "./game/state.js";
import { installInput, installTouch, tapZone } from "./game/input.js";
import { makeJukebox } from "./game/jukebox.js";
import { render, renderStatic, renderSpiralWipe, renderLostConnection, renderJukebox } from "./render/render.js";
import { renderMenu, menuHit } from "./render/menu.js";
import { renderTitle, titleHit } from "./render/title.js";
import { renderBurnIn } from "./render/burnin.js";
import { CRTFilterWebGL } from "./lib/CRTFilter.js";
import * as station from "./audio/station.js";

const canvas = document.getElementById("game");
canvas.width = CANVAS.W;
canvas.height = CANVAS.H;
// willReadFrequently: the CRT filter reads the canvas back every frame.
const ctx = canvas.getContext("2d", { willReadFrequently: true });

// Offscreen snapshots of the outgoing/incoming levels, composited by the spiral
// wipe on a source-step win (see the frame loop).
const makeLayer = () => {
  const c = document.createElement("canvas");
  c.width = CANVAS.W;
  c.height = CANVAS.H;
  return c.getContext("2d");
};
const oldLevel = makeLayer();
const newLevel = makeLayer();

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
    crtNoise: Number.isInteger(s.crtNoise) && s.crtNoise >= 0 && s.crtNoise <= DIAL_MAX ? s.crtNoise : 0,
    burnIn: typeof s.burnIn === "boolean" ? s.burnIn : false,
    showCount: typeof s.showCount === "boolean" ? s.showCount : false,
    tint: s.tint === "green" ? "green" : "amber",
    dark: typeof s.dark === "boolean" ? s.dark : true,
    jbLang: [...LANGUAGES, "babel"].includes(s.jbLang) ? s.jbLang : "english",
    jbCoherence: ["LOOP", "RANDOM", "ORDERED"].includes(s.jbCoherence) ? s.jbCoherence : "LOOP",
    jbCadence: ["CALM", "BRISK", "RAPID"].includes(s.jbCadence) ? s.jbCadence : "CALM",
    jbStatic: Number.isInteger(s.jbStatic) && s.jbStatic >= 0 && s.jbStatic <= DIAL_MAX ? s.jbStatic : 2,
    jbVoice: typeof s.jbVoice === "boolean" ? s.jbVoice : true,
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

const { level: startLevel, ...prefs } = loadSave();
const state = createState((performance.now() * 1000) | 0 || 1, startLevel);
const title = { open: true }; // boot lands on the splash; C/N gate the first play
const menu = { open: false, index: 0 };
const jukebox = { active: false, index: 0 };
const jukeboxEngine = makeJukebox((performance.now() * 1000) | 0 || 7);
window.game = state; // dev handles: inspect / drive from the console
window.station = station;
window.prefs = prefs;
window.menu = menu;
window.jukebox = jukebox;

// The station reads whatever the current source says: in jukebox mode the picker
// drives it; otherwise the current level (audible entries, repeats, cadence, dread).
station.init(() => {
  if (jukebox.active) {
    return jukeboxEngine.readout({
      lang: prefs.jbLang, coherence: prefs.jbCoherence, cadence: prefs.jbCadence,
      static: prefs.jbStatic, voice: prefs.jbVoice,
    });
  }
  return {
    digits: state.audibleDigits,
    repeats: state.spec.repeats,
    interval: state.spec.interval,
    noise: state.spec.noise,
  };
});

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
    change: (d) => { prefs.crtNoise = clamp(prefs.crtNoise + d, 0, DIAL_MAX); applyCrtNoise(); },
  },
  {
    label: "BURN-IN",
    value: () => (prefs.burnIn ? "ON" : "OFF"),
    change: () => { prefs.burnIn = !prefs.burnIn; },
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
    label: "MODE",
    value: () => (prefs.dark ? "DARK" : "LIGHT"),
    change: () => { prefs.dark = !prefs.dark; },
  },
  {
    label: "JUKEBOX",
    value: () => "PLAY",
    change: () => { jukebox.active = true; menu.open = false; },
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

// Jukebox picker — same {label, value, change} row shape as MENU_ROWS. Listen-only
// fake station: pick a language, coherence, cadence, static, and voice on/off.
const cycle = (arr, cur, d) => arr[(arr.indexOf(cur) + (d || 1) + arr.length) % arr.length];
const JB_LANGS = [...LANGUAGES, "babel"];
const JB_COHERENCE = ["LOOP", "RANDOM", "ORDERED"];
const JB_CADENCE = ["CALM", "BRISK", "RAPID"];

const JUKEBOX_ROWS = [
  {
    label: "LANGUAGE",
    value: () => prefs.jbLang.toUpperCase(),
    change: (d) => { prefs.jbLang = cycle(JB_LANGS, prefs.jbLang, d); },
  },
  {
    label: "COHERENCE",
    value: () => prefs.jbCoherence,
    change: (d) => { prefs.jbCoherence = cycle(JB_COHERENCE, prefs.jbCoherence, d); },
  },
  {
    label: "CADENCE",
    value: () => prefs.jbCadence,
    change: (d) => { prefs.jbCadence = cycle(JB_CADENCE, prefs.jbCadence, d); },
  },
  {
    label: "STATIC",
    value: () => String(prefs.jbStatic),
    change: (d) => { prefs.jbStatic = clamp(prefs.jbStatic + d, 0, DIAL_MAX); },
  },
  {
    label: "NUMBERS",
    value: () => (prefs.jbVoice ? "ON" : "OFF"),
    change: () => { prefs.jbVoice = !prefs.jbVoice; },
  },
  {
    label: "EXIT",
    value: () => "GAME",
    change: () => { jukebox.active = false; },
  },
];

// The prefs menu and the jukebox picker are the same rows-of-{label,value}
// machinery; `activePanel()` picks which one input is steering (jukebox wins).
function activePanel() {
  if (jukebox.active) return { rows: JUKEBOX_ROWS, holder: jukebox };
  if (menu.open) return { rows: MENU_ROWS, holder: menu };
  return null;
}

function rowsChange(rows, holder, row, delta) {
  holder.index = row;
  rows[row].change(delta);
  save();
}

function rowsNav(rows, holder, dir) {
  const n = rows.length;
  if (dir === "N") holder.index = (holder.index + n - 1) % n;
  else if (dir === "S") holder.index = (holder.index + 1) % n;
  else rowsChange(rows, holder, holder.index, dir === "E" ? 1 : -1);
}

// --- title splash -----------------------------------------------------------

// CONTINUE resumes the level loaded from the save; NEW restarts at level 1.
function titleAction(action) {
  if (action === "new") { setLevel(state, 1); save(); }
  title.open = false;
}

// --- input ------------------------------------------------------------------

function handleMove(dir) {
  station.arm();
  const panel = activePanel();
  if (panel) { rowsNav(panel.rows, panel.holder, dir); return; }
  if (title.open) return; // the splash has no movement, only its buttons
  if (tryMove(state, dir) === "win") station.victory();
}

function handleKey(code) {
  station.arm();
  if (jukebox.active) { if (code === "Escape") jukebox.active = false; return; }
  if (menu.open) { if (code === "KeyP" || code === "Escape") menu.open = false; return; }
  if (title.open) {
    if (code === "KeyC") titleAction("continue");
    else if (code === "KeyN") titleAction("new");
    else if (code === "KeyP") menu.open = true; // PREFS is live on the splash too
    return;
  }
  if (code === "KeyP") menu.open = true;
  else if (code === "KeyC") { prefs.crt = !prefs.crt; applyCrt(); save(); }
}

function handleTap(x, y) {
  station.arm();
  const panel = activePanel();
  if (panel) {
    const hit = menuHit(x, y, panel.rows.length);
    if (!hit) return;
    if (hit.type === "close") { menu.open = false; jukebox.active = false; }
    else rowsChange(panel.rows, panel.holder, hit.row, hit.delta);
    return;
  }
  if (title.open) {
    if (tapZone(x, y).type === "prefs") { menu.open = true; return; }
    const action = titleHit(x, y);
    if (action) titleAction(action);
    return;
  }
  const zone = tapZone(x, y);
  if (zone.type === "prefs") menu.open = true;
  else handleMove(zone.dir);
}

// Held finger auto-repeats movement only; panel steppers stay tap-only.
function handleHold(x, y) {
  if (title.open || menu.open || jukebox.active) return;
  const zone = tapZone(x, y);
  if (zone.type === "move") handleMove(zone.dir);
}

installInput(handleMove, handleKey);
installTouch(handleTap, handleHold);

// --- CRT filter --------------------------------------------------------------

// NOISE dial: lerp each field from its base value (0) to CRT_NOISE_MAX (5).
function crtNoiseConfig() {
  const t = prefs.crtNoise / DIAL_MAX;
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

// --- server heartbeat -------------------------------------------------------
// A static client can't otherwise tell the dev server died; ping it and flag a
// lost connection so the loop can overlay <LOST CONNECTION>. Any HTTP response
// means it's up; only a network failure (server down / offline) trips it.

let connectionLost = false;
async function heartbeat() {
  try {
    await fetch(location.href, { method: "HEAD", cache: "no-store" });
    connectionLost = false;
  } catch {
    connectionLost = true;
  }
}
setInterval(heartbeat, 2000);

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
  // Dark mode: phosphor ink on a black page. Light mode swaps the two, so the
  // phosphor becomes the page and black the ink; `rgb` (static tint) is unchanged.
  const base = TINTS[prefs.tint];
  const tint = prefs.dark
    ? { fg: base.fg, bg: PALETTE.bg, rgb: base.rgb }
    : { fg: PALETTE.bg, bg: base.fg, rgb: base.rgb };
  station.getSpectrum(spectrum);
  if (title.open) {
    renderTitle(ctx, tint, startLevel, now);
    if (jukebox.active) renderMenu(ctx, jukebox.index, JUKEBOX_ROWS.map((r) => ({ label: r.label, value: r.value() })), tint.fg, tint.bg, "JUKEBOX");
    else if (menu.open) renderMenu(ctx, menu.index, MENU_ROWS.map((r) => ({ label: r.label, value: r.value() })), tint.fg, tint.bg);
    if (prefs.burnIn) renderBurnIn(ctx, tint, startLevel, prefs.crt);
    requestAnimationFrame(frame);
    return;
  }
  if (jukebox.active) {
    renderJukebox(ctx, tint, spectrum, now);
    renderMenu(ctx, jukebox.index, JUKEBOX_ROWS.map((r) => ({ label: r.label, value: r.value() })), tint.fg, tint.bg, "JUKEBOX");
  } else {
    if (state.transition) {
      const tr = state.transition;
      const p = Math.min(1, tr.t / tr.dur);
      if (tr.next.reset) {
        // Snapshot the outgoing level, advance, snapshot the incoming one — once,
        // at the wipe's start — then spiral one under the other for the duration.
        if (!tr.committed) {
          render(oldLevel, state, prefs.showCount, tint, spectrum, now);
          commitWin(state);
          render(newLevel, state, prefs.showCount, tint, spectrum, now);
        }
        renderSpiralWipe(ctx, p, tint, now, oldLevel.canvas, newLevel.canvas);
      } else {
        renderStatic(ctx, p, tint.rgb); // ordinary cell crossing
      }
    } else render(ctx, state, prefs.showCount, tint, spectrum, now);
    if (menu.open) renderMenu(ctx, menu.index, MENU_ROWS.map((r) => ({ label: r.label, value: r.value() })), tint.fg, tint.bg);
  }
  if (prefs.burnIn) renderBurnIn(ctx, tint, startLevel, prefs.crt);
  if (connectionLost) renderLostConnection(ctx, tint, now);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

applyCrt();

// Start the station at boot so the number-station is playing the moment the
// game loads. Autoplay policy may hold the context suspended until the first
// key/tap; the input handlers re-arm (resume) on that gesture.
station.arm();

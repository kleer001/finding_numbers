// Boot: wire canvas, input, update+render loop, the CRT filter, and prefs menu.

import { CANVAS, CRT_CONFIG, TRANSITION_MS } from "./game/config.js";
import { createState, tryMove, update } from "./game/state.js";
import { installInput, installTouch } from "./game/input.js";
import { render, renderStatic } from "./render/render.js";
import { renderMenu } from "./render/menu.js";
import { CRTFilterWebGL } from "./lib/CRTFilter.js";
import * as station from "./audio/station.js";

const canvas = document.getElementById("game");
canvas.width = CANVAS.W;
canvas.height = CANVAS.H;
// willReadFrequently: the CRT filter reads the canvas back every frame.
const ctx = canvas.getContext("2d", { willReadFrequently: true });

const state = createState((performance.now() * 1000) | 0 || 1);
window.game = state; // dev handle: inspect progression / drive from the console
window.station = station;

const prefs = { crt: true, showCount: false };
const menu = { open: false, index: 0 };
window.prefs = prefs; // dev handles
window.menu = menu;

// The station reads whatever the current level says: audible entries, how many
// times each is spoken, and the cadence between digits.
station.init(() => ({
  digits: state.audibleDigits,
  repeats: state.spec.repeats,
  interval: state.spec.interval,
}));

function handleMove(dir) {
  station.arm();
  if (menu.open) menuNav(dir);
  else if (tryMove(state, dir) === "win") station.victory();
}

function handleKey(code) {
  station.arm();
  if (code === "KeyP") menu.open = !menu.open;
  else if (code === "Escape") menu.open = false;
  else if (code === "KeyC") { prefs.crt = !prefs.crt; applyCrt(); }
}

installInput(handleMove, handleKey);
installTouch(handleMove, () => handleKey("KeyP"));

function menuNav(dir) {
  if (dir === "N") menu.index = (menu.index + 1) % 2;
  else if (dir === "S") menu.index = (menu.index + 1) % 2;
  else changeValue();
}

function changeValue() {
  if (menu.index === 0) { prefs.crt = !prefs.crt; applyCrt(); }
  else prefs.showCount = !prefs.showCount;
}

let crt = null;
function applyCrt() {
  if (prefs.crt && !crt) {
    crt = new CRTFilterWebGL(canvas, CRT_CONFIG);
    crt.start();
  } else if (!prefs.crt && crt) {
    crt.stop();
    crt = null;
  }
}

let last = performance.now();
function frame(now) {
  const dt = now - last;
  last = now;
  update(state, dt, now);
  if (state.transition) renderStatic(ctx, Math.min(1, state.transition.t / TRANSITION_MS));
  else render(ctx, state, prefs.showCount);
  if (menu.open) renderMenu(ctx, menu.index, prefs);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

applyCrt();

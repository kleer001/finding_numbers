// Edge-triggered directional input: one step per keypress. Arrows + WASD + vim.
// Touch adds press-and-hold auto-repeat so a held finger keeps the @ walking.

import { CANVAS, PREFS_BTN } from "./config.js";

const KEYMAP = {
  ArrowUp: "N", KeyW: "N", KeyK: "N",
  ArrowDown: "S", KeyS: "S", KeyJ: "S",
  ArrowLeft: "W", KeyA: "W", KeyH: "W",
  ArrowRight: "E", KeyD: "E", KeyL: "E",
};

// onMove(dir) fires per keydown; onKey(code) for other single keys (toggles).
export function installInput(onMove, onKey) {
  window.addEventListener("keydown", (e) => {
    const dir = KEYMAP[e.code];
    if (dir) {
      e.preventDefault();
      onMove(dir);
      return;
    }
    if (onKey) onKey(e.code);
  });
}

// Touch/click input. A pointerdown is delivered to onTap in canvas space so
// main.js can route it (menu hit-testing when prefs are open, movement/prefs
// zones otherwise). While the pointer stays down, onHold(x, y) fires on an
// interval so holding in a movement zone walks continuously; main.js ignores
// holds while the menu is open (steppers stay tap-only). Listener is on window
// so it works whichever canvas the CRT filter leaves visible.
const HOLD_MS = 150;

export function installTouch(onTap, onHold) {
  let timer = null;
  let last = null; // latest canvas-space pointer position while held

  const toCanvas = (e) => {
    const canvas = document.querySelector("#stage canvas");
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    const x = ((e.clientX - rect.left) / rect.width) * CANVAS.W;
    const y = ((e.clientY - rect.top) / rect.height) * CANVAS.H;
    if (x < 0 || y < 0 || x > CANVAS.W || y > CANVAS.H) return null;
    return { x, y };
  };

  const stop = () => {
    if (timer !== null) clearInterval(timer);
    timer = null;
    last = null;
  };

  window.addEventListener(
    "pointerdown",
    (e) => {
      const p = toCanvas(e);
      if (!p) return;
      e.preventDefault();
      stop(); // clear any prior held pointer before starting this one
      last = p;
      onTap(p.x, p.y);
      timer = setInterval(() => { if (last) onHold(last.x, last.y); }, HOLD_MS);
    },
    { passive: false },
  );

  // Dragging the finger to another zone re-aims the held walk.
  window.addEventListener("pointermove", (e) => {
    if (timer === null) return;
    const p = toCanvas(e);
    if (p) last = p;
  });

  for (const ev of ["pointerup", "pointercancel", "pointerleave"]) {
    window.addEventListener(ev, stop);
  }
}

// Gameplay tap-zones: the screen is split into four triangular regions by its
// diagonals; a tap in a region steps that direction. The bottom-right PREFS box
// is reserved as the preferences button. Anchored to the screen, not the @, so
// zones never clip.
const PREFS_PAD = 16; // thumb margin around the visible PREFS box

export function tapZone(x, y) {
  const b = PREFS_BTN;
  if (x >= b.x - PREFS_PAD && x <= b.x + b.w + PREFS_PAD && y >= b.y - PREFS_PAD && y <= b.y + b.h + PREFS_PAD) {
    return { type: "prefs" };
  }
  const dx = x - CANVAS.W / 2;
  const dy = y - CANVAS.H / 2;
  const dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "E" : "W") : (dy > 0 ? "S" : "N");
  return { type: "move", dir };
}

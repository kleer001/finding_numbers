// Edge-triggered directional input: one step per keypress. Arrows + WASD + vim.

import { CANVAS } from "./config.js";

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

// Touch/click tap-zones: the screen is split into four triangular regions by its
// diagonals; a tap in a region steps that direction. A small top-right corner is
// reserved as the preferences (P) button. Anchored to the screen, not the @, so
// zones never clip. Listener is on window so it works whichever canvas the CRT
// filter leaves visible.
const PREFS_BTN = { w: 84, h: 60 };

export function installTouch(onMove, onPrefs) {
  window.addEventListener(
    "pointerdown",
    (e) => {
      const canvas = document.querySelector("#stage canvas");
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const x = ((e.clientX - rect.left) / rect.width) * CANVAS.W;
      const y = ((e.clientY - rect.top) / rect.height) * CANVAS.H;
      if (x < 0 || y < 0 || x > CANVAS.W || y > CANVAS.H) return;
      e.preventDefault();
      if (x > CANVAS.W - PREFS_BTN.w && y < PREFS_BTN.h) {
        onPrefs();
        return;
      }
      const dx = x - CANVAS.W / 2;
      const dy = y - CANVAS.H / 2;
      const dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "E" : "W") : (dy > 0 ? "S" : "N");
      onMove(dir);
    },
    { passive: false },
  );
}

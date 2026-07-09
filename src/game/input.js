// Edge-triggered directional input: one step per keypress. Arrows + WASD + vim.

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

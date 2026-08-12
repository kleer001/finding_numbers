import test from "node:test";
import assert from "node:assert/strict";

// installInput talks to the DOM, so stand up the smallest window it uses.
function fakeWindow() {
  const handlers = [];
  return {
    focusCalls: 0,
    addEventListener(type, fn) { handlers.push({ type, fn }); },
    focus() { this.focusCalls++; },
    fire(type) { for (const h of handlers) if (h.type === type) h.fn({ code: "" }); },
    typesFor(type) { return handlers.filter((h) => h.type === type).length; },
  };
}

// Embedded on itch.io the game is a cross-origin iframe whose host takes focus
// when its fullscreen button is pressed, and a click cannot give it back: the
// pointerdown preventDefault cancels the compatibility mousedown that would
// have refocused the frame. Without these two listeners the keyboard is dead
// until the player reloads the page.
test("keyboard input reclaims focus on press and on the fullscreen resize", async () => {
  const win = fakeWindow();
  globalThis.window = win;
  const { installInput } = await import("../src/game/input.js");
  installInput(() => {}, () => {});

  assert.ok(win.typesFor("resize") >= 1, "listens for the resize fullscreen causes");
  assert.ok(win.typesFor("pointerdown") >= 1, "listens for a press");

  win.fire("resize");
  assert.equal(win.focusCalls, 1);
  win.fire("pointerdown");
  assert.equal(win.focusCalls, 2);

  delete globalThis.window;
});

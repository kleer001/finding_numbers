import test from "node:test";
import assert from "node:assert/strict";

import { CANVAS, GRID, HUD_ROWS, SCREEN, CHAR, WATERFALL, PREFS_BTN } from "../src/game/config.js";

test("screen is a uniform character grid: maze rows plus HUD rows", () => {
  assert.equal(SCREEN.COLS, GRID.W);
  assert.equal(SCREEN.ROWS, GRID.H + HUD_ROWS);
  assert.equal(CHAR.W * SCREEN.COLS, CANVAS.W);
  assert.equal(CHAR.H * SCREEN.ROWS, CANVAS.H);
});

test("one character cell, one font size, unchanged from the maze", () => {
  assert.equal(CHAR.H, 30);
  assert.equal(CHAR.FONT, 28);
});

test("HUD elements sit on whole character cells", () => {
  assert.equal(PREFS_BTN.x, 18 * CHAR.W);
  assert.equal(PREFS_BTN.y, 17 * CHAR.H);
  assert.equal(PREFS_BTN.w, 5 * CHAR.W);
  assert.equal(PREFS_BTN.h, 3 * CHAR.H);
  assert.equal(WATERFALL.col + WATERFALL.cols, 18); // waterfall ends where PREFS begins
  assert.equal(WATERFALL.row, GRID.H);
  assert.equal(WATERFALL.rows, HUD_ROWS);
});

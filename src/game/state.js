// Game state. The maze is faked: on each door-crossing we discard the current
// cell and build a fresh one (see maze/cell.js). Progression tracks the real
// state (progression.js); cells are just re-dressed scenery.

import { GRID, TRANSITION_MS } from "./config.js";
import { makeCell, doorRole, doorEntryTile, atDoor, isFloor, OPPOSITE } from "../maze/cell.js";
import { makeRng } from "../core/rng.js";
import {
  createProgress, makeMessage, step, score, audibleDigits, atSource,
} from "./progression.js";

export function createState(seed) {
  const rng = makeRng(seed >>> 0);
  const state = { rng, transition: null, sourceGlyph: null };
  newMaze(state);
  return state;
}

function newMaze(state) {
  state.progress = createProgress(makeMessage(state.rng, false));
  enterCell(state, null, "start", false);
}

// Build the cell being entered and drop the player at its entry door / room.
function enterCell(state, entryDir, kind, frontier) {
  state.cell = makeCell(entryDir, kind, state.rng, frontier);
  if (kind === "start" || kind === "source") {
    state.player = { x: GRID.CX, y: GRID.CY };
    if (kind === "source") state.player = doorEntryTile(entryDir);
  } else {
    state.player = doorEntryTile(entryDir);
  }
  refresh(state);
}

function refresh(state) {
  state.score = score(state.progress);
  state.audibleDigits = audibleDigits(state.progress);
}

// One grid step, or a door-crossing that starts a transition. Returns an event
// tag ('advance'|'stray'|'return'|'retreat'|'win'|'reset'|null) for audio.
export function tryMove(state, dir) {
  if (state.transition) return null;
  const D = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] }[dir];
  const nx = state.player.x + D[0];
  const ny = state.player.y + D[1];

  if (isFloor(state.cell, nx, ny)) {
    state.player.x = nx;
    state.player.y = ny;
    // Stepping onto the source glyph wins the level -> a fresh maze.
    if (state.cell.kind === "source" && nx === GRID.CX && ny === GRID.CY) {
      return beginTransition(state, { reset: true }, "reset");
    }
    return null;
  }

  // Off-grid move: only valid through a door opening -> leave the cell.
  if (atDoor(dir, state.player.x, state.player.y, state.cell.doors)) {
    const role = doorRole(state.cell, dir);
    const ev = step(state.progress, role);
    const next = ev === "win"
      ? { entryDir: OPPOSITE[dir], kind: "source", frontier: false }
      : {
          entryDir: OPPOSITE[dir],
          kind: state.progress.depth === 0 ? "start" : "interior",
          frontier: state.progress.stray === 0,
        };
    return beginTransition(state, next, ev);
  }
  return null;
}

function beginTransition(state, next, ev) {
  state.transition = { t: 0, next };
  refresh(state); // audible count updates immediately; the visual catches up
  return ev;
}

// Advance the static-cut transition; commit the new cell when it completes.
export function update(state, dtMs, nowMs) {
  if (state.cell.kind === "source" && !state.transition) {
    state.sourceGlyph = String(Math.floor(nowMs / 120) % 10);
  } else {
    state.sourceGlyph = null;
  }

  if (!state.transition) return;
  state.transition.t += dtMs;
  if (state.transition.t < TRANSITION_MS) return;

  const next = state.transition.next;
  state.transition = null;
  if (next.reset) newMaze(state);
  else enterCell(state, next.entryDir, next.kind, next.frontier);
}

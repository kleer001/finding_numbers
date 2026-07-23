// Game state. The maze is faked: on each door-crossing we discard the current
// cell and build a fresh one (see maze/cell.js). Progression tracks the real
// state (progression.js); cells are just re-dressed scenery.

import { GRID, TRANSITION_MS, WIN_WIPE_MS, STATION_FREQS } from "./config.js";
import { levelSpec, MAX_LEVEL } from "./levels.js";
import { makeCell, buildRoomPlan, doorRole, doorEntryTile, atDoor, isFloor, OPPOSITE } from "../maze/cell.js";
import { makeRng, subSeed } from "../core/rng.js";
import {
  createProgress, makeMessage, step, score, audibleDigits,
} from "./progression.js";

export function createState(seed, startLevel = 1) {
  const rng = makeRng(seed >>> 0);
  const state = { rng, seed: seed >>> 0, level: startLevel, transition: null, sourceGlyph: null, started: false };
  newMaze(state);
  return state;
}

// Jump straight to a level (prefs level select). Rebuilds the maze immediately.
export function setLevel(state, level) {
  state.level = level;
  state.transition = null;
  newMaze(state);
}

function newMaze(state) {
  state.spec = levelSpec(state.level);
  // Radio-dial flavor: a station frequency picked per level off a side stream,
  // so it varies by level and session without disturbing the maze RNG.
  state.frequency = STATION_FREQS[subSeed(state.seed, `freq${state.level}`) % STATION_FREQS.length];
  state.progress = createProgress(makeMessage(state.rng, state.spec));
  // Golden path laid out up front: the start's exit + each decision room's
  // honesty-bounded change sequence (see cell.js buildRoomPlan). roomVisits
  // counts entries per depth to index into that sequence.
  const backbone = buildRoomPlan(state.rng, state.spec);
  state.startExit = backbone.startExit;
  state.roomPlan = backbone.rooms;
  state.roomVisits = [];
  enterCell(state, null, "start", false);
}

// Build the cell being entered and drop the player at its entry door / room.
function enterCell(state, entryDir, kind, frontier, pending) {
  const plan = resolvePlan(state, entryDir, kind, frontier);
  state.cell = makeCell(entryDir, kind, state.rng, frontier, state.spec.forwardDoors, state.spec.theme, plan);
  state.cell.pending = pending ?? null; // corridor only: the real cell beyond it
  if (kind === "start" || kind === "source") {
    state.player = { x: GRID.CX, y: GRID.CY };
    if (kind === "source") state.player = doorEntryTile(entryDir);
  } else {
    state.player = doorEntryTile(entryDir);
  }
  refresh(state);
}

// The level-plan slice for the cell being entered: the first start's fixed exit,
// or a frontier room's current forwards + correct door. Each frontier entry
// advances that room's change budget (clamped, so it freezes once spent).
// Off-frontier stray cells and corridors get none — they stay faked/random.
function resolvePlan(state, entryDir, kind, frontier) {
  if (kind === "start" && entryDir === null) return { exit: state.startExit };
  if (kind !== "interior" || !frontier) return null;
  const depth = state.progress.depth;
  const room = state.roomPlan[depth];
  if (!room) return null;
  const visited = state.roomVisits[depth] ?? 0;
  state.roomVisits[depth] = visited + 1;
  return {
    back: room.back,
    forwards: room.forwards,
    correctDir: room.correctSeq[Math.min(visited, room.budget)],
  };
}

function refresh(state) {
  state.score = score(state.progress);
  state.goal = state.progress.message.length;
  state.audibleDigits = audibleDigits(state.progress);
}

// One grid step, or a door-crossing that starts a transition. Returns an event
// tag ('advance'|'stray'|'return'|'retreat'|'win'|'reset'|null) for audio.
export function tryMove(state, dir) {
  state.started = true; // any directional input clears the cold-open banner
  if (state.transition) return null;
  const D = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] }[dir];
  const nx = state.player.x + D[0];
  const ny = state.player.y + D[1];

  if (isFloor(state.cell, nx, ny)) {
    state.player.x = nx;
    state.player.y = ny;
    // Stepping onto the source glyph wins the level -> advance to the next.
    if (state.cell.kind === "source" && nx === GRID.CX && ny === GRID.CY) {
      return beginTransition(state, { reset: true, advance: true }, "reset");
    }
    return null;
  }

  // Off-grid move: only valid through a door opening -> leave the cell.
  if (atDoor(dir, state.player.x, state.player.y, state.cell)) {
    // Corridors carry no decision: onward leads to the pending real cell, back
    // undoes the crossing that inserted them (which was always a forward one).
    if (state.cell.kind === "corridor") {
      if (dir !== state.cell.backDir) {
        // corridors may bend: enter the pending cell from the side we exit
        return beginTransition(state, { ...state.cell.pending, entryDir: OPPOSITE[dir] }, null);
      }
      const ev = step(state.progress, "back");
      return beginTransition(state, nextFromProgress(state, dir), ev);
    }

    const role = doorRole(state.cell, dir);
    const ev = step(state.progress, role);
    let next = ev === "win"
      ? { entryDir: OPPOSITE[dir], kind: "source", frontier: false }
      : nextFromProgress(state, dir);
    // Empty pass-through cells pad forward walks only, so a corridor's rear
    // door can always mean step('back').
    const forward = ev === "advance" || ev === "stray" || ev === "win";
    if (forward && state.rng.chance(state.spec.corridorChance)) {
      next = { entryDir: OPPOSITE[dir], kind: "corridor", pending: next };
    }
    return beginTransition(state, next, ev);
  }
  return null;
}

function nextFromProgress(state, dir) {
  return {
    entryDir: OPPOSITE[dir],
    kind: state.progress.depth === 0 ? "start" : "interior",
    frontier: state.progress.stray === 0,
  };
}

function beginTransition(state, next, ev) {
  // The source-step win gets a longer beat for the spiral wipe; crossings cut fast.
  const dur = next.reset ? WIN_WIPE_MS : TRANSITION_MS;
  state.transition = { t: 0, next, dur, committed: false };
  refresh(state); // audible count updates immediately; the visual catches up
  return ev;
}

// Advance the level and rebuild the maze at the START of a win wipe, so the
// spiral can reveal the incoming level while the outgoing one is still on screen.
// The render layer calls this once, after snapshotting the outgoing level.
export function commitWin(state) {
  const next = state.transition.next;
  if (next.advance) state.level = Math.min(state.level + 1, MAX_LEVEL);
  newMaze(state);
  state.transition.committed = true;
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
  if (state.transition.t < state.transition.dur) return;

  const next = state.transition.next;
  // A win commits at the wipe's start (commitWin); wait for that so we don't clear
  // the transition before the spiral has both levels to draw.
  if (next.reset && !state.transition.committed) return;
  state.transition = null;
  if (!next.reset) enterCell(state, next.entryDir, next.kind, next.frontier, next.pending);
}

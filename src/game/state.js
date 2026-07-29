// Game state. The maze is faked: on each door-crossing we discard the current
// cell and build a fresh one (see maze/cell.js). Progression tracks the real
// state (progression.js); cells are just re-dressed scenery.

import { GRID, TRANSITION_MS, WIN_WIPE_MS, WIN_BLACK_MS, STATION_FREQS } from "./config.js";
import { levelSpec } from "./levels.js";
import { makeCell, buildRoomPlan, strayRoomPlan, doorRole, doorEntryTile, atDoor, isFloor, OPPOSITE } from "../maze/cell.js";
import { makeRng, subSeed } from "../core/rng.js";
import {
  createProgress, makeMessage, step, score, audibleDigits,
} from "./progression.js";

// The seed is the whole of the run's randomness. There is no advancing stream on the
// state: everything is derived from the seed plus what it is being derived for, so a
// run is a pure function of its code (see roomRng).
export function createState(seed, startLevel = 1) {
  const state = { seed: seed >>> 0, level: startLevel, transition: null, sourceGlyph: null, started: false };
  newMaze(state);
  return state;
}

// Swap the run's seed and rebuild. The seed names the maze, so changing it is a
// new set of rooms at the level the player is standing on.
export function setSeed(state, seed) {
  state.seed = seed >>> 0;
  state.transition = null;
  newMaze(state);
}

// Jump to a level and rebuild its maze immediately. Restarting the current
// level and restarting the game (level 1) are both this call.
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
  // The message and the route come off a stream derived from the seed and the
  // level, not from the live maze stream. A seed is only worth sharing if it names
  // the same rooms for everyone, and drawing from the live stream made the layout
  // depend on how many levels had been played to get here — so the same seed and
  // level gave different mazes to a player who arrived by playing and one who
  // restarted. Scenery (corridor insertion, stray rooms) still uses the live rng.
  const maze = makeRng(subSeed(state.seed, `maze${state.level}`));
  state.progress = createProgress(makeMessage(maze, state.spec));
  // Golden path laid out up front: the start's exit + each decision room's
  // honesty-bounded change sequence (see cell.js buildRoomPlan). roomVisits
  // counts entries per depth to index into that sequence.
  const backbone = buildRoomPlan(maze, state.spec);
  state.startExit = backbone.startExit;
  state.roomPlan = backbone.rooms;
  state.roomVisits = [];
  state.strayPath = [];
  enterCell(state, null, "start", false);
}

// Which room the player is in, as a stable string: the level, how far along the
// golden path, the exact wrong turns taken to get here, and what kind of cell it
// is. Anything derived from this is the same every time the player walks back in.
// `kind` is passed explicitly while a cell is being built, before state.cell exists.
export function roomKey(state, kind = state.cell?.kind) {
  return `${state.level}:${state.progress.depth}:${state.strayPath.join("")}:${kind}`;
}

// A stream of the run's randomness belonging to one room and one purpose. Every cell
// in the game is built from one of these rather than from a single advancing stream,
// which is what makes a room the same room on the way back — and what lets a shared
// seed name the same maze for two players instead of depending on how many moves each
// had made getting there. `label` separates purposes that must not correlate.
export function roomRng(state, label, kind = state.cell?.kind) {
  return makeRng(subSeed(state.seed, `${label}${roomKey(state, kind)}`));
}

// A room's surface: corridor half-width and wall glyph. The deeper zones offer
// arrays for these ("pick per cell"), and picking them off the live maze stream
// meant the same room came back a different shape on every entry — a five-wide
// hall one visit and a one-wide squeeze the next. Doors were already fixed, so the
// room stayed solvable, but it could not be *recognised*, which is the whole thing
// the honest levels promise and the only ground the lying ones are measured
// against. Resolved from a room-keyed stream instead: one surface for the run.
function roomTheme(state, kind) {
  const theme = state.spec.theme;
  const rng = roomRng(state, "theme", kind);
  return {
    ...theme,
    half: Array.isArray(theme.half) ? rng.pick(theme.half) : theme.half,
    wall: Array.isArray(theme.wall) ? rng.pick(theme.wall) : theme.wall,
  };
}

// Build the cell being entered and drop the player at its entry door / room.
function enterCell(state, entryDir, kind, frontier, pending) {
  const stray = strayLayout(state, kind, frontier);
  const plan = stray ? stray.plan : resolvePlan(state, entryDir, kind, frontier);
  // Every cell is built from a stream keyed by which room it is, so nothing about it
  // depends on how many moves were made getting here. A corridor's own bend is the
  // last thing that used the live stream.
  const rng = stray ? stray.rng : roomRng(state, "cell", kind);
  state.cell = makeCell(entryDir, kind, rng, frontier, state.spec.forwardDoors, roomTheme(state, kind), plan);
  state.cell.pending = pending ?? null; // corridor only: the real cell beyond it
  if (kind === "start" || kind === "source") {
    state.player = { x: GRID.CX, y: GRID.CY };
    if (kind === "source") state.player = doorEntryTile(entryDir);
  } else {
    state.player = doorEntryTile(entryDir);
  }
  refresh(state);
}

// An off-path room is laid out from the route that reached it, so the same wrong
// turn always rebuilds the same room — and, like a golden-path room, it shows its
// whole door set from whichever side you re-enter, so backing out of a deeper
// stray finds the room you left instead of a fresh roll. Drawn off the live maze
// RNG instead, these re-rolled on every entry: a second, unbudgeted source of
// rooms moving, sitting next to the one honesty is meant to be the only cause of.
// Depth is in the key because a stray hangs off the frontier room it left, and
// the last step of the route fixes which side faces back toward that room.
function strayLayout(state, kind, frontier) {
  if (kind !== "interior" || frontier || !state.strayPath.length) return null;
  const route = state.strayPath;
  const rng = roomRng(state, "stray", kind);
  const back = OPPOSITE[route[route.length - 1]];
  return { rng, plan: strayRoomPlan(rng, back, state.spec.forwardDoors) };
}

// Walking off the path extends the route, walking back shortens it; regaining
// the frontier clears it. Mirrors what step() does to progress.stray, so the
// key always describes where the player actually is.
function trackStray(state, dir, ev) {
  if (ev === "stray") state.strayPath.push(dir);
  else if (ev === "return") state.strayPath.pop();
  else state.strayPath.length = 0;
}

// The level-plan slice for the cell being entered: the first start's fixed exit,
// or a frontier room's current forwards + correct door. Each frontier entry
// advances that room's change budget (clamped, so it freezes once spent).
// Off-frontier stray cells take strayLayout's route-derived plan instead;
// corridors get none, being pass-through scenery with no decision in them.
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
    backIsFixed: true,
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
      trackStray(state, dir, ev);
      return beginTransition(state, nextFromProgress(state, dir), ev);
    }

    const role = doorRole(state.cell, dir);
    const ev = step(state.progress, role);
    trackStray(state, dir, ev);
    let next = ev === "win"
      ? { entryDir: OPPOSITE[dir], kind: "source", frontier: false }
      : nextFromProgress(state, dir);
    // Empty pass-through cells pad forward walks only, so a corridor's rear
    // door can always mean step('back'). Whether one is inserted is keyed to where
    // the crossing lands and which door was taken (progress has already moved by
    // here), so walking a door twice pads the walk the same way both times and two
    // players on one seed take the same route. Last draw off a live stream, gone.
    const forward = ev === "advance" || ev === "stray" || ev === "win";
    if (forward && roomRng(state, `corr${dir}`).chance(state.spec.corridorChance)) {
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
  // The source-step win gets a longer beat for the spiral wipe and the blank
  // hold that follows it; ordinary crossings cut fast.
  const dur = next.reset ? WIN_WIPE_MS + WIN_BLACK_MS : TRANSITION_MS;
  state.transition = { t: 0, next, dur, committed: false };
  refresh(state); // audible count updates immediately; the visual catches up
  return ev;
}

// Advance the level and rebuild the maze at the START of a win wipe, so the
// spiral can reveal the incoming level while the outgoing one is still on screen.
// The render layer calls this once, after snapshotting the outgoing level.
export function commitWin(state) {
  const next = state.transition.next;
  if (next.advance) state.level += 1; // no ceiling: the levels outlast the counter
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

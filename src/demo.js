// Scripted takes for the promo clips listed in video_shot_list.md. Loaded only
// when the page is opened with ?demo=<clip>, which capture.sh does for you.
//
// The driver reads the golden path the level already published — cell.correctDir
// and state.roomPlan — so a take walks the intended route instead of guessing,
// and clips that need a room to betray the player can seek out a room whose
// change budget is actually spendable rather than hoping a level deep enough
// contains one.
//
// Input goes through synthetic keydown events rather than calling the game's
// movers directly, so a take exercises the same path a player does.

import { GRID } from "./game/config.js";
import { OPPOSITE } from "./maze/cell.js";

const KEY = { N: "ArrowUp", S: "ArrowDown", E: "ArrowRight", W: "ArrowLeft" };

// Steps from the tile just inside a door to the center junction.
const IN_STEPS = {
  N: GRID.CY,
  S: GRID.H - 1 - GRID.CY,
  E: GRID.W - 1 - GRID.CX,
  W: GRID.CX,
};

// Steps from the center junction out through a door — one more than the walk to
// the opening, because the last step is the crossing itself.
const OUT_STEPS = { N: IN_STEPS.N + 1, S: IN_STEPS.S + 1, E: IN_STEPS.E + 1, W: IN_STEPS.W + 1 };

// Keys that walk from where the player stands in `cell` to the center junction.
// Start cells drop the player on the junction already, so they need none.
export function centerKeys(cell) {
  if (cell.kind === "start" || !cell.entryDir) return [];
  const inward = KEY[OPPOSITE[cell.entryDir]];
  return Array.from({ length: IN_STEPS[cell.entryDir] }, () => inward);
}

// Keys that walk out of `cell` through `exitDir`, crossing the threshold.
export function exitKeys(cell, exitDir) {
  return [...centerKeys(cell), ...Array.from({ length: OUT_STEPS[exitDir] }, () => KEY[exitDir])];
}

// The door that carries the player onward: a corridor's far end, or the room's
// correct door. Source cells have neither — you step onto their glyph instead.
export function onwardDir(cell) {
  if (cell.kind === "corridor") return Object.keys(cell.doors).find((d) => d !== cell.backDir);
  return cell.correctDir;
}

// A door that is neither correct nor the way back — the wrong turn clip's whole
// subject.
export function wrongDir(cell) {
  return Object.keys(cell.doors).find((d) => d !== cell.correctDir && d !== cell.backDir);
}

// --- playback ---------------------------------------------------------------

const STEP_MS = 130; // key-to-key walking pace; reads as a person, not a robot
const BEAT = 1400; // pause in a room so a digit has time to be spoken

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const raf = () => new Promise(requestAnimationFrame);

async function press(code, gap = STEP_MS) {
  window.dispatchEvent(new KeyboardEvent("keydown", { code }));
  await wait(gap);
}

async function settle(state) {
  while (state.transition) await raf();
}

// Walk out of the current cell through `dir` and wait for the cut to land. A
// crossing that never happens would otherwise record as a player standing in a
// wall for the rest of the take, so it throws instead.
async function cross(api, dir) {
  const before = api.state.cell;
  for (const code of exitKeys(api.state.cell, dir)) await press(code);
  await settle(api.state);
  if (api.state.cell === before) throw new Error(`crossing ${dir} never left the cell`);
}

// Walking back the way you came always means the door you entered *this* cell
// through — after a stray that is the stray cell's own back door, not the one
// the room you strayed from was entered by.
const backOut = (api) => cross(api, api.state.cell.backDir);

// Leave the title splash by CONTINUE, which keeps whatever level was set.
async function begin(api) {
  await wait(700);
  await press("KeyC", 600);
}

// Walk `rooms` correct crossings, pausing in each so the count visibly ticks.
async function advance(api, rooms, beat = BEAT) {
  for (let i = 0; i < rooms && api.state.cell.kind !== "source"; i++) {
    await cross(api, onwardDir(api.state.cell));
    await wait(beat);
  }
}

// Set a level whose golden path contains a room that will move, and return that
// room's depth. Levels are tried in order; the first with a spendable change
// budget wins and stays loaded.
function seekUnstableRoom(api, levels) {
  for (const level of levels) {
    api.setLevel(level);
    const depth = api.state.roomPlan.findIndex((room) => room && room.budget >= 1);
    if (depth > 0) return depth;
  }
  throw new Error(`no unstable room on levels ${levels.join(",")}`);
}

// --- the clips --------------------------------------------------------------

const CLIPS = {
  // 7. Title and burn-in: no input at all, just the splash settling.
  title: async ({ prefs }) => {
    prefs.burnIn = true;
  },

  // 1. Core loop: door, static cut, a new number. Four rooms of it.
  "core-loop": async (api) => {
    api.prefs.showCount = true;
    api.setLevel(2);
    await begin(api);
    await advance(api, 4);
  },

  // 2. The wrong-turn tell: the count stalls on a wrong door and resumes when
  // the player walks back. The stall is the mechanic, so it gets a long hold.
  "wrong-turn": async (api) => {
    api.prefs.showCount = true;
    api.setLevel(2);
    await begin(api);
    await advance(api, 2);
    await cross(api, wrongDir(api.state.cell));
    await wait(4000); // hold on the frozen count longer than feels comfortable
    await backOut(api);
    await wait(BEAT);
    await advance(api, 1);
  },

  // 3. The room that moved: learn a room's exit, stray, come back, find the
  // exit somewhere else.
  "room-moved": async (api) => {
    api.prefs.showCount = true;
    const depth = seekUnstableRoom(api, [4, 5, 6, 7, 8, 9, 10, 11, 12]);
    await begin(api);
    await advance(api, depth, 500); // travel briskly; the beat is at the end
    await wait(2200); // hold on the room as it first looks
    const learned = api.state.cell.correctDir;
    await cross(api, wrongDir(api.state.cell));
    await wait(1600);
    await backOut(api);
    // The whole clip is this comparison; a room that held still has nothing to
    // show, so say so rather than banking a take of nothing happening.
    if (api.state.cell.correctDir === learned) {
      throw new Error(`room at depth ${depth} did not move (exit stayed ${learned})`);
    }
    await wait(3000); // the same room, a different door
    await advance(api, 1);
  },

  // 4. The pulse: the full golden path to the source, then the step onto the
  // glyph that spirals into the next level.
  pulse: async (api) => {
    api.setLevel(1);
    await begin(api);
    while (api.state.cell.kind !== "source") {
      await cross(api, onwardDir(api.state.cell));
      await wait(300);
    }
    await wait(900);
    for (const code of centerKeys(api.state.cell)) await press(code);
  },

  // 5. CRT decay: the NOISE dial walked up live, then the tint flipped. Driven
  // through the menu rather than the prefs object so the dial is on screen.
  "crt-decay": async (api) => {
    api.setLevel(3);
    await begin(api);
    await advance(api, 1, 300);
    await press("KeyP", 900); // open PREFS (row 0: CRT FX)
    await press("ArrowDown", 700); // row 1: CRT NOISE
    for (let i = 0; i < 5; i++) await press("ArrowRight", 900);
    await wait(1200);
    for (let i = 0; i < 3; i++) await press("ArrowDown", 400); // row 4: TINT
    await press("ArrowRight", 2500);
  },

  // 6. Jukebox: the transmitter and the waterfall, no maze. Nothing to drive —
  // it just has to run.
  jukebox: async (api) => {
    await begin(api);
    api.jukebox.active = true;
    api.menu.open = false;
  },
};

export const CLIP_NAMES = Object.keys(CLIPS);

// Block until `url` resolves, which is capture.sh's signal that the recorder is
// live. Without it a take would start playing while ffmpeg is still starting up
// and the opening beat — the part that decides whether the clip is watched —
// would never make it into the file.
const GO_TIMEOUT_MS = 30000;
const GO_POLL_MS = 200;

export async function waitForGo(url) {
  const deadline = performance.now() + GO_TIMEOUT_MS;
  while (performance.now() < deadline) {
    const res = await fetch(url, { cache: "no-store" });
    if (res.ok) return;
    await wait(GO_POLL_MS);
  }
  throw new Error(`recorder never signalled at ${url}`);
}

export function runClip(name, api) {
  const clip = CLIPS[name];
  if (!clip) throw new Error(`unknown demo clip: ${name} (have ${CLIP_NAMES.join(", ")})`);
  return clip(api);
}

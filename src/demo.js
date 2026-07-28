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
// wall for the rest of the take, so it throws instead. `pace` tightens the
// walk for legs that are travel rather than beat.
async function cross(api, dir, pace = STEP_MS) {
  const before = api.state.cell;
  for (const code of exitKeys(api.state.cell, dir)) await press(code, pace);
  await settle(api.state);
  if (api.state.cell === before) throw new Error(`crossing ${dir} never left the cell`);
}

// Walking back the way you came always means the door you entered *this* cell
// through — after a stray that is the stray cell's own back door, not the one
// the room you strayed from was entered by.
const backOut = (api, pace) => cross(api, api.state.cell.backDir, pace);

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

// Walk forward until the decision room at `depth` is the one being stood in.
// Counting crossings is not the same as counting depth: a forward crossing can
// drop an empty corridor in between, which spends a crossing and gains none, so
// a take that counts crossings ends up somewhere it did not mean to be.
async function travelTo(api, depth, beat = BEAT) {
  for (let guard = 0; guard <= depth * 3; guard++) {
    if (api.state.progress.depth >= depth && api.state.cell.kind === "interior") return;
    await cross(api, onwardDir(api.state.cell));
    await wait(beat);
  }
  throw new Error(`never reached the decision room at depth ${depth}`);
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
    await travelTo(api, 2);
    await cross(api, wrongDir(api.state.cell));
    await wait(4000); // hold on the frozen count longer than feels comfortable
    await backOut(api);
    await wait(BEAT);
    await advance(api, 1);
  },

  // 3 (the room that moved) is not here: it is a staged shot on its own page,
  // promo-room-moved.html, which explains why.

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

  // 5. CRT decay: every dial that changes the look, walked live. Driven through
  // the menu rather than the prefs object so the dials are on screen turning.
  // MODE last — inverting the picture is the biggest jump of the four.
  "crt-decay": async (api) => {
    api.setLevel(3);
    await begin(api);
    await advance(api, 1, 300);
    await press("KeyP", 900); // open PREFS (row 0: CRT FX)
    await press("ArrowDown", 600); // row 1: CRT NOISE
    for (let i = 0; i < 5; i++) await press("ArrowRight", 700);
    await wait(900);
    await press("ArrowDown", 500); // row 2: BURN-IN
    await press("ArrowRight", 2200); // ghosting needs a beat to build
    await press("ArrowDown", 350);
    await press("ArrowDown", 500); // row 4: TINT
    await press("ArrowRight", 2000);
    await press("ArrowDown", 500); // row 5: MODE
    await press("ArrowRight", 3000);
  },

  // 6. Jukebox: the transmitter driven through its own picker, one row at a
  // time, so every dial is on screen turning while the station answers it.
  jukebox: async (api) => {
    await begin(api);
    api.jukebox.active = true;
    api.menu.open = false;
    await wait(JB_OPEN_HOLD);
    for (const step of JUKEBOX_WALK) {
      while (api.jukebox.index !== step.row) await press("ArrowDown", JB_ROW_MS);
      for (let i = 0; i < step.times; i++) await press(step.key, step.hold);
    }
  },
};

// The jukebox walk, as data: each step selects a row, then presses one arrow
// `times`, resting `hold` ms after each press.
//
// Holds are set by what has to be *heard* before the next change, not by what
// looks unhurried. CALM leaves up to 4000 ms between spoken digits (CADENCES in
// levels.js), so a language given less than that can go by without ever
// speaking — the setting changes on screen and the clip proves nothing.
const JB_OPEN_HOLD = 2500; // panel and waterfall establish before anything moves
const JB_ROW_MS = 600;

export const JUKEBOX_WALK = [
  // Every voice the station owns, then babel, which draws a fresh one per digit.
  { row: 0, key: "ArrowRight", times: 6, hold: 4200 },
  // LOOP -> RANDOM -> ORDERED. ORDERED counts 0..9, which at CALM is still too
  // slow to hear *as* counting — the cadence step below is where it lands.
  { row: 1, key: "ArrowRight", times: 2, hold: 5200 },
  // CALM -> BRISK -> RAPID, against the ordered melody left running above.
  { row: 2, key: "ArrowRight", times: 2, hold: 4200 },
  // The dread bed up to full, then all the way off, which strips the noise from
  // the voice and leaves it naked. Short holds: this one is heard as a sweep.
  { row: 3, key: "ArrowRight", times: 3, hold: 1500 },
  { row: 3, key: "ArrowLeft", times: 5, hold: 1500 },
  // Numbers out, then back. Off against static 0 is true silence, so the hold is
  // punctuation-length — any longer and the clip reads as a broken file.
  { row: 4, key: "ArrowRight", times: 2, hold: 3000 },
];

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

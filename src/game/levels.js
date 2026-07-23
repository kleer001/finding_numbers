// Per-level difficulty dials. Levels 1-12 are authored (four zones: CLEAR
// SIGNAL / DRIFT / INTERFERENCE / DEEP STATION); levels 13..MAX_LEVEL are
// generated — one digit longer each level, random digits, every digit voiced
// in a random language. The transmission itself never lies (no decoys, no
// dropped digits); difficulty comes from length, voice, repeats, and doors.

import { subSeed } from "../core/rng.js";

export const MAX_LEVEL = 32;

// Honesty curve. Each level hides ONE contiguous unstable stretch of rooms; the
// rest are pure. Two dials move with the level: how much of the level lies
// (coverage, capped at half so there is always solid ground) and how hard it
// lies (severity, deepening toward the end of the stretch so walking into it
// gets worse). The stretch's position is hashed off the level number, so it
// sits somewhere different every level — you can never assume the lies live at
// the end — but a given level always plays the same.
const COVERAGE_CAP = 0.5; // never more than half a level lies
const COVERAGE_RAMP = 20; // levels to climb from nothing to the cap
const SEVERITY_RAMP = 6; // levels per extra notch of dishonesty
const MAX_NOTCHES = 5; // 5 notches = the 0.5 floor
const NOTCH = 0.1; // one notch = one more allowed change (see cell.js)
// Difficulty plateaus at 5 changes: being sent through the same room a sixth
// time reads as the same frustration as the fifth, so honesty below 0.5 buys
// nothing. Past this point difficulty has to come from the other dials (length,
// forward doors, language, noise, corridors), not from more lying.
const HONESTY_FLOOR = 0.5;

// Honesty per decision room, indexed by depth (1..digits-1). Index 0 is the
// forced single-exit start, which has no choice to lie about.
export function honestyCurve(level, digits) {
  const rooms = digits - 1;
  const curve = new Array(rooms + 1).fill(1);
  const cov = Math.min(COVERAGE_CAP, Math.max(0, (level - 2) / COVERAGE_RAMP));
  if (cov <= 0 || rooms < 1) return curve;
  const count = Math.min(Math.max(1, Math.round(cov * rooms)), Math.floor(rooms * COVERAGE_CAP) || 1);
  const start = subSeed(level, "honesty") % (rooms - count + 1);
  const deepest = Math.max(1, Math.min(MAX_NOTCHES, 1 + Math.floor((level - 3) / SEVERITY_RAMP)));
  for (let j = 0; j < count; j++) {
    const t = count > 1 ? j / (count - 1) : 1; // worsens toward the stretch's end
    const notches = Math.round(1 + (deepest - 1) * t);
    curve[start + 1 + j] = Number(Math.max(HONESTY_FLOOR, 1 - NOTCH * notches).toFixed(1));
  }
  return curve;
}

// Readout cadence (ms between spoken digits, quantized to `step` chunks).
const CALM = { min: 1000, max: 4000, step: 250 };
const BRISK = { min: 800, max: 2500, step: 250 }; // repeats on: keep a pass short
const RAPID = { min: 600, max: 1800, step: 200 }; // long expert messages

// Shared with the jukebox picker so both draw cadence from one source.
export const CADENCES = { CALM, BRISK, RAPID };

// Draw a random wait (ms) from a {min,max,step} cadence spec, quantized to
// `step`. The station and the cold-open banner both call this so they stay in
// lockstep — one spec change moves both.
export function pickInterval({ min, max, step }) {
  const steps = Math.floor((max - min) / step);
  return min + step * ((Math.random() * (steps + 1)) | 0);
}

// Brown-noise dread: wash = slow swells intensity, burst = between-digit
// stabs intensity (both 0..1). The noise threatens the voice but never touches
// it — spectrally below the voice band and hard-ducked whenever a digit plays.
const QUIET = { wash: 0, burst: 0 };

// Zone looks: wall glyph + corridor half-width (corridors are 2*half+1 wide).
// Arrays mean "pick per cell" — the deep station can't hold itself together.
// Non-load-bearing by design: theme never changes where the doors are.
const CLEAR_SIGNAL = { wall: "#", half: 1 };
const DRIFT = { wall: "▒", half: 2 }; // abandoned halls
const INTERFERENCE = { wall: "░", half: 0 }; // claustrophobic
const DEEP_STATION = { wall: ["#", "░", "▒", "▓"], half: [0, 1, 2] };

// language: one of LANGUAGES, or "babel" = a random language per digit.
// ordered: digits climb 0,1,2,.. (a melody you can follow); repeats: times each
// digit is spoken per readout pass; forwardDoors: choices at each junction;
// corridorChance: odds a forward crossing inserts an empty pass-through cell.
// honesty: how truthful each golden-path room is (see cell.js buildRoomPlan).
// Omit for fully honest (1.0) — a room's correct door never moves. A number
// applies uniformly; an array (indexed by depth) authors the horror per room.
// Below 1.0 the room may betray you a bounded number of times before it settles
// (1.0 -> never, 0.9 -> once, 0.8 -> twice, ... 0.0 -> up to ten). Authored per
// level: levels 1-3 stay 1.0 by default.
const TABLE = [
  { digits: 3, language: "english", repeats: 1, forwardDoors: 2, interval: CALM, noise: QUIET, corridorChance: 0, theme: CLEAR_SIGNAL },
  { digits: 6, language: "english", repeats: 1, forwardDoors: 2, interval: CALM, noise: QUIET, corridorChance: 0, theme: CLEAR_SIGNAL },
  { digits: 10, language: "english", repeats: 1, forwardDoors: 2, interval: CALM, noise: QUIET, corridorChance: 0, theme: CLEAR_SIGNAL },
  { digits: 6, language: "spanish", repeats: 1, forwardDoors: 2, interval: CALM, noise: { wash: 0.25, burst: 0 }, corridorChance: 0, theme: DRIFT },
  { digits: 8, language: "italian", repeats: 2, forwardDoors: 2, interval: BRISK, noise: { wash: 0.3, burst: 0 }, corridorChance: 0, theme: DRIFT },
  { digits: 10, language: "japanese", repeats: 2, forwardDoors: 2, interval: BRISK, noise: { wash: 0.4, burst: 0 }, corridorChance: 0.2, theme: DRIFT },
  { digits: 6, language: "chinese", repeats: 2, forwardDoors: 3, interval: BRISK, noise: { wash: 0.3, burst: 0.5 }, corridorChance: 0.2, theme: INTERFERENCE },
  { digits: 8, language: "hindi", repeats: 2, forwardDoors: 3, interval: BRISK, noise: { wash: 0.35, burst: 0.6 }, corridorChance: 0.25, theme: INTERFERENCE },
  { digits: 10, language: "spanish", repeats: 2, forwardDoors: 3, interval: BRISK, noise: { wash: 0.4, burst: 0.7 }, corridorChance: 0.3, theme: INTERFERENCE },
  { digits: 10, language: "italian", repeats: 2, forwardDoors: 3, interval: BRISK, noise: { wash: 0.55, burst: 0.8 }, corridorChance: 0.3, theme: DEEP_STATION },
  { digits: 10, language: "chinese", repeats: 2, forwardDoors: 3, interval: BRISK, noise: { wash: 0.6, burst: 0.9 }, corridorChance: 0.3, theme: DEEP_STATION },
  { digits: 10, language: "babel", repeats: 2, forwardDoors: 3, interval: BRISK, noise: { wash: 0.7, burst: 1 }, corridorChance: 0.4, theme: DEEP_STATION },
].map((row, i) => ({ level: i + 1, ordered: true, ...row }));

export function levelSpec(level) {
  if (!Number.isInteger(level) || level < 1 || level > MAX_LEVEL) {
    throw new Error(`level out of range: ${level}`);
  }
  const spec =
    level <= TABLE.length
      ? TABLE[level - 1]
      : {
          level,
          digits: 10 + (level - TABLE.length),
          language: "babel",
          ordered: false,
          repeats: 2,
          forwardDoors: 3,
          interval: RAPID,
          noise: { wash: 0.7, burst: 1 },
          corridorChance: 0.35,
          theme: DEEP_STATION,
        };
  // A hand-authored `honesty` on a row wins; otherwise the curve fills it in.
  return spec.honesty ? spec : { ...spec, honesty: honestyCurve(level, spec.digits) };
}

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

// Zone looks: corridor half-width (corridors are 2*half+1 wide). Arrays mean
// "pick per cell" — the deep station can't hold itself together. The wall glyph
// is per level, not per zone (see WALL_RAMP). Non-load-bearing by design: theme
// never changes where the doors are.
const CLEAR_SIGNAL = { half: 1 };
const DRIFT = { half: 2 }; // abandoned halls
const INTERFERENCE = { half: 0 }; // claustrophobic
const DEEP_STATION = { half: [0, 1, 2] };

// One wall surface per level. A zone's three levels used to share a glyph, so
// stepping up a level looked like nowhere new — level 1 to 2 read as the same
// room with a longer number. The ramp runs clean to corroded: a crisp ASCII grid
// near the surface, then the letterforms and currency marks a rotting terminal
// throws up. Neighbours are picked to differ in shape, not just in density, so
// the change registers at a glance.
//
// The shades carry the middle of the ramp because they are the only glyphs whose
// difference is pure density — the eye reads ░▒▓█ as one wall getting heavier,
// where two letterforms just read as two different letters. They exist because
// the game ships its own font (make_font.py); stock VT323 has no block glyphs at
// all, which is why these walls used to come out in a fallback face.
// Ordered against the zones' corridor widths, not just by weight. How bright a
// level burns is its glyph's density times how much wall is on screen, and the
// two run opposite ways: DRIFT's wide corridors leave little wall on screen,
// INTERFERENCE's narrow ones leave it nearly all wall and need the faintest
// shade to stay looked-at.
//
// DRIFT's three are one checkerboard at three scales — half ink whatever the
// scale, so the zone holds a steady brightness while the wall visibly coarsens
// under you. A denser shade there just burned: past about half ink the screen
// goes to a sheet of amber and stops reading as a maze at all.
const WALL_RAMP = ["#", "%", "8", "▒", "🮕", "▚", "░", "Ø", "Æ"];
const DEEPEST_MIX = 6; // most glyphs one level's walls will draw from

// Past the authored zones the surface stops holding: each level mixes a wider
// handful of the ramp, offset so no two neighbours wear the same walls. Stepping
// by two lands on a fresh glyph every time — 2 and 9 share no factor.
function wallFor(level) {
  if (level <= WALL_RAMP.length) return WALL_RAMP[level - 1];
  const count = Math.min(DEEPEST_MIX, 2 + (level - WALL_RAMP.length));
  const start = (level - 1) % WALL_RAMP.length;
  return Array.from({ length: count }, (_, i) => WALL_RAMP[(start + i * 2) % WALL_RAMP.length]);
}

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
  // The zone supplies the corridor width, the level its own wall surface.
  const themed = { ...spec, theme: { ...spec.theme, wall: wallFor(level) } };
  // A hand-authored `honesty` on a row wins; otherwise the curve fills it in.
  return themed.honesty ? themed : { ...themed, honesty: honestyCurve(level, themed.digits) };
}

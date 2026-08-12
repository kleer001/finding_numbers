// Per-level difficulty dials. Levels 1-12 are authored (four zones: CLEAR
// SIGNAL / DRIFT / INTERFERENCE / DEEP STATION); levels 13 and past are
// generated — one digit longer each level, random digits, every digit voiced
// in a random language. The transmission itself never lies (no decoys, no
// dropped digits); difficulty comes from length, voice, repeats, and doors.

import { subSeed } from "../core/rng.js";

// There is no last level. Levels 1-16 are the game as designed; the level counter
// is a 4-bit field in the fiction, so 16 is the largest number it can hold, and
// from OVERFLOW_FROM on the count has overflowed that field and is writing over
// memory it does not own. NAMED_LEVELS is as far as the counter can still print a
// number at all — past it the badge stops claiming one, and the levels keep going
// for as long as the player does.
//
// Everything past OVERFLOW_FROM stays playable: the walls and the readout corrupt,
// the transmission and the route do not.
export const OVERFLOW_FROM = 17;
export const NAMED_LEVELS = 64;

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

// The game's own wall graphics, drawn in make_font.py. They live in the
// private-use area because Unicode has no character for a brick wall, and they
// exist because a glyph like '#' is a letterform: it inks a third of the cell and
// leaves black around itself, so a wall of them reads as scattered marks instead
// of a surface. These are drawn to the cell, joints and all, and tile into one
// unbroken wall -- as line-work, which costs a fifth of the ink a filled block
// would and so keeps the opening levels dim.
const BRICK = "\uE000"; // running-bond masonry
const ASHLAR = "\uE001"; // large dressed blocks
const PLATE = "\uE002"; // riveted steel panel
const GRATE = "\uE003"; // cage: joints on both axes

// One wall surface per level: a zone's three levels used to share a glyph, so
// stepping up a level looked like nowhere new. Neighbours differ in kind, not
// just in weight, so the change registers at a glance -- CLEAR SIGNAL is built
// structure going brick to stone to steel, DRIFT is one checkerboard at three
// scales, INTERFERENCE the zone closing in: static, then a shear across the
// walls, then a cage.
//
// Ordered against the zones' corridor widths, not by weight alone. How bright a
// level burns is its glyph's density times how much wall is on screen, and the
// two run opposite ways: DRIFT's wide corridors leave little wall, so they carry
// the checkers, while INTERFERENCE's narrow ones leave the screen nearly all wall
// and need the faintest shade to stay looked-at. Past about half ink a level
// stops reading as a maze and becomes a sheet of amber with a slot in it.
// Exported so the overflow corruption can draw from the game's own wall set rather
// than an invented one (see render/glitch.js).
export const WALL_RAMP = [BRICK, ASHLAR, PLATE, "▒", "🮕", "▚", "░", "╳", GRATE];

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
  { digits: 8, language: "german", repeats: 2, forwardDoors: 2, interval: BRISK, noise: { wash: 0.3, burst: 0 }, corridorChance: 0, theme: DRIFT },
  { digits: 10, language: "turkish", repeats: 2, forwardDoors: 2, interval: BRISK, noise: { wash: 0.4, burst: 0 }, corridorChance: 0.2, theme: DRIFT },
  { digits: 6, language: "russian", repeats: 2, forwardDoors: 3, interval: BRISK, noise: { wash: 0.3, burst: 0.5 }, corridorChance: 0.2, theme: INTERFERENCE },
  { digits: 8, language: "welsh", repeats: 2, forwardDoors: 3, interval: BRISK, noise: { wash: 0.35, burst: 0.6 }, corridorChance: 0.25, theme: INTERFERENCE },
  { digits: 10, language: "arabic", repeats: 2, forwardDoors: 3, interval: BRISK, noise: { wash: 0.4, burst: 0.7 }, corridorChance: 0.3, theme: INTERFERENCE },
  { digits: 10, language: "mandarin", repeats: 2, forwardDoors: 3, interval: BRISK, noise: { wash: 0.55, burst: 0.8 }, corridorChance: 0.3, theme: DEEP_STATION },
  { digits: 10, language: "georgian", repeats: 2, forwardDoors: 3, interval: BRISK, noise: { wash: 0.6, burst: 0.9 }, corridorChance: 0.3, theme: DEEP_STATION },
  { digits: 10, language: "babel", repeats: 2, forwardDoors: 3, interval: BRISK, noise: { wash: 0.7, burst: 1 }, corridorChance: 0.4, theme: DEEP_STATION },
].map((row, i) => ({ level: i + 1, ordered: true, ...row }));

// The message grows one digit per level and never stops, so at a fixed cadence the
// time to hear a whole readout back grows with it. The player waits for a full pass
// in every room, which makes a level's cost climb as the square of its length — and
// nearly all of that is dead air, not difficulty.
//
// So the gap closes in proportion to how much there is to read. That holds a pass
// roughly constant however long the message gets, turns the level's cost back into
// something linear, and makes the station sound like it is running out of time to
// finish. The floor is set where the digits overlap outright: the voice samples
// average 0.86s, so RAPID's own 600ms minimum already slurs them, and this bottoms
// out well inside that — the station coming apart is the point.
const PLATEAU_DIGITS = 14; // digits at level 16 — the last message RAPID is tuned for
const CADENCE_FLOOR = 1 / 3; // never tighter than a third of RAPID

// How fast the screen rots past the overflow: 0 at OVERFLOW_FROM, 1 after this many
// levels, and pinned there. Its own constant rather than NAMED_LEVELS, which is the
// badge's naming ceiling — how far the counter can count and how fast the picture
// falls apart are unrelated decisions, and sharing a number silently ties them.
const CORRUPTION_RAMP = 48;

// A readout has two kinds of silence, and they do different work: the gap between
// the repeats of one number, and the gap between one number and the next. Holding
// the repeats close and the numbers apart is what lets a listener count *numbers*
// instead of utterances — it is also how a real station reads, in groups.
//
// These floors were set by ear against the shipped voice samples (see gap-lab.html,
// which auditions a number in groups of four through this exact audio chain). The
// samples run 0.60s to 1.63s, so at any gap this tight the digits already overlap;
// the floor is not "no overlap" but the point where four repeats stop being
// countable as four. Below them the crank-down is free to keep tightening; here it
// stops, however long the message gets.
export const GAP_FLOOR = { repeat: 390, group: 780 };

// How corrupt a level's picture is, 0..1 (see render/glitch.js). Lives here because
// this is where a level number becomes a dial — honesty, walls, cadence, noise and
// doors all resolve in this module and arrive on the spec, and corruption is no
// different for being drawn rather than heard.
export function corruptionAt(level) {
  if (level < OVERFLOW_FROM) return 0;
  return Math.min(1, (level - OVERFLOW_FROM + 1) / CORRUPTION_RAMP);
}

// The slice of a level spec the station reads to speak it. Assembled in one place so
// the audio takes its cadence from the spec rather than from a hand-copied subset:
// a second gap was once added here and the readout kept forwarding only the first,
// computing the tighter gap correctly and then discarding it. Deliberately a subset —
// digits, honesty and theme are none of the audio's business.
export function readoutCadence(spec) {
  return {
    repeats: spec.repeats,
    interval: spec.interval,
    repeatInterval: spec.repeatInterval,
    noise: spec.noise,
  };
}

// The two gaps for a message of `digits`, scaled by the same crank-down and then
// held at their floors.
export function overflowGaps(digits) {
  const k = Math.min(1, Math.max(CADENCE_FLOOR, PLATEAU_DIGITS / digits));
  const scaled = (floor) => {
    const q = (v) => Math.round((v * k) / 50) * 50;
    const min = Math.max(floor, q(RAPID.min));
    return { min, max: Math.max(min, q(RAPID.max)), step: Math.max(50, q(RAPID.step)) };
  };
  return { interval: scaled(GAP_FLOOR.group), repeatInterval: scaled(GAP_FLOOR.repeat) };
}

export function levelSpec(level) {
  if (!Number.isInteger(level) || level < 1) {
    throw new Error(`level out of range: ${level}`);
  }
  const digits = 10 + (level - TABLE.length);
  const spec =
    level <= TABLE.length
      ? TABLE[level - 1]
      : {
          level,
          digits,
          language: "babel",
          ordered: false,
          repeats: 2,
          forwardDoors: 3,
          // Past the overflow the two gaps part company; before it, one gap does
          // both jobs exactly as the authored levels always have.
          ...(level >= OVERFLOW_FROM ? overflowGaps(digits) : { interval: RAPID }),
          noise: { wash: 0.7, burst: 1 },
          corridorChance: 0.35,
          theme: DEEP_STATION,
        };
  // The zone supplies the corridor width, the level its own wall surface and how far
  // its picture has come apart.
  const themed = { ...spec, corruption: corruptionAt(level), theme: { ...spec.theme, wall: wallFor(level) } };
  // A hand-authored `honesty` on a row wins; otherwise the curve fills it in.
  return themed.honesty ? themed : { ...themed, honesty: honestyCurve(level, themed.digits) };
}

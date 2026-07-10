// Per-level difficulty dials. Levels 1-12 are authored (four zones: CLEAR
// SIGNAL / DRIFT / INTERFERENCE / DEEP STATION); levels 13..MAX_LEVEL are
// generated — one digit longer each level, random digits, every digit voiced
// in a random language. The transmission itself never lies (no decoys, no
// dropped digits); difficulty comes from length, voice, repeats, and doors.

export const MAX_LEVEL = 32;

// Readout cadence (ms between spoken digits, quantized to `step` chunks).
const CALM = { min: 1000, max: 4000, step: 250 };
const BRISK = { min: 800, max: 2500, step: 250 }; // repeats on: keep a pass short
const RAPID = { min: 600, max: 1800, step: 200 }; // long expert messages

// Shared with the jukebox picker so both draw cadence from one source.
export const CADENCES = { CALM, BRISK, RAPID };

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
  if (level <= TABLE.length) return TABLE[level - 1];
  return {
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
}

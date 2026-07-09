// The whole game logic: two counters and a score formula. The maze is faked —
// cells are generated fresh on each move (see state.js), so "branching" is an
// illusion. Only depth (correct progress toward the source) and stray (how far
// you've wandered off the correct frontier) matter.

import { GOLDEN_LEN } from "./config.js";

// message: a permutation of 0..9. Easy = in order (an obvious climbing melody);
// harder difficulties scramble it so telling "new digit" from "repeat" is hard.
export function makeMessage(rng, scrambled = false) {
  const m = Array.from({ length: 10 }, (_, i) => i);
  if (scrambled) {
    for (let i = m.length - 1; i > 0; i--) {
      const j = rng.int(i + 1);
      [m[i], m[j]] = [m[j], m[i]];
    }
  }
  return m;
}

export function createProgress(message) {
  return { depth: 0, stray: 0, message };
}

// score = audible-digit count. On-frontier: score == depth. First stray step is
// free (grace); each further stray drops one; walking back restores it.
export function score(p) {
  return Math.max(0, Math.min(GOLDEN_LEN, p.depth - Math.max(0, p.stray - 1)));
}

export function audibleDigits(p) {
  return p.message.slice(0, score(p));
}

export function atSource(p) {
  return p.depth >= GOLDEN_LEN;
}

// Apply a door choice. role: 'correct' | 'wrong' | 'back'. Returns an event tag.
export function step(p, role) {
  if (role === "correct") {
    p.depth = Math.min(GOLDEN_LEN, p.depth + 1);
    p.stray = 0;
    return atSource(p) ? "win" : "advance";
  }
  if (role === "wrong") {
    p.stray += 1;
    return "stray";
  }
  // back: unwind a stray first; once on the frontier, retreat down the path.
  if (p.stray > 0) {
    p.stray -= 1;
    return "return";
  }
  p.depth = Math.max(0, p.depth - 1);
  return "retreat";
}

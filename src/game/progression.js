// The whole game logic: two counters and a score formula. The maze is faked —
// cells are generated fresh on each move (see state.js), so "branching" is an
// illusion. Only depth (correct progress toward the source) and stray (how far
// you've wandered off the correct frontier) matter.

import { LANGUAGES } from "./config.js";

// message: one {digit, lang} entry per correct step to the source. Ordered
// levels climb 0,1,2,.. (an obvious melody); expert levels draw random digits.
// The language is fixed per entry at creation — the transmission never lies,
// it just changes voice.
export function makeMessage(rng, spec) {
  return Array.from({ length: spec.digits }, (_, i) => ({
    digit: spec.ordered ? i : rng.int(10),
    lang: spec.language === "babel" ? rng.pick(LANGUAGES) : spec.language,
  }));
}

export function createProgress(message) {
  return { depth: 0, stray: 0, message };
}

// score = audible-digit count. On-frontier: score == depth. First stray step is
// free (grace); each further stray drops one; walking back restores it.
export function score(p) {
  return Math.max(0, Math.min(p.message.length, p.depth - Math.max(0, p.stray - 1)));
}

export function audibleDigits(p) {
  return p.message.slice(0, score(p));
}

export function atSource(p) {
  return p.depth >= p.message.length;
}

// Apply a door choice. role: 'correct' | 'wrong' | 'back'. Returns an event tag.
export function step(p, role) {
  if (role === "correct") {
    p.depth = Math.min(p.message.length, p.depth + 1);
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

// The run's seed as a short code: four characters of base 36 (0-9, A-Z), which
// is 36^4 codes. The maze is generated from it, so two players on the same code
// walk the same rooms — and a code that short can be read aloud, typed into a
// URL, or fitted into the five-column status field, which a nine-digit integer
// cannot. It also reads like a station designator, which the fiction is happy
// about.

export const SEED_LEN = 4;
const RADIX = 36;
export const SEED_MAX = RADIX ** SEED_LEN; // 1679616

// Any integer folded into the code space, so a displayed code always round-trips
// back to the seed that produced it.
export function normalizeSeed(n) {
  return (((n | 0) % SEED_MAX) + SEED_MAX) % SEED_MAX;
}

export function encodeSeed(n) {
  return normalizeSeed(n).toString(RADIX).toUpperCase().padStart(SEED_LEN, "0");
}

// Boundary parser for `?seed=` and anything else outside the program. Two forms
// are accepted, and the order matters:
//   - up to SEED_LEN alphanumerics -> a seed code ("K3F9", "42")
//   - longer, all digits           -> a plain decimal, folded into range
// The second form exists because capture.sh pins takes with `--seed <number>`
// and those numbers predate the code format; both are deterministic, which is
// all a pinned take needs. Returns null for anything else, so the caller can
// tell "no seed given" from "seed given".
export function decodeSeed(raw) {
  if (typeof raw !== "string") return null;
  const s = raw.trim().toUpperCase();
  if (!s) return null;
  if (new RegExp(`^[0-9A-Z]{1,${SEED_LEN}}$`).test(s)) return parseInt(s, RADIX);
  if (/^[0-9]+$/.test(s)) return normalizeSeed(Number(s));
  return null;
}

// Step one character of a code, wrapping through 0-9A-Z. The preferences stepper
// edits a seed this way: one row cycles the character, another moves the cursor.
export function cycleSeedChar(code, pos, delta) {
  const chars = [...code];
  const cur = parseInt(chars[pos], RADIX);
  chars[pos] = (((cur + delta) % RADIX + RADIX) % RADIX).toString(RADIX).toUpperCase();
  return chars.join("");
}

// The code with the edited character marked, for the preferences row. Brackets
// rather than a caret: the grid has no room for a second line to point with.
export function markSeedChar(code, pos) {
  return [...code].map((c, i) => (i === pos ? `[${c}]` : c)).join("");
}

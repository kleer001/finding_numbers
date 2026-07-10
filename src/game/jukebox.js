// Jukebox readout: feeds the station a fake transmission with no maze behind it.
// The station reads its {digits, repeats, interval, noise} callback live on every
// digit (see audio/station.js), so LOOP just returns a cached array (the scheduler
// wraps over it -> the same sequence repeats), while RANDOM returns a fresh array
// each call (-> endless new digits). ORDERED is a 0..9 counting melody.

import { makeRng } from "../core/rng.js";
import { LANGUAGES } from "./config.js";
import { CADENCES } from "./levels.js";

const LEN = 25; // digits per loop pass; long enough to feel like a real message

// One transmission's worth of {digit, lang}. ORDERED counts 0..9 (mod 10 so a
// loop keeps counting); LOOP/RANDOM draw random digits. `babel` picks a language
// per digit; otherwise every digit speaks the one chosen language.
export function buildDigits(rng, lang, coherence) {
  const ordered = coherence === "ORDERED";
  return Array.from({ length: LEN }, (_, i) => ({
    digit: ordered ? i % 10 : rng.int(10),
    lang: lang === "babel" ? rng.pick(LANGUAGES) : lang,
  }));
}

// STATIC dial 0..5 -> dread bed {wash, burst}, matching the range levels.js uses.
export function staticToNoise(level) {
  const t = Math.max(0, Math.min(5, level)) / 5;
  return { wash: t * 0.7, burst: t };
}

// Stateful readout source. `settings`: {lang, coherence, cadence, static, voice}.
export function makeJukebox(seed = 1) {
  const rng = makeRng(seed >>> 0);
  let cache = null;
  let cacheKey = "";
  return {
    readout(s) {
      const noise = staticToNoise(s.static);
      const interval = CADENCES[s.cadence] ?? CADENCES.CALM;
      if (!s.voice) return { digits: [], repeats: 1, interval, noise };
      if (s.coherence === "RANDOM") {
        return { digits: buildDigits(rng, s.lang, s.coherence), repeats: 1, interval, noise };
      }
      const key = `${s.lang}|${s.coherence}`;
      if (key !== cacheKey) {
        cache = buildDigits(rng, s.lang, s.coherence);
        cacheKey = key;
      }
      return { digits: cache, repeats: 1, interval, noise };
    },
  };
}

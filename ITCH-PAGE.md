# ITCH-PAGE — finding_numbers

The itch.io page, authored here and pasted into itch's editor. Every claim on this
page has to be literally true of the shipped build — run
`.claude/skills/honest-copy` over it before any edit reaches the page, and read
`itch_publish_howto.md` (Gotchas) before opening the edit form at all: saving
rewrites every field from whatever the page loaded, so editing one field can
silently revert the others.

Live: <https://kleer001.itch.io/finding-numbers>

---

## Metadata (set in the itch dashboard)

- **Title:** finding_numbers
- **Short description / tagline:** `Navigate a maze by ear — a number station bleeding through the static, and rooms that don't stay where you left them.` — 118 characters. itch's **hard limit is 120**; over it the whole form is rejected and every other edit in that save is discarded. Count before pasting.
- **Classification:** Game
- **Kind of project:** HTML — "This file will be played in the browser"
- **Pricing:** free, no donations. It is a short strange thing; a payment wall would
  cost it the audience that would actually play it.
- **Uploads:** `dist/finding_numbers.zip` (`./package.sh`; `index.html` at the zip
  root). Verify `type=html` and a matching `size` from the uploads API after **every**
  replacement — see `itch_publish_howto.md`.
- **Embed:** 800×600 to match the canvas buffer, fullscreen button on. The canvas
  scales to whatever it is given, so fullscreen fills the display rather than
  letterboxing a small square.
- **Genre:** Adventure (the itch bucket); the reviewed genre is liminal / analog horror.
- **Tags:** Atmospheric, Audio, Experimental, Exploration, Horror, Liminal space,
  Procedural Generation, Psychological Horror, Soundtoy — 9 of the 10 allowed, all
  ones this scene's players actually search.
- **Platforms:** HTML5 only. No downloadable builds exist.
- **Input:** keyboard (arrows / WASD / HJKL) and touch (tap the screen edges).
- **Accessibility / languages:** interface is English. The spoken digits are in six
  languages by design, and are never the interface. **The game cannot be played
  without sound** — that is the premise, not an oversight, and the page says so.
- **Average session:** a few minutes.
- **Links:** source <https://github.com/kleer001/finding_numbers> · landing
  <https://kleer001.github.io/finding_numbers/promo.html>

---

## Cover & media

- **Cover image:** `docs/img/cover.png`, 630×500.
- **Screenshots:** `docs/img/gameplay.png`, `jukebox.png`, `light-mode.png`,
  `preferences.png`. All from the real build.
- **Trailer:** <https://youtu.be/3_maIo0cYAk> — itch takes a hosted link, not a file,
  so the video has to be up before this field can be filled. YouTube cannot swap a
  file on an existing upload, so a corrected trailer is always a new video and a new
  URL: re-point this field, and expect any A/B test on the old upload to end with it.

**The screenshots are stale** and need re-capturing before the next page edit: they
predate `SHOW NUMBERS` defaulting off, the canvas scaling to the viewport, and the
readout's new cadence. Judge a still or a clip by whether it shows the player
something the build no longer does — footage of a removed preferences row is a
false claim in a way that a merely older maze layout is not.

---

## Description (paste into itch's rich-text editor)

The paste-ready body lives in `itch_page_description.md` and is the single source for
it. Do not maintain a second copy here — two copies of store copy is how one of them
becomes false. What that file currently claims, in summary, so this page can be
reviewed without opening it:

- Navigate by ear; a correct turn adds a number to the broadcast and a wrong one adds
  nothing. Nothing buzzes and nothing turns red.
- Some stretches of a level move their exit a few times before settling; most of the
  maze holds still and can be learned.
- The station is built in WebAudio, tuned to frequencies real number stations
  broadcast on.
- Jukebox mode: the transmitter with no maze.
- A character-mode CRT through a WebGL filter, with the signal as a live spectrogram.
- Walls change under you: the early levels each wear their own surface, deeper ones mix.
- **16 levels of decay** — six languages, a longer message and a faster readout the
  deeper you go. Whether anything is under the sixteenth is not documented.

---

## Pre-publish checks

Dashboard mechanics — how a save reverts fields, how to verify a release server-side —
are in `itch_publish_howto.md`. Read it before every update, not just the first.

- [ ] Tagline is ≤ 120 characters and literally true
- [ ] Every description bullet is true of the *shipped* build, not the working tree
      (`.claude/skills/honest-copy` run over it; its fifth test is the one that catches
      a claim true of the authored levels and false of the generated tail)
- [ ] No superlatives the game can't earn
- [ ] Screenshots and trailer are from the current build
- [ ] Credits and licenses complete: `voice_loom` for the voice samples and sound-design
      reference, CRTFilterWebGL (MIT), MIT for the game itself
- [ ] The uploaded zip runs from a fresh unzip
- [ ] Uploads API reports `type=html` and a `size` equal to the local archive's bytes

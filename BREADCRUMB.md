fresh

## Summary
Number-station maze game. The promo pipeline is now automated end to end and
shipped: six of the eight clips record themselves (`./capture.sh <clip>`), and
`./post.sh` cuts everything in `clips/` into captioned 4:3 clips, 9:16 verticals,
looping GIFs and the trailer. All seven takes are shot and cut; `clips/out/` holds
13 finished files. Two small gameplay changes landed alongside (a descending gate
tone, a blank beat after the spiral wipe), plus a copy-accuracy fix across README,
itch and promo. Everything is committed and pushed on `main`; both this repo and
the sister `kleer001/utilities` are in sync. What remains is review, publishing,
and two optional tuning calls.

## Todos

### Parallel
- [ ] #2 Paste `itch_page_description.md` into itch (Edit game → Description) and update the tagline — itch does NOT pull from git. https://kleer001.itch.io/finding-numbers
- [ ] #3 Verify `promo.html` republished on GitHub Pages: https://kleer001.github.io/finding_numbers/promo.html
- [ ] #4 Optional tuning: `SEVERITY_RAMP` 6→7 in `src/game/levels.js` pushes the 0.5 honesty floor from level 27 out to 31. Currently 6.
- [ ] #5 Decide fate of `recording-20260723-113634.mp4` (65 MB, repo root, not created by any recent session). Now gitignored, so it is a disk-space question only.
- [ ] #6 Watch `clips/out/` and sign off, or call re-cuts. Retiming is editing the tables at the top of `post.sh` — no re-recording needed.
- [ ] #7 Decide the blank-beat ordering. It currently plays spiral → new level revealed (~0.2s) → blank → new level. The alternative is the spiral wiping to black, holding, then the new level arriving. Constant is `WIN_BLACK_MS` in `src/game/config.js`; the split lives in `winWipePhase` in `src/render/render.js`.
- [ ] #8 Optional: tighten the `room-moved` middle leg. Level 12 drops a corridor between the two rooms, so the walk out and back runs ~8s. Shorten the dwell in room B in `src/demo.js`.

### Sequential
- [ ] #9 (needs: #6) Upload the trailer and clips to itch and social. Verticals are 1080×1920 padded; GIFs are 400×300, 5s, ~1.9 MB.

## Context

### Promo pipeline (the session's main build)
- `src/demo.js` — scripted takes, loaded only via `?demo=<clip>`. Names: `title`,
  `core-loop`, `wrong-turn`, `room-moved`, `pulse`, `crt-decay`, `jukebox`. Drives
  the game with synthetic keydowns and reads the golden path the level already
  publishes (`cell.correctDir`, `state.roomPlan`). Takes throw rather than bank
  footage of nothing: a crossing that does not happen, a room that does not move.
- `?seed=N` pins the maze so a take can be re-shot verbatim. All current footage is
  seed 4242. `?go=<path>` parks the take until `capture.sh` releases a go-file, so
  the opening beat cannot play before ffmpeg is live.
- `capture.sh <clip> [--seed N] [-t SECS] [outdir]` — durations per clip are in
  `clip_seconds()`. Clips boot from a wiped Chrome profile (prefs and level persist
  in localStorage and would otherwise leak between takes), waive Chrome's autoplay
  gate (synthetic keys cannot satisfy it, and the station would record silent), and
  tear down their own window and server afterwards.
- `post.sh` — trim windows and the trailer running order are the two tables at the
  top. Output overwrites in place; re-runnable.
- `clips/` and `clips/out/` are gitignored (~148 MB).

### Hard-won gotchas, all fixed — do not reintroduce
- **The recorder grabs a screen region, not a window's pixels.** Anything drifting
  over that rectangle is recorded instead of the game. `capture.sh` raises and
  activates the window first. Verify a take by peak frame brightness: the game never
  exceeds ~88 except in LIGHT mode (~144). A take with an editor in it reads ~220.
- **Never concat segments with the demuxer and `-c copy`.** A segment's video and
  audio never come out the same length, and the drift accumulates into gaps and
  backwards timestamps — it silently swallowed a whole segment. Use the concat
  filter, and pin `-r 30000/1001` or it emits 25 fps against 29.97 fps takes.
- **drawtext captions go through `textfile=`, never an inline string.** `:` is an
  option separator and a quote ends the text, so apostrophes get swallowed.
  Caption plate needs `black@0.9`; at 0.85 the maze glyphs read through the copy.
- **`capture.sh` serves its own directory** on the first free port from 8000 up.
  Adopting whoever already holds 8000 once meant recording another project's page.
- Travel in a take must count *depth*, not crossings — a forward crossing can drop
  an empty corridor, which spends a crossing and gains no depth (`travelTo`).

### Why `room-moved` is staged on level 12
A room's door set is **fixed** everywhere — the way back plus every forward choice —
so which door is correct can move without a single pixel moving with it. Only the
deep station (levels 10+, `DEEP_STATION` theme) also picks a wall glyph and corridor
width per cell, so a rebuilt room comes back visibly different. The take loads
whichever deep level's first unstable room sits shallowest (level 12, depth 3) and
asserts both that the look changed and that the exit moved.

Related trap: retreating into a room from the far side makes the door you took its
*back* door, so re-taking it reads as walking backwards. And depth 1 is unusable for
any revisit — backing out lands in the start cell, whose single door is rebuilt to
whichever side you re-entered by.

### Honesty system (gameplay core)
`buildRoomPlan(rng, spec)` in `src/maze/cell.js` lays out the backbone per decision
depth: `{back, forwards, correctSeq, budget}`. `honesty` (0..1) sets change budget =
`(1-honesty)*10` (1.0 → never moves, 0.5 → 5 changes). A per-depth `roomVisits`
counter in `state.js` indexes `correctSeq`, clamped to budget then frozen. Frontier
rooms render their full fixed door set regardless of re-entry side, while `backDir`
stays = entryDir. `honestyCurve` in `levels.js` gives each level one contiguous
unstable stretch, capped at half the rooms, positioned by `subSeed(level,"honesty")`.
Which depths are unstable comes from the curve, not the maze roll — deterministic
per level.

### Copy accuracy
"A wrong turn just goes quiet" was wrong on README, `itch_page_description.md` and
`promo.html`, and the clip 2 caption leaned harder on it. Nothing goes silent:
`score()` graces the first stray, so the readout keeps saying exactly what it said
before; only a second stray shortens it. All four now say a wrong turn *adds
nothing*. The wrong-turn beat is deliberately out of the trailer — it needs more
setup than a trailer segment can give it.

### Assets
`assets/fonts/VT323-Regular.ttf` (OFL) is committed — the game pulls VT323 from a
CDN, but drawtext needs a font file on disk. Sister repo `kleer001/utilities` holds
`window_recorder.sh`, which gained `-t SECONDS` so an unattended capture ends itself.

## Next Step
Nothing is blocked and nothing is half-finished. Start with #6 — watch `clips/out/`
(trailer is 37.1s) and decide whether anything needs a re-cut, since #9 depends on
it. #2 and #3 are quick and independent.

/home/menser/Dropbox/ai/code/finding_numbers

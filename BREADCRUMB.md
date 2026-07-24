fresh

## Summary
Marketing + gameplay session on the number-station maze game. Four arcs, all
SHIPPED and pushed: (1) verified the screen recorder, kept the HTML fallback;
(2) built an armed single-window recorder + a borderless game-capture launcher;
(3) added the honesty system for golden-path rooms + a per-level difficulty
curve; (4) wrote a promo video shot list and corrected overstated marketing copy.
Remaining work is all downstream/manual (recording clips, pasting itch copy) plus
one optional tuning decision.

## Todos

### Parallel
- [ ] #1 Record the 8 promo clips per `video_shot_list.md` (user task; needs a person playing). Key gotcha baked into the doc: social autoplays MUTED, so turn `SHOW NUMBERS` on for clips 1–3 and lean on the waterfall. Use `./capture.sh`.
- [ ] #2 Paste `itch_page_description.md` into itch (Edit game → Description) and update the tagline field — itch does NOT pull from git. Live page: https://kleer001.itch.io/finding-numbers
- [ ] #3 Verify `promo.html` republished correctly on GitHub Pages after the push: https://kleer001.github.io/finding_numbers/promo.html
- [ ] #4 Decide optional tuning: `SEVERITY_RAMP` 6→7 in `src/game/levels.js` pushes the 0.5 honesty floor from level 27 out to level 31 (stretches the ladder to the end). Currently 6.
- [ ] #5 Decide fate of untracked `recording-20260723-113634.mp4` (65 MB, 187s, in repo root) — NOT created this session, left untouched. Keep/move/delete is the user's call.

## Context

### Honesty system (the gameplay core, shipped `f852e43`)
Reverses the old locked "never fix the cell reroll" memory decision (memory file
updated). Golden-path rooms no longer reroll their correct door blindly. At level
start `buildRoomPlan(rng, spec)` (`src/maze/cell.js`) lays out the backbone: per
decision depth `{back, forwards, correctSeq, budget}`. `honesty` (0..1) sets change
budget = `(1-honesty)*10` (1.0→0 changes/never moves, 0.9→1, … 0.5→5). Per-depth
`roomVisits` counter in `state.js` indexes correctSeq, clamped to budget then frozen.
Top-down/fixed-orientation (N=up) so the moved door is directly visible. Frontier
rooms render their FULL fixed door set regardless of re-entry side (so an honest
room looks identical every visit) while `backDir` stays = entryDir (walk-back still
undoes a stray) — that dual requirement was the subtle fix.

### Difficulty curve (`honestyCurve` in `levels.js`)
One contiguous unstable stretch per level, capped at 50% of rooms (always solid
ground), positioned by `subSeed(level,"honesty")` so it floats per level but is
deterministic, and worsening toward the stretch's far end. Floor 0.5 = 5 changes:
past that frustration plateaus (user's call — documented in code). Computed default
in `levelSpec`; a hand-authored `honesty` array on a TABLE row overrides it. Tunables
at top of `levels.js`: COVERAGE_CAP 0.5, COVERAGE_RAMP 20, SEVERITY_RAMP 6, floor 0.5.
Tests: `tests/honesty.test.mjs` (59/59 pass).

### Recording tooling (sister repo `kleer001/utilities`, all pushed)
- `screen_recorder.sh` — full-screen + default-sink monitor, verified working.
- `window_recorder.sh` (`55ce229`) — records ONE window; `-c CLASS` auto-targets by
  WM_CLASS (no click), `-s` starts immediately (skips arm-and-wait), `-draw_mouse 0`
  omits the cursor. Match by WM_CLASS not title (title collides with the terminal cwd).
- `screen_recorder.html` — KEPT as Chrome/other-OS fallback (user decision).
finding_numbers side: `capture.sh` (`fb1a003`) serves the game, opens borderless
Chrome `--app` at native 800×600 (`--force-device-scale-factor=1`, unique `--class`),
hands off to the window recorder. Verified: 800×600 + audio captured.

### Honest-copy fix (`4547261`)
"The maze rearranges itself the moment you stop listening" oversold the game now that
rooms hold still by default. Corrected on ALL THREE surfaces: `README.md`,
`itch_page_description.md`, `promo.html`. New pillar added: "Rooms that lie — but not
all of them." Replacement copy states the real mechanic (correct turn adds a number,
wrong one goes quiet). grep for old phrasings is clean.

## Next Step
Everything code/docs is shipped and pushed (main @ `4547261`). Nothing blocks — the
open todos are downstream manual work. Start with #1 (record clips) since it gates the
launch, or knock out #2/#3 (paste itch copy, verify Pages) which are quick.

/home/menser/Dropbox/ai/code/finding_numbers

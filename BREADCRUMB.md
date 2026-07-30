stale

## Summary
The studio panel was convened for the first time (post-release) and its findings worked
through: CI fixed, two fabricated dial frequencies corrected, store copy narrowed to what
the build keeps, and a large gameplay change landed — levels no longer stop, the overflow
past 16 corrupts the picture, the readout confirms a turn immediately, and a run is now a
pure function of its seed. All committed and pushed to `main`; CI is green for the first
time.

**The live itch build is now behind the code.** Nothing has been re-packaged or
re-uploaded, so the published game is the pre-session one, and the promo clips predate
these changes too. That ordering is most of what's left.

## Gameplay changes this session
Read this before touching promo material or judging an existing clip — the game plays
and looks different now.

- **SHOW NUMBERS defaults OFF.** A fresh player sees the frequency/kHz dial in the status
  field, not the digit string and `n/N`. The station is the compass again. A stored choice
  still wins, so existing saves are unaffected.
- **Levels are unbounded.** 1–16 are the game as designed. `OVERFLOW_FROM = 17` begins the
  overflow; `NAMED_LEVELS = 64` is the last level the badge can name. The counter reads
  decimal to 16, **hex** from 17 (`LV 11`, `LV 40`), then `LV???` forever. `commitWin` no
  longer clamps.
- **Levels 17+ corrupt visually** and stay playable: tile rot, wall dropout, reverse-video
  clash, ramping 0→1 over `CORRUPTION_RAMP = 48` levels. Two guarantees — corruption is
  masked off every walkable cell *and* the corridor lip, and the route is repainted last.
  Verified in rendered pixels at levels 17/24/40/64/70/300: zero inked floor cells.
- **Confirming a correct turn is cheap now.** It cost half a readout pass on average, and
  that wait grew with the message, so deep levels were mostly dead air. The cursor jumps to
  the digit just captured — nothing dropped, reordered, or said fewer times. Minimum to
  clear level 64 went ~38m45s → ~1m44s.
- **Two readout gaps past the overflow**, floors set by ear in `gap-lab.html` against the
  real samples: **390 ms between the repeats of one number, 780 ms between numbers**.
  Authored levels keep their single gap. `repeats` stays 2 — dropping it to 1 was
  considered and rejected, since it removes redundancy exactly where the noise peaks.
- **Rooms are recognisable again.** Corridor width and wall glyph used to re-roll from a
  live RNG stream on every entry, so the same room came back a different shape. Every cell
  is now built from a stream keyed to which room it is — corridor insertion too, so
  `state.rng` no longer exists and a shared seed names the same maze for everyone.
- **Seed is a shareable 4-character code** (`K3F9`), shown and editable in preferences
  (SEED cycles the marked character, SEED CHAR moves the mark). `?seed=CODE` loads someone
  else's run; a plain number still parses, so `capture.sh --seed` keeps pinning takes.
- **Prefs:** LEVEL select and SOUND TEST removed (both dev-only); RESTART LEVEL and
  RESTART GAME added — the latter asks twice, since it overwrites the saved level. 13 rows,
  exactly at the panel's ceiling, so anything new has to displace something.
- **The canvas fills the window** instead of sitting at 800×600 in a black field.
- **LOST CONNECTION is gone.** It was a dev-server heartbeat that shipped in the zip,
  pinging every 2 s and painting a horror-styled failure bar over a working game whenever
  a player's network hiccupped.

## Todos

### Ship the change — the promo work waits on this
- [ ] #1 **Upload `dist/finding_numbers.zip`.** The zip is built and audited: index.html
  at the root, no heartbeat/SIGNAL_LOST/renderLostConnection anywhere in it, the three new
  modules present, labs and REVIEW-LOG excluded, 96 files. Served from a fresh unzip it
  boots, defaults SHOW NUMBERS off, reports NAMED_LEVELS 64 / OVERFLOW_FROM 17, has no
  `state.rng`, and made **0 network requests in 5 s**. Only the upload is left, and it is
  left on purpose — publishing to a live storefront is yours to trigger. Then run the
  uploads-API check in `itch_publish_howto.md`; do not trust the dashboard.
- [ ] #2 (needs: #1) Update the itch page: remove the `signal-lost.png` screenshot (feature
  and file both deleted) and paste the revised `itch_page_description.md` — now "16 levels
  of decay", with the overflow deliberately undocumented.
- [ ] #3 Re-capture promo clips — everything in `clips/` predates this session (SHOW
  NUMBERS on, old framing, old cadence). **Needs you at the machine**, not #1:
  `capture.sh` opens a visible Chrome window on `DISPLAY=:0` and records it with system
  audio, so an unattended run would take over your desktop and record whatever it is
  playing. The clips themselves are gitignored throwaway until reviewed.

### Promo — the launch window is open (all of it needs #1 live and #3 re-shot)
- [ ] #4 (needs: #3) Post the core-loop clip to the genre communities under Channels in
  `../trace_rom_studio/MARKETING-PLAN.md`. None have seen it.
- [ ] #5 (needs: #3) Post a devlog with `clips/out/core-loop.gif` and `pulse.gif`.
  Descriptions take images, not video, so GIFs are the only in-page motion.
- [ ] #6 (needs: #3) Post the three `clips/out/*-9x16.mp4` verticals to short-video feeds.
  Never the itch trailer slot — Shorts can't be A/B tested.
- [ ] #7 (needs: #3) Run YouTube Test & Compare on <https://youtu.be/B6LhrtK0SJs> with the
  three titles and `clips/out/thumbs/`. Needs Advanced Features (phone + ID) on the channel
  first or the option won't appear.

### Design calls left open
- [ ] #8 Badge garble is OFF. The approved glitch profile had it on, but at severity 0.6 it
  rots the characters and destroys the hex notation underneath (`5V 5▓` instead of `LV 28`).
  Shipped the notation as the treatment; adding noise back is easy.
- [ ] #9 The readout-overrun effect is invisible to most players now that SHOW NUMBERS
  defaults off — they see `kHz`. Corrupting the frequency field instead would reach
  everyone. Not decided.
- [ ] #10 `pickThemed` in `maze/cell.js` still resolves theme arrays, shadowed now that
  `state.js` pre-resolves per room. Left alone deliberately: fixing it changes `makeCell`'s
  contract and rewrites a test asserting a real invariant, for no behavioural gain.

### Studio paperwork — none of it reaches a player
- [ ] #12 Commit and push `../trace_rom_studio`: the VERSION bump to 0.5.0, the 0.5.0
  honest-copy directive, and `template/.claude/skills/honest-copy/`. **Left uncommitted on
  purpose** — that CHANGELOG also holds your own in-progress 0.4.0 and 0.3.1 entries, and I
  wasn't going to commit those for you. Decide: all of it, or only the honest-copy files.
- [ ] #15 Decide who writes `GAME-SHEET.md` and `SPEC-SHEET.md` — a spec precise enough to
  implement from is reverse-engineering, and the pitch should be the author's intent.
- [ ] #16 Rule on the studio 0.2.0 compositor directive. Reviewed this session;
  recommendation is to adopt it for new passes only, not to rewrite the working frame loop
  (thin test coverage on title/jukebox/wipe/menu). Already partly moved that way —
  `render/chargrid.js` owns glyph placement and `drawGlitch` runs as an ordered pass inside
  `render()`.
- [ ] #17 Rule on test naming: `*.test.mjs` here vs `*.test.js` in the studio. Now 21
  renames plus the `package.json` glob.
- [ ] #18 Upstream `capture.sh`, `post.sh` and `video_shot_list.md` to
  `../trace_rom_studio` — scripted self-recording takes have no studio equivalent.
- [ ] #19 Record the studio's contribution convention in its `CLAUDE.md`; right now it is
  only inferable from one commit.
- [ ] #21 Raise upstream: `../trace_rom_studio/template/PUBLISHING-RUNBOOK.md` contradicts
  itself on whether a same-named dashboard replacement keeps the browser-playable flag —
  §"replacing a build" says it arrives as `type=default`, §"Choosing" says dashboard
  replacement preserves flags. Both cannot be true, and the 0.3.0 directive rests on the
  first. `itch_publish_howto.md` documents the contradiction rather than picking a side.
- [ ] #20 (needs: #16) `python3 ../trace_rom_studio/scripts/check_updates.py . --mark-read`
  to advance the pin from 0.1.0 once the outstanding directives are resolved.

## Context
- Live: <https://kleer001.itch.io/finding-numbers> · itch game id `4800315` · API key at
  `~/Dropbox/ai/code/itch_io_api_secret.txt` (read into an env var, never echo).
- **Read `itch_publish_howto.md` (Gotchas) before touching the itch edit form.** Saving
  rewrites every field from the loaded page and can silently revert what you didn't edit.
- `clips/` and `clips/out/` are gitignored — rebuilt by `./capture.sh <clip>` and
  `./post.sh`, never stored. Retiming is the two tables at the top of `post.sh`.
- Pinned to `../trace_rom_studio` at `0.1.0`; the studio is now at `0.5.0`. Directives are
  proposals to raise with the user, never auto-applied.
- **New modules:** `render/glitch.js` (overflow corruption — `glitchPlan` is pure and
  tested, `drawGlitch` draws), `render/chargrid.js` (the one-glyph-per-cell contract,
  shared so render and glitch can't drift), `game/seed.js` (the 4-character code).
- **Two tuning labs**, served from the repo root, dev tools and not shipped surfaces:
  `glitch-lab.html` drives the real renderer with the real level spec (preset `★ CHOSEN` is
  the shipped profile); `gap-lab.html` auditions a number in groups of four through the
  real audio chain, and is where 390/780 came from.
- **What verification actually caught here**, worth repeating: driving the real game and
  measuring digit onsets found a wiring gap where the new gap was computed and then dropped
  on the way to the audio (`readoutCadence` exists because of that). Sampling rendered
  pixels proved the route guarantee rather than assuming it. Parsing the shipped woff2 cmap
  settled a suspected tofu bug — all nine wall glyphs are present, including U+1FB95.
- `.claude/skills/honest-copy/` audits public-facing copy; its fifth test checks claims
  against the build. Run it on anything before it reaches an audience.
- Tests: 117, green locally and on a clean `npm ci` checkout. 60 fps at full corruption
  depth with the CRT on.

## Next Step
Upload `dist/finding_numbers.zip` (#1) — it is built, audited and verified to run from a
fresh unzip, and the only reason it is not live is that publishing to a storefront is your
call. Everything in the promo section is dead weight until it lands, and every existing
screenshot and clip shows a HUD a new player will not see.

Note: this file was loaded with `--go`, so line 1 reads `stale`. The content below is
current as of 2026-07-30 — a plain `/bob` will warn before overwriting it; use
`/bob --force` if you want it replaced.

/home/menser/Dropbox/ai/code/finding_numbers

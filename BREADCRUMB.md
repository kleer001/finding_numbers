fresh

## Summary
Launched. What's left is optional: studio daughter paperwork, two convention
divergences to rule on, and post-launch promo.

## Todos

### Parallel
- [ ] #10 Decide `REVIEW-LOG.md` shape. Gates 1 and 2 never convened, so they cannot be
  backfilled without fabricating a panel record. Either a preamble saying so, or a
  preamble plus a genuine release-gate panel dated when it runs.
- [ ] #11 Write `ITCH-PAGE.md` and `MARKETING-PLAN.md` in the studio's shape.
  `itch_page_description.md` already holds the live copy verbatim — transcription, no
  new decisions.
- [ ] #12 Decide who writes `GAME-SHEET.md` and `SPEC-SHEET.md` — a spec precise enough
  to implement from is reverse-engineering, and the pitch should be the author's intent.
- [ ] #13 Rule on the studio 0.2.0 compositor directive. No `src/compositor.js`; render
  is modular by concern (`render.js`, `waterfall.js`, `burnin.js`, `title.js`,
  `menu.js`) but has no ordered layer stack. Adopting means refactoring shipped code.
- [ ] #14 Rule on test naming: `*.test.mjs` here vs `*.test.js` in the studio. Sixteen
  renames plus the `package.json` glob.
- [ ] #15 Post a devlog with `clips/out/core-loop.gif` and `pulse.gif`. Descriptions
  take images, not video, so GIFs are the only in-page motion.
- [ ] #16 Post the three `clips/out/*-9x16.mp4` verticals to short-video feeds. Never
  the itch trailer slot — Shorts can't be A/B tested.
- [ ] #17 Run YouTube Test & Compare on <https://youtu.be/B6LhrtK0SJs> with the three
  titles and `clips/out/thumbs/`. Needs Advanced Features (phone + ID) on the channel
  first or the option won't appear.
- [ ] #18 Upstream `capture.sh`, `post.sh` and `video_shot_list.md` to
  `../trace_rom_studio` — scripted self-recording takes have no studio equivalent.
- [ ] #19 Record the studio's contribution convention in its `CLAUDE.md`; right now it's
  only inferable from one commit.

### Sequential
- [ ] #20 (needs: #13) `python3 ../trace_rom_studio/scripts/check_updates.py . --mark-read`
  to advance the pin. The 0.3.0 publishing directives are already satisfied by
  `itch_publish_howto.md`.

## Context
- Live: <https://kleer001.itch.io/finding-numbers> · itch game id `4800315` · API key at
  `~/Dropbox/ai/code/itch_io_api_secret.txt` (read into an env var, never echo).
- **Read `itch_publish_howto.md` (Gotchas) before touching the itch edit form.** Saving
  rewrites every field from the loaded page and can silently revert what you didn't edit.
- `clips/` and `clips/out/` are gitignored — rebuilt by `./capture.sh <clip>` and
  `./post.sh`, never stored. Retiming is the two tables at the top of `post.sh`.
- Pinned to `../trace_rom_studio` at `0.1.0`. Directives are proposals to raise with the
  user, never auto-applied.

## Next Step
**#11** — pure transcription of copy already verified true, closes two gaps with no
decisions. **#10** is the call that unblocks the rest of the paperwork.

/home/menser/Dropbox/ai/code/finding_numbers

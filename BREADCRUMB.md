fresh

## Summary
finding_numbers is **launched and live**. The itch.io page carries the current build,
the full description, a corrected tagline, reshot cover and screenshots, and the
YouTube trailer link. The jukebox promo clip was re-shot so it walks the picker
instead of staring at it. Publishing knowledge earned during the launch was
upstreamed to Trace ROM Studio (bumped to 0.3.0), and this repo was adopted as a
studio daughter.

Everything remaining is optional: daughter paperwork, two studio-convention
divergences, and post-launch promo.

## Todos

### Parallel
- [ ] #10 Decide `REVIEW-LOG.md` shape. Gates 1 (design) and 2 (MVP) never convened —
  the game predates the studio — so they **cannot be backfilled without fabricating a
  panel record**, which the studio's anti-fabrication rule forbids. Two honest routes:
  (a) preamble only, stating plainly the early gates never ran; (b) preamble plus a
  genuine release-gate panel dated at the time it runs, which is legitimate because
  the shipped game can actually be reviewed.
- [ ] #11 Write `ITCH-PAGE.md` and `MARKETING-PLAN.md` in the studio's shape. Content
  already exists and is known-true: `itch_page_description.md` holds the live page
  copy verbatim.
- [ ] #12 Decide who writes `GAME-SHEET.md` and `SPEC-SHEET.md`. A spec "precise enough
  to implement from" for a finished game is reverse-engineering, and the pitch should
  reflect the author's intent rather than a reading of the code.
- [ ] #13 Studio 0.2.0 compositor directive. No `src/compositor.js`; the render path is
  modular by concern (`render.js`, `waterfall.js`, `burnin.js`, `title.js`, `menu.js`)
  but has no ordered layer stack honoring `{name, draw(ctx, frame)}`. Whether that
  already counts as "explicit ordered passes" is a judgment call, and adopting it means
  refactoring working shipped rendering.
- [ ] #14 Test-naming divergence: tests are `*.test.mjs`, studio convention is
  `*.test.js`. Sixteen renames plus the `package.json` glob. Cosmetic.
- [ ] #15 Post a devlog with `core-loop.gif` and `pulse.gif` — itch is actively
  prompting for one and an update this size earns it. Descriptions take images, not
  video, so GIFs are the only in-page motion.
- [ ] #16 Post the three 9:16 verticals (`core-loop` 15s, `room-moved` 5.4s, `pulse` 6s)
  to short-video feeds. Not for the itch trailer slot — Shorts can't be A/B tested.
- [ ] #17 Run YouTube Test & Compare with the three titles and three thumbnails. Needs
  Advanced Features (phone + ID) enabled on the channel first, or the option won't
  appear. Expect inconclusive at low view volume; that's a real outcome, not a failure.
- [ ] #18 Upstream the promo pipeline to the studio — `capture.sh`, `post.sh` and
  `video_shot_list.md` have no studio equivalent, and scripted self-recording takes are
  reusable across every game.
- [ ] #19 Record the studio's contribution convention in its `CLAUDE.md`. Its only prior
  history is a PR merge from a `claude/*` branch, but 0.3.0 went in as a direct push to
  `main`. Right now the convention is only inferable from one commit.

### Sequential
- [ ] #20 (needs: #13) Once the compositor directive is resolved, run
  `python3 ../trace_rom_studio/scripts/check_updates.py . --mark-read` to advance the
  pin. The 0.3.0 publishing directives are already satisfied — `itch_publish_howto.md`
  is where that knowledge came from.

## Context

### Live state
- Game: <https://kleer001.itch.io/finding-numbers> · itch game id `4800315`
- Trailer: <https://youtu.be/B6LhrtK0SJs> (channel `clearmenser`), wired into the page
  as `https://www.youtube.com/watch?v=B6LhrtK0SJs`
- Landing page: <https://kleer001.github.io/finding_numbers/promo.html> (Pages runs on
  `build_type: legacy`, deploy-from-branch — **no** deploy workflow, deliberately)
- Live upload id `18581437`, `type=html`, 1,536,367 bytes — byte-identical to
  `dist/finding_numbers.zip`

### Verifying a release without trusting the dashboard
API key at `~/Dropbox/ai/code/itch_io_api_secret.txt` (40 chars; read into an env var,
never echo it). `butler` v15.29.0 is installed at `~/bin/butler` and authenticates via
`BUTLER_API_KEY`, but it pushes **builds only** — it cannot touch page furniture.

```sh
curl -sS "https://itch.io/api/1/$KEY/game/4800315/uploads"   # type must be html
```

A release is not shipped until `type=html` **and** `size` equals the local archive's
byte count.

### The itch edit form loses work — read before touching it
Full detail in `itch_publish_howto.md` (Gotchas). The short version: saving rewrites
**every** field from the loaded page, so editing one field can silently revert the
description and tagline while still returning `{"success":true}`; validation is
all-or-nothing, so the hard 120-character tagline limit discards unrelated edits in the
same save; and replacing a build with a same-named zip swaps it server-side **on upload,
not on save**, arriving without the browser-playable flag. Verify the fields you are
*not* editing **before** saving — checking after is repair, not prevention.

The Playwright-with-real-cookies harness used to drive the form lived in session
scratchpad and is **gone**. That was deliberate: the studio runbook teaches the manual
procedure plus verification instead, because automating a form that overwrites
everything on save is how the description gets blanked.

### Studio tie
Daughter of `../trace_rom_studio`, pinned at `0.1.0` in `.trace_rom_studio_version` —
stamped low on purpose so `check_updates.py` surfaces 0.2.0 and 0.3.0 as proposals
rather than marking them silently adopted. Directives are **proposals to raise with the
user, never auto-applied**. The studio's house platform is literally defined as "match
`override` and `finding_numbers`", so conventions were derived here.

Deviation worth keeping: `Math.random` appears in `render.js`, `station.js` and
`pickInterval` — presentation timing only. `src/maze/` and `state.js` have none, so the
maze, honesty system and golden path stay seeded, which is what lets `?seed=4242`
re-shoot takes verbatim.

### Promo assets (all of `clips/` and `clips/out/` is gitignored — rebuilt, not stored)
- `./capture.sh <clip>` records; `./post.sh` cuts everything. Re-runnable, overwrites in
  place. Retiming is editing the two tables at the top of `post.sh` — no re-recording.
- `clips/out/trailer.mp4` 45.4s · `jukebox.mp4` 65s · 3 verticals · 2 GIFs
- `clips/out/thumbs/` — three 1280×720 YouTube thumbnails (A/B/C)
- The jukebox walk is a data table (`JUKEBOX_WALK` in `src/demo.js`) so tests can replay
  it. Holds are ≥4200ms because CALM leaves up to 4000ms between digits — a shorter hold
  changes a setting on screen that never actually speaks.
- Old 30s jukebox take preserved at `clips/prev-shortjukebox/jukebox.mp4`

## Next Step
Start with **#11** — `ITCH-PAGE.md` and `MARKETING-PLAN.md` are pure transcription of
copy already written and already verified true on the live page, so they close two
daughter gaps with no new decisions. **#10** is the one that genuinely needs a call
before anything else in the studio-paperwork group can be finished.

/home/menser/Dropbox/ai/code/finding_numbers

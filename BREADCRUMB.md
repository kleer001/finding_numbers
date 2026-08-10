fresh

## Summary
The game is live and taking its first player feedback. A reported bug — the keyboard dying
on itch's fullscreen button and staying dead — turned out to be two faults stacked: itch's
own focus loss, plus a `preventDefault` here that cancelled the click that would have
healed it. Fixed, tested in both engines and against the live embed, shipped as v1.1.1, and
bubbled up to the studio as the 0.16.0 directive. The pin is now current at 0.16.0 with the
whole backlog resolved. What remains is publishing two devlogs, the verticals, the curator
pitches, two stale store images, and a pile of design calls that are the author's.

## Todos

### Parallel
- [ ] #32 Watch what the six community posts brought back. The question worth answering
  is the one the posts asked: whether the navigate-by-ear loop reads with the digit count
  off by default. Fold what players say into the next pass rather than into the copy.
  Repost windows: `r/WebGames` not before 2026-11-01, `r/playmygame` not before
  2026-09-01. Both are recorded on the board `scratchpad/build_submit_links.py` builds.
- [ ] #34 Publish the v1.1.1 devlog, "The keyboard survives fullscreen". Copy is the last
  block of `OUTREACH-COPY.md`, already through `humanized-copy` (142 words) and
  `honest-copy`. No draft exists yet — itch has no devlog API, so it is a hand-paste at
  `itch.io/dashboard/game/4800315/new-devlog`. Worth a reply to the reporter on the game
  page once it is up; their report is what found the bug.
- [ ] #5 Publish the devlog. It exists as a **draft** with both GIFs uploaded and embedded,
  classified Game Design, comments on:
  <https://kleer001.itch.io/finding-numbers/devlog/1613536/sixteen-is-the-largest-number-the-counter-can-hold>
  Edit at `itch.io/dashboard/post/1613536/edit`; tick `post[published]` and Save to go live.
  Left unpublished deliberately — publishing notifies followers and hits the itch feed, and
  that is not reversible. Its opening line, "I built sixteen levels", is a first-person
  authorship claim nobody has ruled on yet.
- [ ] #33 The live `r/numberstations` post is titled "I built a number station in
  WebAudio". That is the same shape of claim struck from the r/playmygame Involvement
  field, where the audio engine turned out not to be the author's work. The post is
  already up, so the call is whether the title overstates it and whether to edit or
  delete. Only the author knows where the line sits between their work and `voice_loom`.
- [ ] #6 Post the three `clips/out/*-9x16.mp4` verticals. Never the itch trailer slot.
- [ ] #27 Pitch the curators — Warp Door, Free Game Planet, Alpha Beta Gamer,
  ManlyBadassHero. One email each, bodies in `OUTREACH-COPY.md`.
- [ ] #29 The itch banner still reads `FINDING NUMBERS` in caps while the title is now
  `finding_numbers`. It is `docs/img/banner.png` in the page theme, a separate asset the
  title change did not touch. Needs a re-render to match — `docs/theme-src/README.md` has
  the steps, and they now serve the repo root (`./run.sh`) rather than the theme directory,
  since `font.css` points at the game's own `assets/fonts/vt323-subset.woff2`.
- [ ] #30 `docs/img/cover.png` shows the digit readout (`01`, `2 / 3`) — a real option,
  but no longer the default look, so the store page leads with a HUD new players will not
  see. Author's call whether to re-shoot.
- [ ] #31 Three title variants and three 1280×720 thumbnails for YouTube Test & Compare
  (`clips/out/thumbs/` has three already). The last unchecked asset in `MARKETING-PLAN.md`.

### Design calls — the author's to make
- [ ] #8 Badge garble is OFF. The approved profile had it on, but at severity 0.6 it rots
  the characters and destroys the hex notation (`5V 5▓` instead of `LV 28`). The notation
  shipped as the treatment instead.
- [ ] #9 The readout-overrun effect is invisible to the default player, who sees `kHz`.
  Corrupting the frequency field would reach everyone. `src/render/render.js:53-59`, the
  `else` branch that draws the dial, using the existing severity ramp.
- [ ] #24 The Critic's two open items from `REVIEW-LOG.md` Session 2: a room only moves on
  **re-entry**, so a careful player may never meet the mechanic; and `LV???` forever is
  authored now, but nobody has reached it to say whether it reads as a statement.
- [ ] #10 `pickThemed` in `maze/cell.js` still resolves theme arrays, shadowed now that
  `state.js` pre-resolves per room. Left alone deliberately — fixing it changes
  `makeCell`'s contract and rewrites a test asserting a real invariant, for no gain.

### Studio paperwork
- [ ] #17 Rule on test naming: `*.test.mjs` here vs `*.test.js` in the studio. **Both**
  `package.json` files are `"type": "module"`, so `.mjs` buys nothing. 22 renames plus the
  `package.json` glob.
- [ ] #15 Decide who writes `GAME-SHEET.md` — the pitch should be the author's intent, and
  this repo has never had one. (The spec sheet half of this is retired: studio 0.16.0 ends
  `SPEC-SHEET.md` entirely, and there is none here.)

## Context

**The live store page is current.** Title `finding_numbers`, four screenshots from this
build, 146-word description, tagline 117/120. Pricing is `$0 or donate` with a $2.99
suggestion — that is the real decision and `ITCH-PAGE.md` now records it. Saving the itch
form rewrites *every* field, so read `itch_publish_howto.md` before opening it. itch
reformats stored HTML: a find-and-replace against the live description must match itch's
version (`<blockquote><strong>…<br></blockquote>`), not the repo's.

**Editing the itch page works.** A logged-in session exists in the Playwright MCP browser
(system Chrome, account `kleer001`). Set the Redactor layer *and* the backing textarea,
then click `button.save_btn`. **Screenshot deletes are immediate AJAX** — the row goes
server-side the moment Delete is clicked, whatever the confirm dialog says.

**Devlogs, mechanically.** New post at `itch.io/dashboard/game/<id>/new-devlog`; the list
is `.../devlog` and an existing post edits at `itch.io/dashboard/post/<post_id>/edit`. The
contenteditable is `.redactor-layer`, **not** `.redactor-editor` — the latter selector
matches nothing and silently no-ops. `post[published]` defaults **unchecked**, so a plain
Save creates a draft. Inline images: click `.redactor-toolbar .re-image`, which opens a
lightbox in `#lightbox_container` whose "Pick image" button raises the native file chooser.
That container keeps a non-null `offsetParent` after it closes, so test whether it is
really open by whether it still holds buttons.

**Positioning, decided this session.** The register is dread, not terror or horror — the
game holds anticipation and never discharges it. "Liminal horror" and "analog horror" name
a shelf and are fair; bare "horror" must carry, within a line or two, that nothing chases
you and nothing can kill you. "Suspense" and "thriller" are ruled out entirely: they
promise stakes and a clock the build does not have. Real station names and dial
frequencies stay out of copy — naming them promises audio this game does not have. The
station is a tribute, not a recording.

**Two claims keep coming back and must not.** "More voices as you go" and "more of each
level you can't trust" both cap at level 12: generated levels reuse `noise: {wash: 0.7,
burst: 1}` verbatim, and `honestyCurve` hits its 0.5 coverage cap there too. Compressing a
qualified sentence drops the qualifier first — which is why `honest-copy` runs *after* a
length pass, never before.

**Tooling.** `.claude/skills/humanized-copy/` — `check.py` measures reading grade,
sentence spread, bullet length and per-surface word budgets against the `banned.md`
rulebook; run `--fenced` for `OUTREACH-COPY.md` (each block scored as its own post) and
`--budget N` to gate. For a file mixing notes with copy, measure below the `---` only.
Budgets: 200 store, 150 post/email, 50 social, 25 caption, 80 README intro.

**The itch embed and the keyboard.** itch serves the game from `html-classic.itch.zone`
inside a page on `itch.io`, so its fullscreen button belongs to the parent origin and takes
focus with it. `installInput` in `src/game/input.js` reclaims focus on `resize` and on a
capture-phase `pointerdown` — the capture flag is load-bearing, since `installTouch`
cancels the press and a cancelled press cancels the `mousedown` that refocuses the frame.
`tests/input-focus.test.mjs` guards both listeners against a fake `window`. To reproduce
the embed locally, serve the game on one port and a page that frames it on another;
different ports are different origins, which is the whole condition.

**Studio pin is current at 0.16.0**, backlog resolved. Adopted: the adaptive dev server
(`run.sh` scans upward for a free port and no longer SIGKILLs whatever holds it) and the
no-inline-binary rule. Declined, with reasons that still hold: `REVIEW-LOG.md` stays; the
compositor refactor is not worth churning shipped render code; the doc-purge half of
"the code is the description" is aimed at stale prose about existing code, and the bulk
here is forward-looking `MOBILE-*` planning instead.

- Live: <https://kleer001.itch.io/finding-numbers> · game id `4800315` · upload `18598594`
- Trailer: <https://youtu.be/3_maIo0cYAk> · thumbnail `clips/out/thumbs/A-dont-trust-the-walls.png`
- Publish: `./package.sh` → `butler push dist/finding_numbers.zip kleer001/finding-numbers:html5`
  → verify `type=html`. `BUTLER_API_KEY` from `~/Dropbox/ai/code/itch_io_api_secret.txt`.
- `clips/` and `clips/out/` are gitignored, rebuilt by `./capture.sh <clip> clips/` then
  `./post.sh`. Retiming lives in the two tables at the top of `post.sh` — never re-record.
- Two generated pages, both built from `OUTREACH-COPY.md` and gitignored:
  `scratchpad/build_copy_page.py` → `copy-review.html`, the per-channel copy board;
  `scratchpad/build_submit_links.py` → `submit-links.html`, prefilled composer links with
  the posted dates. `scratchpad/serve.py` serves both on the first free port from 8300.
  Reddit's composer reads `title` and `url` from the query string and has no body
  parameter, which is why bodies stay copy buttons.
- Tests: 118, green.

## Next Step
Publish the v1.1.1 devlog (#34) — the fix is live but nobody has been told, and the player
who reported it is owed a reply. Then #5, the older draft, whose opening line claims the
sixteen levels in the first person and needs a ruling before it goes out.

/home/menser/Dropbox/ai/code/finding_numbers

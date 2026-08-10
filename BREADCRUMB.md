fresh

## Summary
The game is live at v1.1.1 and taking player feedback. The code is quiet; what is left is
outreach and a pile of calls only the author can make — an unpublished devlog draft with an
authorship claim in it, a live Reddit title that may overstate the same thing, the verticals,
the curator pitches, two stale store images, and the design questions below.

## Todos

### Parallel
- [ ] #32 Watch what the six community posts brought back. The question worth answering
  is the one the posts asked: whether the navigate-by-ear loop reads with the digit count
  off by default. Fold what players say into the next pass rather than into the copy.
  Repost windows: `r/WebGames` not before 2026-11-01, `r/playmygame` not before
  2026-09-01. Both are recorded on the board `scratchpad/build_submit_links.py` builds.
- [ ] #35 Reply to the player who reported the fullscreen bug, on the game page comments.
  Their report is what found it, the fix is live, and the devlog is up:
  <https://kleer001.itch.io/finding-numbers/devlog/1623552/the-keyboard-survives-fullscreen>
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
- [ ] #6 Post the three `clips/out/*-9x16.mp4` verticals as Shorts on the channel that
  already hosts the trailer. Never the itch trailer slot.
- [ ] #27 Pitch the curators, in reach × fit order — Alpha Beta Gamer, then Warp Door.
  One email each, bodies in `OUTREACH-COPY.md`.
- [ ] #36 Post to r/IndieGaming and r/indiegames, copy in `OUTREACH-COPY.md`. r/IndieGaming
  allows one submission per two weeks and wants an account with ordinary posting history;
  r/indiegames requires a GIF on the post and forbids framing promo as a feedback request.
- [ ] #37 Post to the Haunted PS1 Discord once initiation clears, copy in
  `OUTREACH-COPY.md`. Names the Kokoro-82M voices, and does not argue the case for the
  tooling — rule 12 bans that separately from disclosure.
- [ ] #38 Rule on the itch.io Generative AI disclosure field, which is currently unset on
  the game page. Optional for games, mandatory for asset packs, and it splits into
  Graphics / Sound / Text & Dialog / Code. The digit voices are generated Sound, so
  answering **No** would produce a false "No AI" tag; leaving it unset is the status quo
  and the description already names Kokoro-82M in prose. Author's call which.
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

**Positioning, settled.** The register is dread, not terror or horror — the
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
Reply to the bug reporter (#35) — small, and they are owed it. Then #5, the older devlog
draft, whose opening line claims the sixteen levels in the first person and needs a ruling
before it goes out.

/home/menser/Dropbox/ai/code/finding_numbers

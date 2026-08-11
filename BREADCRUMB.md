stale

## Summary
The game is live at v1.1.1 and taking player feedback. The code is quiet, every outreach
channel has paste-ready copy behind it and the store page art matches the title, so what
is left is sending — three community posts, two curator emails, three Shorts — plus a live Reddit
title whose authorship claim is still unruled, one stale store image, and the design
questions below.

## Todos

### Parallel
- [ ] #32 Watch what the six community posts brought back. The question worth answering
  is the one the posts asked: whether the navigate-by-ear loop reads with the digit count
  off by default. Fold what players say into the next pass rather than into the copy.
  Repost windows: `r/WebGames` not before 2026-11-01, `r/playmygame` not before
  2026-09-01. Both are recorded on the board `scratchpad/build_submit_links.py` builds.
- [ ] #33 The live `r/numberstations` post is titled "I built a number station in
  WebAudio". That is the same shape of claim struck from the r/playmygame Involvement
  field, where the audio engine turned out not to be the author's work. The post is
  already up, so the call is whether the title overstates it and whether to edit or
  delete. Only the author knows where the line sits between their work and `voice_loom`.
  Note the store page already discloses Code publicly, so the Reddit title is the only
  surface where a first-person build claim stands unqualified.
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
- [ ] #30 `docs/img/cover.png` shows the digit readout (`01`, `2 / 3`) — a real option,
  but no longer the default look, so the store page leads with a HUD new players will not
  see. Author's call whether to re-shoot.

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

**The page theme is a separate form** from the description editor, so it does not carry
that form's rewrites-every-field hazard. It opens from `.edit_theme_btn` on the public
page — inside `.header_buttons.owner_tools`, which the responsive CSS hides entirely
below roughly a 1600px viewport, so widen the window before hunting for the button. An
image slot that already holds a picture shows only **Remove image**; the file input does
not exist until the slot is empty, so Remove first, then Upload. Scope every selector to
the slot's own hidden input (`layout[banner_image][image_id]`) — Banner, Background and
Embed BG are the same widget three times over and an unscoped click is a coin flip.

**The two generated pages are built from a hardcoded channel list** at the top of
`scratchpad/build_copy_page.py`. A section named there but missing from
`OUTREACH-COPY.md` hard-exits the build and no page is written at all, and a section in
the copy file that the list does not name silently never reaches the board. Adding a
channel means editing both. Cards group by the bucket string, and only consecutive runs
of one bucket group together, so insertion order is the display order.

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

**Authorship and AI disclosure, the standing constraint.** Never claim the game is
hand-written or hand-coded: `git blame` puts every line of `src/` and `tests/` in commits
carrying a Claude co-author trailer, 119 of 142 commits, from the first feature commit on.
What *is* disclosed everywhere already — README, store description, r/playmygame
involvement field — is the Kokoro-82M digit voices, which is the generative content inside
the artifact and the category audiences actually police; itch.io's own disclosure form
lists Code separately from Graphics, Sound and Text, and reporting on community reaction
finds the backlash aimed at generated art and assets rather than code. So disclose the
voices, do not volunteer a code-provenance essay into promo copy, and never assert the
opposite of either. The store page's own AI Disclosure field is set and public as **AI
Assisted — Code, Sounds, Text**, ruled to stay that way: narrowing a disclosure already
on the page is the one move that reads badly if anyone notices. This binds #33 and #37.

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
- Trailer: <https://youtu.be/3_maIo0cYAk> · three title + thumbnail packages ready to
  load into Test & Compare, in `OUTREACH-COPY.md`. The live title still reads
  `Finding Numbers` in title case; whichever package wins retires that spelling.
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
Send something. `r/IndieGaming` and `r/indiegames` (#36) are the two widest channels with
copy already written and no gate left to wait on, and the board at
`scratchpad/copy-review.html` has both with copy buttons.

/home/menser/Dropbox/ai/code/finding_numbers

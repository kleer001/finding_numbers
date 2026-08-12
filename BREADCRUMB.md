fresh

## Summary
The game is live at v1.1.1 and taking player feedback. The code is quiet, every outreach
channel has paste-ready copy behind it and the store page art matches the title, so what
is left is sending — three community posts, two curator emails, three Shorts — plus a live Reddit
title whose authorship claim is still unruled, one stale store image, and the design
questions below.

## Todos

### Parallel
- [ ] #36 **START HERE. Post to r/IndieGaming and r/indiegames.** The two widest channels
  left, both with finished copy and no gate still to wait on. Titles and bodies are in
  `OUTREACH-COPY.md` under each sub's own heading; `scratchpad/build_copy_page.py` puts
  both on the board with copy buttons.
  - r/IndieGaming (512K): text post, one submission per two weeks, and the posting
    account needs ordinary comment history — Reddit's own filter shadowbans accounts
    whose first posts are links, and a shadowbanned post looks exactly like one nobody
    upvoted.
  - r/indiegames (326K): Rule 1 requires an image, GIF or video on the post — attach
    `clips/out/core-loop.gif`. Two posts a week is the ceiling, and dressing a promo as
    a request for feedback breaks their rules, which is why that body asks nothing.
- [ ] #32 Watch what the six community posts brought back. The question worth answering
  is the one the posts asked: whether the navigate-by-ear loop reads with the digit count
  off by default. Fold what players say into the next pass rather than into the copy.
  Repost windows: `r/WebGames` not before 2026-11-01, `r/playmygame` not before
  2026-09-01. Both are recorded on the board `scratchpad/build_submit_links.py` builds.

- [ ] #6 Post the three `clips/out/*-9x16.mp4` verticals as Shorts on the channel that
  already hosts the trailer. Never the itch trailer slot.
- [ ] #27 Pitch the curators, in reach × fit order — Alpha Beta Gamer, then Warp Door.
  One email each, bodies in `OUTREACH-COPY.md`.
- [ ] #37 Post to the Haunted PS1 Discord once initiation clears, copy in
  `OUTREACH-COPY.md`. Names the Kokoro-82M voices, and does not argue the case for the
  tooling — rule 12 bans that separately from disclosure.


### The voice recast landed — these follow from it
- [ ] #41 **The Kokoro-82M disclosure is now false everywhere.** The game no longer
  contains any synthesised voice; the digits are CC0 human recordings from the Common
  Voice single-word target segment. Stale in `README.md:132`,
  `itch_page_description.md:48`, `promo.html:444`, throughout `OUTREACH-COPY.md`, and in
  the **live store description**. All of it has to move together — half-corrected copy
  reads worse than none.
- [ ] #42 (needs: #41) The store's AI Disclosure field is public as **AI Assisted —
  Code, Sounds, Text**. "Sounds" was there for the Kokoro voices, which are gone. The
  standing rule that narrowing a live disclosure reads badly was written when the
  narrowing would have been cosmetic; now the underlying fact has actually changed.
  Author's call, and it should be made in the same pass as #41.
- [ ] #43 `INTRO_MESSAGES` in `src/game/config.js` still carries station patter in
  languages the station no longer voices — `MUOVITI`/`ASCOLTA` (italian),
  `UGOKE`/`KIKE`/`HAJIME` (japanese), `CHALO`/`SUNO`/`SHURU` (hindi). Its own comment
  says the pool is "languages the station voices". Polish, turkish, arabic, welsh and
  georgian have no patter at all. Needs verified translations, and the shipped font
  renders accented Latin and Cyrillic but not Arabic or Georgian script.
- [ ] #44 Samples now average **0.86s**, not the 1.08s the cadence floor was tuned
  against (`src/game/levels.js`). RAPID's 600ms minimum therefore slurs the digits less
  than designed — the station comes apart more gently. The comment records the measured
  figure; the tuning is untouched. Decide whether to retune `CADENCE_FLOOR` to restore
  the original slur.
- [ ] #45 The jukebox demo take got longer: covering eleven voices needs ten presses at
  a 4200ms hold (a shorter hold would let a language pass without speaking, which
  `tests/demo-path.test.js` pins). Re-shoot with `./capture.sh jukebox clips/` if the
  clip is still wanted at its old length.
- [ ] #46 (needs: #41) Ship it — `./package.sh`, then
  `butler push dist/finding_numbers.zip kleer001/finding-numbers:html5`. The recast is
  committed but the live build still plays the synth voices.

### Design calls — the author's to make
- [ ] #8 Badge garble is OFF. The approved profile had it on, but at severity 0.6 it rots
  the characters and destroys the hex notation (`5V 5▓` instead of `LV 28`). The notation
  shipped as the treatment instead.

- [ ] #24 The Critic's two open items from `REVIEW-LOG.md` Session 2: a room only moves on
  **re-entry**, so a careful player may never meet the mechanic; and `LV???` forever is
  authored now, but nobody has reached it to say whether it reads as a statement.
- [ ] #10 `pickThemed` in `maze/cell.js` still resolves theme arrays, shadowed now that
  `state.js` pre-resolves per room. Left alone deliberately — fixing it changes
  `makeCell`'s contract and rewrites a test asserting a real invariant, for no gain.

### Studio paperwork

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

**Digit-audio sources, researched and ruled.** The game holds exactly ONE recording
per digit per language (`buffers[lang] = new Array(10)`, `station.js:398`), so speaker
variety is irrelevant — 10 usable clips per language is the whole requirement.
- **Common Voice "Single Word Target Segment"** — CC0-1.0, covers all eight of the
  lineup, digits collected as isolated single words. Needs a Mozilla Data Collective
  account: the download returns `{"message":"no user"}` / 401 without one. The clips
  are CC0 (ship derived audio freely); only re-hosting the dataset is barred.
  Locale list with hours/speakers is in `cv-dataset/datasets/scripted-speech/cv-corpus-7.0-singleword.json`.
- **Wikimedia Commons / Lingua Libre** — CC0 per-file with `AttributionRequired: false`,
  individually downloadable, no account. Purpose-recorded isolated words, not extracted
  speech. But coverage is patchy: english/russian/arabic 10/10, german 9/10, mandarin
  8/10, spanish 6/10, polish 3/10. Of 366 candidates found, 231 were CC BY-SA 4.0 —
  **ShareAlike, which would propagate onto the game** and must be refused.
- **FSI / DLI / Peace Corps** — US-government public domain (17 U.S.C. §105), hosted at
  `fsi-languages.yojik.eu` and `livelingua.com`. Covers seven of eight (no Welsh). One
  consistent voice per language, which is better material than mixed Commons speakers.
  **Unproven:** FSI German Basic Unit 1 lists "Numbers 1-12" in the student text, but
  46 min of Unit 1 audio (files 1.1 and 1.2) contains no counting drill — the numbers
  may be a text-only appendix. File 1.3 unchecked.
- **Zero is the hard digit everywhere.** Courses start counting at one; Commons has the
  fewest candidates for it in every language. It needs solving separately.
- Whisper locator built at `scratchpad/find_digits.mjs` (reuses cyber_synth's
  `@xenova/transformers`); Commons survey at `scratchpad/discover_digits.py`.

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

**Stray file.** `assets/audio/english_10.wav` is unused — the loader reads `_00`..`_09`
only. Not deleted; flagged.

## Next Step
**#41 — correct the voice provenance everywhere at once.** The recast is committed,
tested and verified loading in-browser, but every public surface still says the voices
are Kokoro-82M, which is no longer true of a single sample in the game. README, itch
description, promo page, outreach copy and the live store page have to change together,
and #42 (the AI Disclosure field) is the same decision wearing a different hat.


/home/menser/Dropbox/ai/code/finding_numbers

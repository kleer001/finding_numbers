stale

## Summary
The game is live at v1.2.0. Its story is the voice recast: synthesised digits replaced
with CC0 recordings of real people from Mozilla Common Voice, six languages up to ten,
one speaker per language reading all ten digits. Every repo surface, the store page and
every video asset agree.

The recast trailer is published and wired everywhere, and the wide community channels are
all sent and corrected. What is left is the narrow ones — two curator emails, three Shorts,
a gated Discord — plus a handful of design calls the author has to make.

## Todos

### Parallel — outreach still unsent
- [ ] #27 Pitch the curators, in reach × fit order — Alpha Beta Gamer, then Warp Door.
  One email each, bodies in `OUTREACH-COPY.md`. Both carry the trailer link. Alpha Beta
  Gamer takes its Game Submissions web form, not an address. Warp Door is
  `warpdoor@gmail.com`, and the Gmail connector here is **read-only** — it has no compose
  or draft scope, so the draft cannot be built from this side. Send it from a mail client.
- [ ] #6 Post the three `clips/out/*-9x16.mp4` verticals as Shorts on the channel that
  already hosts the trailer. Never the itch trailer slot: a 9:16 upload becomes a Short,
  and Shorts cannot be A/B tested.
- [ ] #37 Post to the Haunted PS1 Discord once initiation clears, copy in
  `OUTREACH-COPY.md`. Rule 15's disclosure names the code and text, not the voices — no
  generated audio ships. Rule 12 bans arguing the case for the tooling, which includes
  pointing at the human voices as a defence.

### Parallel — housekeeping
- [ ] #52 Decide what to do with the removed r/indiegames attempt at
  `reddit.com/r/indiegames/comments/1vrckj4/` — an image post whose body carried the store
  link, which is what automod removes. Invisible to the sub, no engagement. Deleting does
  not hide it from mod logs, so the only argument for it is tidiness.
- [ ] #32 Repost windows only — the listening pass is done, results in `## Context`.
  `r/WebGames` not before 2026-11-01, `r/playmygame` not before 2026-09-01, both recorded
  on the board `scratchpad/build_submit_links.py` builds.

### Follow-ons from the recast
- [ ] #43 `INTRO_MESSAGES` in `src/game/config.js` still carries station patter in
  languages the station no longer voices — `MUOVITI`/`ASCOLTA` (italian),
  `UGOKE`/`KIKE`/`HAJIME` (japanese), `CHALO`/`SUNO`/`SHURU` (hindi). Its own comment says
  the pool is "languages the station voices". Polish, turkish, arabic, welsh and georgian
  have no patter at all. Needs verified translations, and the shipped font renders accented
  Latin and Cyrillic but not Arabic or Georgian script.
- [ ] #44 Samples average **0.81s**, not the 1.08s `CADENCE_FLOOR` was tuned against
  (`src/game/levels.js`). RAPID's 600ms minimum therefore slurs the digits less than
  designed — the station comes apart more gently. The comment records the measured figure;
  the tuning is untouched. Decide whether to retune.

### Design calls — the author's to make
- [ ] #8 Badge garble is OFF. The approved profile had it on, but at severity 0.6 it rots
  the characters and destroys the hex notation (`5V 5▓` instead of `LV 28`). The notation
  shipped as the treatment instead.
- [ ] #24 The Critic's two open items from `REVIEW-LOG.md` Session 2: a room only moves on
  **re-entry**, so a careful player may never meet the mechanic; and `LV???` forever is
  authored, but nobody has reached it to say whether it reads as a statement.
- [ ] #10 `pickThemed` in `maze/cell.js` still resolves theme arrays, shadowed by
  `state.js` pre-resolving per room. Left alone deliberately — fixing it changes
  `makeCell`'s contract and rewrites a test asserting a real invariant, for no gain.
- [ ] #15 Decide who writes `GAME-SHEET.md` — the pitch should be the author's intent, and
  this repo has never had one. (The spec-sheet half is retired: studio 0.16.0 ends
  `SPEC-SHEET.md` entirely, and there is none here.)

## Context

**Posting to Reddit, learned the hard way.**
- **r/indiegames enforces Rule 1 far more narrowly than its text reads.** An image on the
  post is not enough. Automod requires the *post itself* to link to gameplay footage on
  YouTube, imgur (gifv) or gfycat, and removes any post carrying the store link in its
  body — within minutes. Its own instruction: "You can link to the app page/etc in the
  comments of the post." The shape that survives is a link post at footage, flair set, with
  the body copy and store link as the author's first comment. Reddit's pre-submit rule
  check flags the wrong shape before sending; that warning is worth believing.
- **Editing a live post needs an `Edit:` line** declaring what changed. Reddit cannot edit
  a *title*, so only a wrong title needs delete-and-repost — read what the title actually
  says before assuming it does.
- **Old Reddit is this account's default** (`in_redesign_beta` off server-side; the
  `redesign_optout` cookie alone will not override it). Old Reddit handles link posts,
  text posts, flair and comments fine. Only image-plus-body needs the redesign — and that
  is the shape r/indiegames removes anyway. Flipping the pref means restoring it after.

**What the launch posts brought back.** Eight posts, one human reply between them.
Scores: r/numberstations **13** (0.93), r/indiegames **6** (1.0), r/playmygame and
r/mazes 2, r/itchio and r/analoghorror 1, r/WebGames and r/IndieGaming **0** (0.5 — both
downvoted). The niche that knows the source material carried it; the broad game subs did
not. The link-post-plus-author-comment shape on r/indiegames worked — it stuck and scored.
The one human reply is u/Domx010 on r/IndieGaming pointing at r/LookWhatTheyBuilt: a
1.7k-subscriber builder-and-founder sub, not a player audience, so it is a courtesy lead
and not a channel. **Nobody said anything about the loop**, so the question the posts were
meant to answer — whether navigate-by-ear reads with the digit count off — is still open,
and reposting into the same subs will not answer it. It needs players who talk, which is
what the curator pitches and the Discord are for.

**Subagents share one browser.** Agents spawned with the Agent tool inherit the *same*
Playwright MCP instance as the parent. Dispatching browser-capable agents while holding an
open form navigates that page out from under you and loses unsaved state. Finish the
browser session first, or keep the agents off the browser.

**The itch store page.** Saving the edit form **rewrites every field**, so snapshot all
inputs before changing one and diff after — a field that loaded stale or empty writes that
emptiness back, and the save reports success either way. Validation is all-or-nothing: one
over-length field discards every other edit in the same save. The description lives in a
Redactor layer *and* a backing textarea; set both, then click `button.save_btn` (two match
— scope to `#dashboard_game_header_2870282_tabs`). The trailer is `game[video_url]`, which
takes a `youtube.com/watch?v=` link.

**AI disclosure, the standing constraint.** Never claim the game is hand-written: `git
blame` puts every line of `src/` and `tests/` in commits carrying a Claude co-author
trailer. The live store disclosure is **Code + Text** (`ai_disclosure[ai_code]`,
`ai_disclosure[ai_text]`); Sounds is *not* set, which is correct — no generated audio
ships since the recast. Disclose what the artifact contains, never volunteer a
code-provenance essay into promo copy, and never assert the opposite of either.

**Positioning, settled.** The register is dread, not terror or horror — the game holds
anticipation and never discharges it. "Liminal horror" and "analog horror" name a shelf
and are fair; bare "horror" must carry, within a line or two, that nothing chases you and
nothing can kill you. "Suspense" and "thriller" are ruled out: they promise stakes and a
clock the build does not have. Real station names and dial frequencies stay out of copy —
naming them promises audio this game does not have.

**Claims that keep creeping back in.**
- "More voices as you go" and "more of each level you can't trust" both cap at level 12:
  generated levels reuse `noise: {wash: 0.7, burst: 1}` verbatim, and `honestyCurve` hits
  its 0.5 coverage cap there. Compressing a qualified sentence drops the qualifier first,
  which is why `honest-copy` runs *after* a length pass, never before.
- The game **can** be played without sound: `SHOW NUMBERS` (`main.js:140`) draws the digit
  string and score, defaulting off (`main.js:52`). Copy says it is meant to be played with
  sound and that a display option exists — never that sound is required.
- A **second** wrong turn costs a digit: `score = depth - max(0, stray - 1)`
  (`progression.js:24`). The first stray is free, walking back restores it. So "you learn
  the route by what never arrives" is not the whole truth and must not be used — a mistake
  is audible.

**Copy tooling.** `.claude/skills/humanized-copy/check.py` measures reading grade, sentence
spread, bullet length and per-surface word budgets against `banned.md`; run `--fenced` for
`OUTREACH-COPY.md` (each block scored as its own post) and `--budget N` to gate. Budgets:
200 store, 150 post/email, 50 social, 25 caption, 80 README intro. Two blocks fail on
purpose: the r/playmygame template has a mandated 100-word minimum, and the v1.2.0 devlog
is long by design. `banned.md:60` bars `designed to <verb>` as brochure voice.

**The two generated boards each keep their own hardcoded channel list** —
`scratchpad/build_copy_page.py` and `scratchpad/build_submit_links.py`. A section named in
a list but missing from `OUTREACH-COPY.md` hard-exits that build; a section in the copy
file that a list does not name silently never reaches that board. Adding a channel means
editing **both** lists. Cards group by bucket string, and only consecutive runs group, so
insertion order is display order. `scratchpad/serve.py` serves both from the first free
port at 8300.

**Devlogs, mechanically.** New post at `itch.io/dashboard/game/<id>/new-devlog`; existing
posts edit at `itch.io/dashboard/post/<post_id>/edit`. The contenteditable is
`.redactor-layer`, **not** `.redactor-editor` — the latter matches nothing and silently
no-ops. `post[published]` defaults **unchecked**, so a plain Save creates a draft.

**If the voices are ever re-picked.** Corpus tarball is
`~/Downloads/1769605134856-cv-corpus-7.0-singleword.tar.gz` (3.77 GB, CC0). The current
set was built on rules learned after a clip labelled "three" shipped playing "four": a
single downvote disqualifies a clip (these are one-word recordings, so a downvote means it
is not the word claimed); one speaker per language, chosen from those who read all ten
digits uncontested; rank speakers by pace, not votes — mean distance from ~0.85s plus the
spread across their ten. Normalise by **RMS, not `loudnorm`** (EBU R128 gating wants ~3s;
these clips are 0.35–1.7s): target **-28.8 dB mean RMS, peaks under -8 dB**, the level
`drive.gain = 2.2` and `WASH_PEAK` were tuned against. German's zero reads as `nan` in the
TSV ("null" parsed as a null literal); Welsh zero is `sero`, not `dim`.

- Live: <https://kleer001.itch.io/finding-numbers> · game id `4800315` · upload `18598594`
- Trailer: <https://youtu.be/343tkOkHT0g> — package B's title and thumbnail are live, with
  A and C loaded against them as an A/B test on that video. The superseded synth cut stays
  public at `3_maIo0cYAk`; nothing points at it.
- Publish: `./package.sh` → `butler push dist/finding_numbers.zip kleer001/finding-numbers:html5`
  → verify `type=html`. `BUTLER_API_KEY` from `~/Dropbox/ai/code/itch_io_api_secret.txt`.
- `clips/` and `clips/out/` are gitignored, rebuilt by `./capture.sh <clip> clips/` then
  `./post.sh`. Retiming lives in the two tables at the top of `post.sh` — never re-record.
- Tests: 122, green.

## Next Step
**#27 — the curator emails, Alpha Beta Gamer then Warp Door.** Both bodies are final in
`OUTREACH-COPY.md` and both carry the trailer link, which resolves to the recast cut. The
wide community channels are all sent and corrected; what remains unsent is the two emails,
the three Shorts (#6), and the Discord post once initiation clears (#37).

/home/menser/Dropbox/ai/code/finding_numbers

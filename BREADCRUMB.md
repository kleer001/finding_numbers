fresh

## Summary
The store page, the landing page and the README now agree with the build and with each
other. A copy pass rewrote every public surface: the genre promise carries its own
disclaimer, the real-station framing is gone, headphone advice is gone, and everything
is cut to a length people will scan. Two new tools enforce it — a `humanized-copy` skill
here and in the studio at 0.6.0. What remains is posting, a pile of design calls that are
the author's, and eighteen unpushed commits.

## Todos

### Push first — nothing below is visible until this lands
- [ ] #28 `git push` in `finding_numbers` (18 commits) and `trace_rom_studio` (1).
  `promo.html` and `README.md` are GitHub Pages surfaces: the removed frequencies
  section, the extracted fonts/images and the 1977 section are committed but not live.
  The itch store page is already live and does not depend on this.

### Parallel
- [ ] #23 Sign the release gate in `REVIEW-LOG.md`. Both things holding it open are
  resolved: the page copy matches the build, and the media no longer shows the player
  anything the game does not do.
- [ ] #4 Post to the genre communities. Paste-ready copy per channel is in
  `OUTREACH-COPY.md`: `r/WebGames`, `r/itchio`, `r/playmygame`, `r/analoghorror`,
  `r/numberstations`, itch's Release Announcements board. Comment somewhere before
  posting a link — Reddit's site-wide filter shadowbans accounts whose first posts are
  links, and a shadowbanned post looks exactly like one nobody upvoted.
- [ ] #5 Devlog with `clips/out/core-loop.gif` and `pulse.gif`. Copy is written and
  deliberately teases rather than explains: it names the four-bit counter and stops.
- [ ] #6 Post the three `clips/out/*-9x16.mp4` verticals. Never the itch trailer slot.
- [ ] #27 Pitch the curators — Warp Door, Free Game Planet, Alpha Beta Gamer,
  ManlyBadassHero. One email each, bodies in `OUTREACH-COPY.md`.
- [ ] #29 The itch banner still reads `FINDING NUMBERS` in caps while the title is now
  `finding_numbers`. It is `docs/img/banner.png` in the page theme, a separate asset the
  title change did not touch. Needs a re-render to match.
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
- [ ] #20 Work through the studio directives and then
  `python3 ../trace_rom_studio/scripts/check_updates.py . --mark-read`. The pin is
  `0.1.0`; the studio is now `0.6.0`, so eight directives are outstanding — including the
  two written this session, which this repo already satisfies.
- [ ] #17 Rule on test naming: `*.test.mjs` here vs `*.test.js` in the studio. **Both**
  `package.json` files are `"type": "module"`, so `.mjs` buys nothing. 21 renames plus the
  `package.json` glob.
- [ ] #15 Decide who writes `GAME-SHEET.md` and `SPEC-SHEET.md` — a spec precise enough to
  implement from is reverse-engineering; the pitch should be the author's intent.
- [ ] #16 Rule on the studio 0.2.0 compositor directive. Recommendation: adopt for new
  passes only, don't rewrite the working frame loop. Already partly moved —
  `render/chargrid.js` owns glyph placement and `drawGlitch` runs as an ordered pass.

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

**Studio 0.6.0** (`c750644`) ships the skill in `template/.claude/skills/` and a
no-inline-binary rule in `CLAUDE.md` § Code conventions. The template's own `promo.html`
was fixed in the same commit — it carried three inlined font subsets, which also defeated
their own `unicode-range` split.

- Live: <https://kleer001.itch.io/finding-numbers> · game id `4800315` · upload `18598594`
- Trailer: <https://youtu.be/3_maIo0cYAk> · thumbnail `clips/out/thumbs/A-dont-trust-the-walls.png`
- Publish: `./package.sh` → `butler push dist/finding_numbers.zip kleer001/finding-numbers:html5`
  → verify `type=html`. `BUTLER_API_KEY` from `~/Dropbox/ai/code/itch_io_api_secret.txt`.
- `clips/` and `clips/out/` are gitignored, rebuilt by `./capture.sh <clip> clips/` then
  `./post.sh`. Retiming lives in the two tables at the top of `post.sh` — never re-record.
- Copy review page: `scratchpad/build_copy_page.py` regenerates `copy-review.html` from the
  source files; `serve.py` serves it on the first free port from 8300.
- Tests: 117, green.

## Next Step
Push both repos (#28). Eighteen commits of landing-page and README work — the removed
frequencies section, the extracted assets, the 1977 section — are committed but invisible
until they reach GitHub Pages.

/home/menser/Dropbox/ai/code/finding_numbers

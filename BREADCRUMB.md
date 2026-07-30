fresh

## Summary
The live page now matches the build it serves: description, trailer and thumbnail are all
cut from the current game. What is left is promotion that needs a human at the machine,
one uncommitted pile of documentation, and a set of design calls that are the author's to
make rather than anyone else's to guess.

## Todos

### Commit first — everything below assumes this landed
- [ ] #25 Commit the working tree in both repos, as atomic commits.
  `finding_numbers`: `ITCH-PAGE.md`, `MARKETING-PLAN.md`, `itch_publish_howto.md`,
  `promo-room-moved.html`, `video_shot_list.md`.
  `trace_rom_studio`: `CLAUDE.md`, `template/PUBLISHING-RUNBOOK.md`, `template/README.md`,
  plus new `template/capture.sh`, `template/post.sh`, `template/video_shot_list.md`.
  **Leave `trash_treasure/` alone** — separate in-progress work, not part of this.

### Parallel
- [ ] #23 Sign the release gate in `REVIEW-LOG.md`. Both things holding it open are
  resolved: the page copy matches the build, and the media no longer shows the player
  anything the game does not do.
- [ ] #26 Re-capture the four itch screenshots (`docs/img/gameplay.png`, `jukebox.png`,
  `light-mode.png`, `preferences.png`). They predate `SHOW NUMBERS` defaulting off, the
  canvas filling the viewport, and the 13-row preferences panel — `preferences.png` in
  particular still shows `LEVEL` and `SOUND TEST`, rows the build no longer has.
- [ ] #4 Post the core-loop clip to the genre communities now named in
  `MARKETING-PLAN.md`. Open at launch: `r/WebGames`, `r/itchio`, `r/playmygame`,
  `r/analoghorror`, `r/numberstations`, and itch's Release Announcements board.
  Comment somewhere before posting a link — Reddit's site-wide filter shadowbans
  accounts whose first posts are links, and a shadowbanned post looks exactly like one
  nobody upvoted.
- [ ] #5 Devlog with `clips/out/core-loop.gif` and `pulse.gif`. Descriptions take images,
  not video, so GIFs are the only in-page motion.
- [ ] #6 Post the three `clips/out/*-9x16.mp4` verticals to short-video feeds. Never the
  itch trailer slot.
- [ ] #27 Pitch the curators named in `MARKETING-PLAN.md` — Warp Door is the closest
  editorial match this game has. One email each, then move on.

### Design calls — the author's to make
- [ ] #8 Badge garble is OFF. The approved profile had it on, but at severity 0.6 it rots
  the characters and destroys the hex notation (`5V 5▓` instead of `LV 28`). The notation
  shipped as the treatment instead.
- [ ] #9 The readout-overrun effect is invisible to the default player, who sees `kHz`.
  Corrupting the frequency field would reach everyone. The change is small and located:
  `src/render/render.js:53-59`, the `else` branch that draws the dial, using the existing
  severity ramp.
- [ ] #24 The Critic's two open items from `REVIEW-LOG.md` Session 2: a room only moves on
  **re-entry**, so a careful player may never meet the mechanic the store page leads with;
  and `LV???` forever is authored now, but nobody has reached it to say whether it reads
  as a statement.
- [ ] #10 `pickThemed` in `maze/cell.js` still resolves theme arrays, shadowed now that
  `state.js` pre-resolves per room. Left alone deliberately — fixing it changes
  `makeCell`'s contract and rewrites a test asserting a real invariant, for no
  behavioural gain.

### Studio paperwork — reaches no player
- [ ] #17 Rule on test naming: `*.test.mjs` here vs `*.test.js` in the studio. Now a cheap
  call — **both** `package.json` files are `"type": "module"`, so `.mjs` buys nothing.
  21 renames plus the `package.json` glob.
- [ ] #15 Decide who writes `GAME-SHEET.md` and `SPEC-SHEET.md` — a spec precise enough to
  implement from is reverse-engineering; the pitch should be the author's intent.
- [ ] #16 Rule on the studio 0.2.0 compositor directive. Recommendation: adopt for new
  passes only, don't rewrite the working frame loop. Already partly moved —
  `render/chargrid.js` owns glyph placement and `drawGlitch` runs as an ordered pass
  inside `render()`.
- [ ] #20 (needs: #16) `python3 ../trace_rom_studio/scripts/check_updates.py . --mark-read`
  to advance the pin from 0.1.0 once the directives are resolved.

## Context

**The live page and the build agree.** Upload `18598594`, `type=html`, channel `html5`.
Description reads 16 levels. Tagline is 117 of 120 characters — an over-length tagline
rejects the form and discards the description edit with it, so check it before any save.
Saving the itch form rewrites *every* field.

**Publishing.** `./package.sh` → `butler push dist/finding_numbers.zip
kleer001/finding-numbers:html5` → verify `type=html`. No dashboard, no flag re-ticking.
`BUTLER_API_KEY` from `~/Dropbox/ai/code/itch_io_api_secret.txt`, read into an env var,
never echoed. Verify read-only:

```sh
KEY=$(tr -d '\n\r' < ~/Dropbox/ai/code/itch_io_api_secret.txt)
curl -sS "https://itch.io/api/1/$KEY/game/4800315/uploads"
```

**itch's server-side API is read-only** — six GET endpoints, confirmed from their docs.
Page furniture (description, tagline, trailer URL, screenshots) is dashboard-only, and the
dashboard needs a logged-in browser session. The API key does not create one.

**YouTube cannot swap a file on an existing upload** — *"You can't replace a video. Any
new video you upload to YouTube will get a new URL."* A corrected trailer is always a new
video, so the itch trailer field and any doc references have to be re-pointed with it, and
any A/B test on the old upload ends. Trimming in place is possible and keeps the URL.

- Live: <https://kleer001.itch.io/finding-numbers> · game id `4800315`
- Trailer: <https://youtu.be/3_maIo0cYAk> (public). The prior trailer `B6LhrtK0SJs` is
  unlisted, not deleted, so old links still resolve.
- Channel `UCRdSB9siERP-3YqT0aMMRbQ`. Thumbnail in use is
  `clips/out/thumbs/A-dont-trust-the-walls.png`.

**Judging promo material.** The test that matters is whether a clip shows the player
something the build no longer does — footage of a removed preferences row is a false
claim in a way an older maze layout is not. `title`, `core-loop`, `wrong-turn`,
`room-moved`, `pulse` and `jukebox` all pass that test. `crt-decay` failed it (the old
panel had `LEVEL` and `SOUND TEST` on camera) and was re-shot.

- `clips/` and `clips/out/` are gitignored, rebuilt by `./capture.sh <clip> clips/` then
  `./post.sh`. `capture.sh` writes a timestamped file that must be renamed to the clip
  name before `post.sh` will pick it up. Superseded takes go in `clips/prev-<reason>/`.
- Retiming lives in the two tables at the top of `post.sh` — retime there, never re-record.
- `capture.sh` opens a visible Chrome on `DISPLAY=:0` and records it with system audio, so
  a run takes over the desktop and records whatever the machine is playing.

**Reddit gates worth knowing.** `r/LiminalSpace` bans self-promotion outright *and* bans
edited text in images, which every screenshot of this game has — it is closed, not hard.
`r/HorrorGames` was ruled out on audience fit: its top posts of the year are actual-horror,
not liminal. Check a sub's top-of-year before paying any tenure gate.

- Pinned to `../trace_rom_studio` at `0.1.0`; studio is at `0.5.0`. Directives are
  proposals to raise, never auto-applied.
- Two dev-only labs at repo root, not shipped: `glitch-lab.html` (preset `★ CHOSEN` is
  what shipped) and `gap-lab.html` (where 390/780 ms came from).
- `.claude/skills/honest-copy/` audits public-facing copy against the build. Run it before
  anything reaches an audience.
- Tests: 117, green.

## Next Step
Commit the working tree in both repos (#25). Ten files of documentation and three new
studio template scripts exist only in the working tree right now, and every other task
is easier to reason about once they are in history.

/home/menser/Dropbox/ai/code/finding_numbers

# REVIEW-LOG — finding_numbers

The panel's memory. Each persona keeps notes here across the game's life, in their
own voice, so later gates can measure the game against its own promises.

**What this log is, exactly.** Four personas, one author. The panel is voiced
rather than polled: the disagreements recorded below are real disagreements between
the positions, but they are not four independent judgements, and a verdict here
carries no more evidence than the reasoning printed beside it. Where a claim is
checkable it is checked and sourced; where it is taste it says so. Decisions get
made off this log, so the distinction is load-bearing.

**Baseline note.** The panel was first convened after the game was already
playable and published. There are no design-time or MVP notes to reread, and the
anti-fabrication rule forbids inventing them. Session 1 below is therefore a
*post-release* read that serves double duty: it is the baseline every later gate
measures against, and it is the release-gate review that was never held. Session 2
should reread it and report whether it held up.

---

## Session 1 — Post-release panel review · baseline

Date: 2026-07-29 — reviewed against the live build at level 1, level 20, and the
generated tail; `npm test`, the shipped `dist/finding_numbers.zip`, the README,
and the itch.io page description.

### The Shipper

**First read.** It shipped. Three thousand lines of source, a thousand lines of
tests, no build step, no engine, one developer — and it is on itch with a cover,
screenshots, and a trailer. That is the hard part and it is done. The core loop
names itself in one sentence: *take a turn, listen for whether the count went up,
repeat until you reach the source.* Time-to-fun is good — splash, one key, and
you are walking. The maze being faked (cells built on entry, only depth and stray
are real state) is the single smartest decision in the codebase; it is why a
32-level game fits in 3k lines.

Four things I would have caught before the page went live:

1. **CI has been red, and the release checklist says it must be green.**
   `tests/station-noise.test.mjs` imports the `node-web-audio-api` devDependency,
   but `.github/workflows/test.yml` never installs dependencies — its comment
   claims "No dependencies to install." Every push fails. A fresh `git clone`
   fails the same way: 76 tests run, 1 fails. It passes locally only because
   `node_modules/` is already there. One `npm ci` step fixes both.
2. **The dev-server heartbeat ships to players.** `src/main.js` fires
   `fetch(location.href, {method:'HEAD'})` every 2 s, unconditionally, and it is
   in the uploaded zip. On itch that is ~1800 requests an hour against the CDN per
   player, on their data and their battery, to detect a dev server that isn't
   there. Gate it to `localhost` or drop it from the packaged build.
3. **The canvas never scales up.** It is a fixed 800×600 with only `max-width`
   caps. On a 1586×1173 viewport the game occupies a quarter of the screen and
   the rest is void. For a game whose whole argument is *the screen is a monitor
   you are trapped inside*, that void is doing real damage.
4. **The tail is one level repeated twenty times.** Levels 13–32 are generated
   from a single spec that varies in exactly two ways: message length (11→30
   digits) and wall glyph. Language, doors, cadence, noise, corridor odds and
   corridor width are all frozen. That is not a difficulty curve, it is the same
   room with a longer number in it.

**Cut list.** The heartbeat, and levels 20–32. Twelve authored levels plus a
generated tail of six would lose nothing a player can feel and would let the
honesty curve reach its floor while the content is still changing.

**Watching for at MVP/next gate.** Whether the CI item is actually green rather
than believed green; whether the packaged zip differs from the dev tree in the
ways it should; whether anything was added to levels 13–32 besides digits.

### The Critic

**First read.** This one is about *being counted by something that does not care
whether you arrive.* And — rarely — the mechanics say it rather than decorating
around it. There is no damage, no death, no fail state, no timer. The only thing
the game can do to you is **stop acknowledging you**. Walk wrong and nothing
buzzes, nothing reddens; a number simply never arrives. Walk wrong enough and the
readout empties and the station goes silent, and you are alone in a hiss with no
way to orient. That is a real argument made in systems, not in flavor text, and I
did not expect to find one here.

The room that moves its exit after you have wandered is the same argument
sharpened: the station's answer changes *because you doubted it.* I confirmed it
in play at level 20 — correct door W on first entry, W→N after a single wrong turn
and walk-back, score unchanged the whole time. Cruel, coherent, exactly right.

Three places it doesn't cohere:

1. **The default preferences throw the thesis away.** `SHOW NUMBERS` ships ON,
   which prints the captured digits and `10 / 18` on the HUD. With that on, "did
   the voice acknowledge me" becomes "read an integer off a status bar," and the
   entire WebAudio station — the best thing in the game — is wallpaper. The game
   is *about* listening and its default configuration tells you not to. Ship it
   OFF, or make the first level teach the ear and then turn it off itself.
2. **The signature mechanic is gated behind playing badly.** A room only moves on
   *re-entry*, and you only re-enter after a wrong turn or a retreat. A careful
   player never sees the thing the store page leads with.
3. **There is no ending.** `commitWin` clamps with `Math.min(level + 1, 32)`, so
   finishing level 32 — thirty random digits in six languages — drops you into
   level 32 again. That reads as a clamp, not as an authored decision. Either
   commit to it (a held black screen, a station that keeps counting, *something*
   that says the loop is the point) or write an ending. Right now the game's last
   statement is an off-by-one.

**The one change.** `SHOW NUMBERS` off by default. Everything else here is
argument; that one line is the argument.

**Watching for at the next gate.** Whether the count is still on by default;
whether level 32 ends or clamps; whether an ordinary careful player ever
encounters a room that lies.

### The Archivist

**First read.** The lineage is honest and the game is in good company. Each
attribution below was checked against a primary source rather than recalled.

- **Hunt the Wumpus** (Gregory Yob, 1973) — the direct ancestor nobody credits.
  Its caves are the vertices of a dodecahedron, and on entering an empty one the
  game reports whether you can *smell a Wumpus, hear a bat, or feel a draft from
  a pit* in a connected cave. That is this game's loop exactly: a hidden graph
  navigated by indirect sensory report. finding_numbers moves the sense into the
  ear and fakes the graph behind you.
  ([Wikipedia](https://en.wikipedia.org/wiki/Hunt_the_Wumpus))
- **Rogue** (Michael Toy and Glenn Wichman, 1980) for the `@` on a character
  grid; this game earns it by staying genuinely text-mode rather than drawing
  pixel art and calling it ASCII.
  ([Wikipedia](https://en.wikipedia.org/wiki/Rogue_(video_game)))
- **P.T.** (Kojima Productions as "7780s Studios", 12 August 2014) for the
  L-shaped hallway that appears to loop — the trick `maze/cell.js` is running,
  and the reason the maze can be faked at all.
  ([Wikipedia](https://en.wikipedia.org/wiki/P.T._(video_game)))
- **Papa Sangre** (Somethin' Else, December 2010) for navigation by ear as the
  entire interface — its developers called it "a video game with no video,"
  rendered exclusively in binaural sound.
  ([Wikipedia](https://en.wikipedia.org/wiki/Papa_Sangre))
- **Signalis** (rose-engine — Yuri Stern and Barbara Wittmann — 27 October 2022)
  for number-station transmissions used as horror texture in a game.
  ([Wikipedia](https://en.wikipedia.org/wiki/Signalis))

Verdict: a new *combination* rather than a reinvention — the inference loop of a
1973 cave crawler carried on a number-station soundscape. Whether anyone has done
precisely that before is not something this review can establish, and it does not
need to: the parts are old and well understood, and the join is the work.

**Fact-check — the dial.** `STATION_FREQS` in `src/game/config.js` claims fifteen
real frequencies, and the README and itch page both promise "frequencies that
really broadcast into the dark." Thirteen check out against Priyom and Wikipedia:

- UVB-76 "The Buzzer" **4625** ✓
- Lincolnshire Poacher E03 **11545** ✓ (Voice of Korea later occupied it)
- HM01 **11530** ✓; V02a **7887** ✓ (consistent with logged Cuban schedules)
- Yosemite Sam **3700 / 4300 / 6500 / 10500** ✓ (all four, SSB)
- The Pip S30 **5448** day / **3756** night ✓
- The Goose **4310** day / **3243** night ✓
- The Squeaky Wheel S32 **5367** ✓ (current daytime voice frequency)

Two do not: **3895** and **6125** are attributed in the source comment to the
Squeaky Wheel (S32), and I can find no support for either. S32's documented
frequencies are 5367 / 3363.5 (current), 5473 / 3828 (earlier), with 3650, 3815,
5474, 5641 and 4201 also observed. 6125 is an international *broadcast* channel,
not a numbers station. Either swap them for documented S32 frequencies or drop
the attribution from the comment — the anti-fabrication rule runs to code
comments as surely as to the store page.

**Fact-check — the store page.** "Walls that tell you how deep you are — brick
near the surface, then dressed stone…" is true for levels 1–9 only. From level 10
on, `wallFor()` returns a *mix* and a level-20 room can be built entirely of the
level-1 brick; I photographed one. Likewise "more doors the deeper you go" stops
being true at level 7, where `forwardDoors` reaches 3 and stays there for the
remaining 25 levels. Neither is a lie, but both are claims the tail does not keep.

**Watching for at the next gate.** The two unsourced kHz values; whether the wall
and door claims on the page get narrowed to what the tail actually does.

### The Superfan · genre: liminal / analog horror (the itch.io browser-horror scene)

**First read.** This is *exactly* my shelf — the tag list on the page (Atmospheric,
Audio, Experimental, Liminal space, Psychological Horror, Soundtoy) is the shelf
written out, and it is not overselling. It is free, it is in the browser, it runs
in one click, and it has a *voice*. The neighbours I would shelve it beside are
**No Players Online**, **Anemoiapolis**, **Voices of the Void**, **Iron Lung** and
the Klubnika shorts — small, strange, systems-first, mostly one person. Read that
list as a scene impression, not a verified claim: unlike the Archivist's lineage
above, no attribution or date here has been checked, and it is offered as taste.
It will do well there.

What the scene will love:

- **The whole game is a diegetic instrument.** The HUD spectrogram is the actual
  FFT of the actual mix. The dial frequencies are real stations. That kind of
  "everything on screen is really doing the thing" is the exact currency of this
  community, and people will screenshot it.
- **Jukebox mode.** Underrated. Half this scene wants an ambient generator more
  than they want a game, and this one ships with a tunable number-station toy
  attached. That is the feature that gets it posted in Discords by people who
  never finished level 3.
- **The withheld-acknowledgement punishment.** Nobody does no-fail-state horror
  well. This does.

Where they will bounce, and I say this as someone who wants it to win:

- **The level select is unlocked from the start, sitting between JUKEBOX and
  TONE.** Anyone who opens preferences in the first minute — and in this scene
  everyone opens preferences, we are all CRT-shader people — can dial straight to
  32. There goes the descent. Gate it behind a completion, or hide it.
- **There is no way home.** No restart, no return to title, no level restart. Get
  hopelessly lost with the readout at zero and your options are the level-select
  or F5. That is the one place the "no fail state" purity turns into a soft-lock,
  and it is where streamers will quit on camera.
- **Level 32 asks for 30 random digits across six languages at RAPID cadence.**
  That is a ~70-second readout pass per room and 30 rooms. With SHOW NUMBERS off
  it is not hard, it is *impossible*; with it on it is a spreadsheet. There is no
  setting at which the deep tail is the game the first three levels promised.
- **Where's the mastery?** Real talk: past hour one there is nothing to get better
  at. No routing, no build, no leaderboard, no seed sharing — and the game already
  has seeded reproducible mazes (`?seed=`) sitting right there. Surface the seed
  in the HUD and let people trade them and you have a speedrun scene for free.

**Prediction.** Strong reception, short tail. It gets posted, played for twenty
minutes, praised for the sound, and shelved around level 8 — and a meaningful
slice of the audience will keep the jukebox open afterward. Nobody finishes 32.

**Watching for at the next gate.** Seed sharing; a locked level select; whether
anything is added past level 12 to chew on.

---

## Panel synthesis — where they disagree

The friction, stated plainly rather than averaged away:

- **Critic vs. Superfan on `SHOW NUMBERS`.** The Critic wants it off by default
  because the count on the HUD dissolves the game's only real idea. The Superfan
  says off-by-default makes the deep levels unplayable and players will quit
  before they ever reach the moment the Critic is protecting. *Both are right, and
  they are right about different levels.* The resolution neither of them will
  propose: the default should change with depth, or the deep levels should be
  short enough to hold in the ear.
- **Shipper vs. Critic on the tail.** The Shipper wants levels 20–32 cut. The
  Critic doesn't defend them but notes the ending problem lives at 32; cutting to
  20 does not fix a clamp, it moves it. Cut *and* author the ending, or neither.
- **Superfan vs. Shipper on the level select.** The Superfan wants it locked to
  protect the descent; the Shipper points out it is currently the only escape
  from a lost run and locking it without adding a restart makes the soft-lock
  worse. Restart first, then lock.
- **Archivist vs. everyone on scope.** He is right that 3895 and 6125 are
  unsourced and right that it is a fifteen-character fix. He would also happily
  spend the session on Wumpus. Take the fix, decline the tangent.

## Retroactive release-gate checklist

Run against the current `main` and the shipped zip, with what the panel found:

- [x] Runs clean from a fresh clone (`./run.sh`, no console errors) — verified; the
      only console message is the expected WebAudio autoplay warning.
- [ ] `npm test` green, and CI green on the release commit — **fails.** Green in a
      working tree with `node_modules/`; red on a fresh clone and red in CI, for
      the same missing `npm ci`.
- [ ] No fabricated history or specs anywhere — **two unsourced frequencies**
      (3895, 6125) attributed to S32 in `config.js`; two store-page claims (wall
      progression, "more doors") that the generated tail does not keep.
- [x] `LICENSE` present; attribution for any borrowed assets — MIT, with
      CRTFilterWebGL and `voice_loom` credited in both README and store page.
- [x] Promo material finalized — cover, five screenshots, trailer, and a
      paste-ready description all exist and match the build.
- [x] Budded to its own repo.

- [ ] **Release gate cleared** — not cleared. The game is live and the panel is not
      asking for it to come down; the two open items above are what a Session 2
      should close.

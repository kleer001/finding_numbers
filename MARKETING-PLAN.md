# MARKETING-PLAN — finding_numbers

How this game finds its players. The anti-fabrication rule covers marketing: nothing
here may claim something the build does not do. Run `.claude/skills/honest-copy` over
any copy before it reaches an audience.

## Positioning

- **One line:** finding_numbers is a liminal horror maze you navigate by ear, where a
  shortwave number station is the only compass and some rooms move their exit.
- **What it's actually about:** being counted by something that does not care whether
  you arrive. There is no death, no timer and no fail state — the only thing the game
  can do to you is stop acknowledging you. Take a wrong turn and nothing buzzes;
  a number simply never comes. Wander far enough and the readout empties and you are
  alone in a hiss with no way to orient. That is the hook, and it is a systems hook
  rather than a flavour one.
- **Genre & audience:** the itch.io free-browser-horror scene — players who follow
  small, strange, systems-first horror made by one person, and who will try anything
  that runs in one click. Not "horror players" in general: specifically the people who
  are in a Discord for this, who already own a CRT shader opinion.
- **Nearest comparables:** *Hunt the Wumpus* (1973) is the honest mechanical ancestor —
  a hidden room graph navigated by indirect sensory report — carried on a *Conet
  Project* soundscape. For players who won't know Wumpus: navigation by instrument
  rather than by sight, the way *Iron Lung* does it, with a number station instead of
  a sonar. Lineage is sourced in `REVIEW-LOG.md`; don't invent new comparables without
  checking them.

## The three pillars

Each has to be demonstrable in a clip or a screenshot.

1. **The station is the compass.** A correct turn adds a number to the broadcast; a
   wrong one adds nothing. No red flash, no buzzer — you learn by what never arrives.
   *Demonstrable:* a clip where a wrong turn produces silence.
2. **Rooms that lie, but not all of them.** Most of the maze holds still and can be
   learned. Some stretches move their exit a few times before settling — and only after
   you have doubted them, since a room changes on re-entry.
   *Demonstrable:* `clips/room-moved.mp4`.
3. **A station of its own.** The whole thing is WebAudio — spoken digits in six
   languages over a brown-noise dread that circles the signal without swallowing it.
   A tribute, not a recording, and copy says so rather than naming real stations:
   naming them promises audio this game does not have. Jukebox mode ships it as a
   standalone toy.
   *Demonstrable:* `clips/jukebox.mp4` and the live spectrogram in the HUD.

## Assets

- [x] Cover image, 630×500 (`docs/img/cover.png`)
- [x] Four screenshots of the current build (`docs/img/`) — 800×600, the canvas's native
      buffer, showing the defaults a new player meets
- [x] One animated GIF of the core loop (`clips/out/core-loop.gif`)
- [x] Trailer hosted: <https://youtu.be/3_maIo0cYAk> — cut from the current build
- [ ] Three title variants testing *different* hypotheses, plus three 1280×720
      thumbnails (`clips/out/thumbs/`), for YouTube Test & Compare
- [x] `promo.html` landing page
- [x] `ITCH-PAGE.md` finalized; description source is `itch_page_description.md`
- [x] Social share card, 1200×630 (`docs/img/share-card.png`), wired as `og:image` in
      `promo.html` alongside the rest of the Open Graph block

`clips/` and `clips/out/` are gitignored and rebuilt by `./capture.sh <clip>` then
`./post.sh`. The screenshots are captured from a browser at the native buffer size; a
browser whose device pixel ratio is not 1 paints the canvas at a fraction of its CSS
box, so size the window until the canvas's device pixels equal 800×600 and crop, rather
than scaling a mismatched capture back up.

## Channels

Paste-ready copy for every channel below lives in `OUTREACH-COPY.md`.

The store page is home base; the rest is where this specific scene gathers. Read each
community's self-promotion rules before posting — the gates below run from wide open to a
flat ban. Check fit before gate: read a sub's top posts of the year and ask whether that
audience wants *this*, because a sub can be on-genre by name and off-genre by taste.

- **itch.io** — devlogs enabled. The devlog is the only surface that takes images
  inline, so GIFs are the only in-page motion.
- **Genre communities** — grouped by gate, because the gate decides *when* a channel can
  be used, not just how. None of these runs a weekly dev-promo thread, so nothing here is
  thread-only. Everything still listed is postable at launch; what came off the list came
  off on audience fit and standing policy, not on effort.

  *Open — postable at launch, format permitting:*
  - `r/WebGames` (~140k) — the best structural fit there is. Direct link to the game
    itself, free, no signup wall, and the title must *begin* with the game's name;
    `[HORROR]` and `[HTML5]` tags may precede it. No repost inside three months. No rule
    against devs posting their own work, and no stated karma or account-age minimum.
  - `r/itchio` (~56k) — devs post their own pages all day; the only rules are no NSFW and
    a support-ticket ID for account complaints. No sidebar gate.
  - `r/playmygame` (~136k) — flair is required (`[Web]` / `PC (Web)`), the game must be
    free and playable *now*, its link comes before any other link, you must be on the dev
    team, horror must be NSFW-flagged, one post per game per month. The pinned warning is
    the real hazard and it is site-wide, not local: Reddit's own filter shadowbans accounts
    whose first posts are links, so the posting account needs ordinary comment history
    before it drops a link. A shadowbanned post is indistinguishable from one nobody upvoted.
  - `r/analoghorror` (~63k) — permissive, confirmed: the sidebar invites people to share
    their projects and the only promo rule bans *stealth* promo, so own the post rather
    than "finding" it. A plain description is enough; no karma or tenure gate is stated.
    Temper the expectation — the feed is video series, and game posts land but score in
    single digits where series work scores in the hundreds. Reach, not conversion.
  - `r/numberstations` (~18k) — small, slow, and the people who know the real stations.
    The only rules cover unrelated and unproven content; no self-promo rule is stated, and
    a hobbyist's own number-station app has been posted there without trouble.
  - itch.io's **Release Announcements** board (`itch.io/board/10022/release-announcements`)
    — "announce and promote your own projects here". A post needs the page link, a summary
    and at least one embedded image or video.

  *Ruled out — the audience is wrong, not the gate:*
  - `r/HorrorGames` (~82k) — cut deliberately, and not because of its rule 4 (three months
    as an active member, nine comments or submissions per self-promotion post, manual
    approval). Its top posts over a year are actual-horror — monsters, gore, jump scares —
    not liminal horror. Three months of earned participation would buy a post to people who
    came for a different genre. Read the top of the year before paying a tenure gate: a
    subreddit's name and size say less about fit than what its audience actually upvotes.
  - `r/LiminalSpace` (1.1M) — the tempting one, and taste-matched, but self-promotion is
    banned outright and images may not contain people, creatures or edited text. Aesthetic
    overlap is not a channel.

  *Rule not verified — behind a join gate:*
  - **Haunted PS1** Discord (`discord.gg/YpBQZdeXxP`, ~5k members, ~1.8k online) — the
    lo-fi horror dev scene, and the host of the Demo Disc and Madvent jams on itch. Its
    posting rules are only readable from inside, so join and read before promoting.
  - **Priyom** (`priyom.org`; Discord `discord.gg/788JPdSgsd`, bridged to `#priyom` on
    Libera IRC) — shortwave monitors, not players. Not a promo channel under any gate:
    this is where the dial gets checked before copy ships, per the honesty guardrails.
- **Fediverse / Bluesky** — `#gamedev`, `#screenshotsaturday`, horror and liminal tags;
  post the GIF, not a link.
- **Short video** — the three `clips/out/*-9x16.mp4` verticals. Never the itch trailer
  slot: a 9:16 cut uploads as a Short, and Shorts cannot be A/B tested.
- **Curators / streamers** — all open, all cold pitches; none has a queue you can jump, so
  send once and move on. Ranked by reach × fit, where fit means what an outlet has
  actually published lately, not what it says it covers. A name carrying no figures is
  unchecked rather than approved.
  - **Alpha Beta Gamer** (`alphabetagamer.com`) — free browser games and demos, via the
    "Game Submissions" contact page. Format is a short write-up plus a play-through video of one
    small game, no endings or story required, and its beat includes liminal-space and
    analog horror. Pitch it for the video: the
    audience is on the channel, not the site.
    *862K subs, median ~23K views a video (2026-08-10).*
  - **Warp Door** (`warpdoor.com`) — art games and short strange ones, credited to their
    makers; a recent post is "a short walk through a large structure". The best fit this
    game has anywhere and the least reach behind it, which is the trade. Pitch it anyway —
    it is the one most likely to actually cover this. `warpdoor@gmail.com`, Bluesky
    `@warpdoor.com`. *2.3K followers, median 11 likes a post (2026-08-10).*

  No character, no plot, no endings to collect. Anything whose format runs on those has
  nothing to make from this game however large its audience, and is not a near miss.
  - **Jupiter Hadley** (`@JupiterHadley`) — plays *every* entry in the jams she covers,
    which is the way in: enter a jam she is covering rather than pitch a released game.
    Small channel; treat it as coverage, not reach.
  - **Game Devs x Streamers** Discord (`discord.gg/7wtAVM6`, ~3.8k members) — the server
    `r/playmygame` points devs at, for matching games to streamers. Rules behind the join
    gate: not verified.

## Launch beats

The page is already live, so the pre-launch beat is spent. What remains:

- **Re-launch the current build:** package, upload, verify the API reports `type=html`
  and a matching size, refresh screenshots, then post. Posting before this advertises a
  game that is not the one live.
- **Devlog:** say there is something to find without saying what it is. The counter is a
  four-bit field and sixteen is the most it can hold; that fact is the whole tease. Name
  no threshold and no effect — what happens past the sixteenth level is for players to
  find, and neither the store copy nor a devlog answers it.
- **Post-launch:** note which channel actually brought players, and fold what they say
  about navigating by ear into the next pass.

## Honesty guardrails

- Every factual claim — frequencies, station names, lineage — is checked against a
  primary source. Two dial frequencies were once attributed to a station with no
  source and had to be corrected; the audience for this game contains people who know
  the real stations better than we do.
- No superlatives the game can't earn. No "first", no "only".
- **The genre label carries a contract.** There is no enemy, no chase, no death, no
  timer and no fail state anywhere in `src/`. "Liminal horror" and "analog horror" name
  a shelf and are fair; bare "horror" promises a threat, so every surface that uses it
  says early that nothing chases you and nothing can kill you. "Suspense" and "thriller"
  are ruled out entirely — they promise stakes and a clock the game does not have. The
  register is dread, which is anticipation; the copy never sells a scare.
- The copy speaks to the genre without promising depth that is not there: this is a
  short strange thing, not a 40-hour game, and the store page should not imply one.
- Claims about progression get re-checked against the build whenever levels change —
  "each level wears its own walls" and "more doors the deeper you go" were both true
  of the authored levels and false of the generated tail.

## What to watch

- Whether players find the navigate-by-ear loop legible without the on-screen numbers,
  now that those default to off. This is the biggest open question in the design and
  the one player feedback can actually answer.
- Whether anyone reaches level 17 and reports the overflow, and whether they read it as
  intentional or as a bug.
- Which channel produced plays, not impressions.

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
3. **A station that sounds real.** The whole thing is WebAudio — many voices, a brown-noise
   dread that circles the signal without swallowing it, and a dial on frequencies real
   stations broadcast on. Jukebox mode ships it as a standalone toy.
   *Demonstrable:* `clips/jukebox.mp4` and the live spectrogram in the HUD.

## Assets

- [x] Cover image, 630×500 (`docs/img/cover.png`)
- [ ] 3–5 screenshots of the **current** build (`docs/img/`) — the existing four predate
      `SHOW NUMBERS` defaulting off and the canvas scaling, so they show a HUD a new
      player will not see
- [ ] One animated GIF of the core loop (`clips/out/core-loop.gif`) — needs re-capture
- [x] Trailer hosted: <https://youtu.be/B6LhrtK0SJs> — also predates the current build
- [ ] Three title variants testing *different* hypotheses, plus three 1280×720
      thumbnails (`clips/out/thumbs/`), for YouTube Test & Compare
- [x] `promo.html` landing page
- [x] `ITCH-PAGE.md` finalized; description source is `itch_page_description.md`
- [ ] Social share card (`og:image` in `promo.html`)

Everything unchecked above is gated on re-capturing from the current build. `clips/` and
`clips/out/` are gitignored and rebuilt by `./capture.sh <clip>` then `./post.sh`.

## Channels

The store page is home base; the rest is where this specific scene gathers. Read each
community's self-promotion rules before posting — several ban devs posting their own work
outside a weekly thread.

- **itch.io** — devlogs enabled. The devlog is the only surface that takes images
  inline, so GIFs are the only in-page motion.
- **Genre communities** — the liminal/analog-horror and itch-horror subreddits, Discords
  and forums. *These still need naming specifically; a channel list without real names
  is not a plan.*
- **Fediverse / Bluesky** — `#gamedev`, `#screenshotsaturday`, horror and liminal tags;
  post the GIF, not a link.
- **Short video** — the three `clips/out/*-9x16.mp4` verticals. Never the itch trailer
  slot: a 9:16 cut uploads as a Short, and Shorts cannot be A/B tested.
- **Curators / streamers** — a shortlist who cover short free browser horror. Not built yet.

## Launch beats

The page is already live, so the pre-launch beat is spent. What remains:

- **Re-launch the current build:** package, upload, verify the API reports `type=html`
  and a matching size, refresh screenshots, then post. Posting before this advertises a
  game that is not the one live.
- **Devlog on what changed:** the overflow past level 16 is the story — a counter that
  runs out of bits and a picture that comes apart while the route stays honest. Do not
  spoil where it starts; the store copy deliberately does not.
- **Post-launch:** note which channel actually brought players, and fold what they say
  about navigating by ear into the next pass.

## Honesty guardrails

- Every factual claim — frequencies, station names, lineage — is checked against a
  primary source. Two dial frequencies were once attributed to a station with no
  source and had to be corrected; the audience for this game contains people who know
  the real stations better than we do.
- No superlatives the game can't earn. No "first", no "only".
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

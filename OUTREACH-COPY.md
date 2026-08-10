# OUTREACH-COPY — finding_numbers

Paste-ready copy for the channels named in `MARKETING-PLAN.md`. That file holds the
gates, the audience notes and the posting order; this one holds only the words.

Every claim here has to be literally true of the shipped build. The claim floor below
is the shared source — say less than it, never more — and
`.claude/skills/honest-copy` runs over this file before anything is posted.

Links used throughout:

- Game: <https://kleer001.itch.io/finding-numbers>
- Trailer: <https://youtu.be/3_maIo0cYAk>
- Source: <https://github.com/kleer001/finding_numbers>

---

## The claim floor

What the build keeps, and therefore what any post may say:

- Free, runs in a browser, no signup, no download. Keyboard or touch.
- The station is the only compass: a correct turn adds a number to the broadcast, a
  wrong one adds nothing. Nothing buzzes, nothing turns red, and there is no fail state.
- Most of the maze holds still and can be learned. Some stretches move their exit a few
  times before settling.
- The station is built in WebAudio — digit samples in six languages over a synthesized
  noise bed, rendered with Kokoro-82M, one voicepack per language. A tribute, not a
  recording.
- Jukebox mode is the transmitter with no maze.
- One character grid, one phosphor color, bent through a WebGL CRT filter, with the
  signal drawn as a live spectrogram.
- The game was designed as sixteen levels. Whether anything lies beyond the sixteenth
  isn't documented, and no post answers it.
- It cannot be played without sound.

Not claimable: any "first" or "only", any comparison to another game's quality, any
length of playtime beyond "a few minutes a run", and anything about what players feel.

Real station names and dial frequencies stay out of copy. Naming them promises audio
this game does not have.

## Naming the genre

There is no enemy, no chase, no death, no timer and no fail state. Nothing in `src/`
implements damage, health, pursuit or a loss condition. The register is dread, which is
anticipation — not terror, which is the moment before impact, and not horror, which is
the aftermath. This game holds the first and never delivers the other two. That is the
design, not a gap in it.

- **"Liminal horror" and "analog horror" are fair.** They name a shelf, not a scare.
  That shelf is where dread without a monster lives, and this belongs on it.
- **Bare "horror" carries the contract with it.** Where a post or a tag says only
  "horror", say within a line or two that nothing chases you and nothing can kill you.
  That turns away the reader who came for a monster before they bounce, and it is the
  hook for the reader who came for the other thing.
- **Never "suspense" or "thriller".** Those promise stakes and a clock, and this game
  has neither. They over-promise harder than horror does, not more gently.
- **Never promise a scare.** No "terrifying", "creepy", "chilling", "nightmare". Copy
  may build unease. It may not sell a jump.

---

## r/WebGames

The title must begin with the game's name; tag prefixes are allowed before it. Direct
link to the game, no repost inside three months.

**Link:** <https://kleer001.itch.io/finding-numbers>

**Title:**

```
[HORROR][HTML5] finding_numbers — a maze with no map, navigated by ear
```

**First comment:**

```
Free, browser, no signup. The game cannot be played without sound.

You are @ in a maze of near-identical rooms while a shortwave number station reads
digits through the static. The station is the only compass: take the correct door
and a number is added to the broadcast, take a wrong one and nothing is added. There
is no buzzer and nothing turns red — you find out by what never arrives.

Nothing chases you and nothing can kill you. The worst the game does is stop counting
you.

Most of the maze holds still and can be learned. Some stretches move their exit a
few times before settling.

Arrows / WASD / HJKL, or tap the screen edges on a phone. P for preferences. A jukebox
mode comes with it — just the transmitter, no maze.
```

---

## r/itchio

No sidebar gate; devs post their own pages here as a matter of course.

**Title:**

```
finding_numbers — a browser horror maze you navigate by ear, with a number station for a compass
```

**Body:**

```
https://kleer001.itch.io/finding-numbers — free, HTML5, no signup.

A shortwave station reads digits through the static while you walk a maze of
near-identical rooms. A correct turn adds a number to the broadcast; a wrong one adds
nothing, and nothing else tells you. Nothing is hunting you and nothing can kill you —
the only thing the game does to you is stop acknowledging you.

Vanilla ES modules, no build step. The whole station is WebAudio: digits in six
languages over a synthesized noise bed, rendered with Kokoro-82M, one voicepack per
language.

Source is MIT: https://github.com/kleer001/finding_numbers

It cannot be played without sound.
```

---

## r/playmygame

Flair `[Web]` / `PC (Web)`, NSFW-flag it as horror, the game link before any other
link, one post per game per month. Post from an account with ordinary comment history —
Reddit's site-wide filter shadowbans accounts whose first posts are links.

The sub mandates a post template with a **100-word minimum** on the description, which
is why this is the one post that runs past the 150-word budget. The template's field
order is fixed; keep it.

**Title:**

```
[Web] finding_numbers — a horror maze navigated by ear; the number station is the only compass
```

**Body:**

```
**Game Title:** finding_numbers

**Playable Link:** https://kleer001.itch.io/finding-numbers

**Platform:** Web browser, HTML5. Desktop and mobile, no download and no signup.

**Description:**

You are one character in a maze of near-identical rooms. No map, no minimap, nothing
marking the right door. A shortwave number station reads digits through the static,
and it is the only feedback the game gives you. Take the correct door and a number is
added to the broadcast. Take a wrong one and nothing is added. There is no buzzer and
nothing turns red, so you learn the route by what never arrives.

It is tagged horror, but nothing chases you, nothing can kill you and there is no fail
state. The dread is that the station stops counting you.

Most of the maze holds still and can be learned. Some stretches move their exit a few
times before settling. The station is built in WebAudio — digit samples in six
languages over a synthesized noise bed, rendered with Kokoro-82M, one voicepack per
language. A tribute, not a recording. The picture is one character grid in one phosphor
color, bent through a WebGL CRT filter, with the signal drawn as a live spectrogram. A
jukebox mode comes with it: the transmitter alone, no maze.

Arrows / WASD / HJKL, or tap the screen edges. P opens preferences. It cannot be played
without sound.

What I'd most like to know is whether the navigate-by-ear loop reads without the
on-screen digit count, which is off by default.

**Free to Play Status:**

[x] Free to play
[ ] Demo/Key available
[ ] Paid (Allowed only on Tuesdays with [TT] in the title)

**Involvement:** Solo developer. Borrowed pieces are credited in the README and on the
store page: the CRT shader is CRTFilterWebGL, and the digit voices are rendered with
Kokoro-82M via the voice_loom project. Source is MIT.
```

---

## r/analoghorror

Permissive, but stealth promo is banned: own the post. Expect reach rather than
conversion — the feed is video series.

**Title:**

```
I made a browser horror maze where a number station is the only thing telling you you're going the right way
```

**Body:** attach `clips/out/core-loop.gif`.

```
Free and in the browser: https://kleer001.itch.io/finding-numbers

It's a maze of near-identical rooms rendered as one character grid through a WebGL CRT
filter. A shortwave station reads digits through the noise while you walk. A correct
turn adds a number to the broadcast; a wrong one adds nothing. There's no buzzer and no
red flash, so the only way to know you've gone wrong is a number that never comes.

Wander far enough and the broadcast empties — the station stops reading numbers at all
and you're alone in the hiss with nothing to steer by. Nothing kills you and nothing is
timing you. The game's only move is to stop acknowledging you.

Sound is not optional; it's the whole interface.
```

---

## r/numberstations

The one audience that will know immediately this isn't real station audio. Say so first,
in the title, so nobody arrives expecting recordings. Lead with how it was built.

**Title:**

```
I built a number station in WebAudio — synthesized, not recorded — and made a game you play by listening to it
```

**Body:** attach or link `clips/out/jukebox.mp4`.

```
https://kleer001.itch.io/finding-numbers — free, runs in a browser.

Up front: this is a tribute, not a recording. Nothing in it came off the air.

The voices are Kokoro-82M, one voicepack per language, reading number words rather
than digits — yon for 4, nana for 7, kyuu for 9. German and Russian were on the
original list; Kokoro has voices for neither, so it runs English, Spanish, Italian,
Japanese, Chinese and Hindi.

Under them is a synthesized noise bed, lowpassed below the voice and ducked whenever a
digit speaks, so it crowds the signal without ever burying it.

There's a jukebox mode that's only the transmitter: pick a language, set how coherent
the message is, how fast it reads, how much static sits on top.

The game part is a maze you navigate by ear. Nothing chases you and there's no way to
lose.
```

---

## itch.io Release Announcements board

Needs the page link, a summary, and at least one embedded image or video. Embed
`clips/out/core-loop.gif`.

**Subject:**

```
finding_numbers — a maze you navigate by ear, with a number station for a compass (free, HTML5)
```

**Body:**

```
https://kleer001.itch.io/finding-numbers

Free, browser, no signup. A shortwave number station reads digits through the static
while you walk a maze of near-identical rooms. A correct turn adds a number to the
broadcast; a wrong one adds nothing. No buzzer and no red flash.

There is no monster here, nothing pursuing you and no way to die. The station going
quiet is the whole of it.

Most of the maze holds still and can be learned. Some stretches move their exit a few
times before settling. Sixteen levels — the message grows and the gaps tighten to match.

Also in there: a jukebox mode that's just the transmitter, and a CRT decay dial you can
turn up until the picture barely holds.

It cannot be played without sound. Source is MIT.
```

---

## itch devlog

Descriptions take images, not video, so the GIFs are the only motion available:
`clips/out/core-loop.gif` and `clips/out/pulse.gif`.

The point of this one is to say that there is something to find without saying what it
is. Nothing here names a level number, a threshold, or an effect — a reader who has not
played should finish it knowing only that the sixteenth level is not a wall.

**Title:**

```
Sixteen is the largest number the counter can hold
```

**Body:**

```
I built sixteen levels. The level counter is four bits wide, so sixteen is also as high
as it can count.

Whatever else happens, the station keeps its word. A correct turn adds a number to the
broadcast and a wrong one adds nothing, however far you get. Nothing that happens to
the picture is allowed to touch the route.

I'm not going to say what the sixteenth level is the last of. If you get there, I'd
like to hear what you make of what's on the other side of it.

[core-loop.gif]

[pulse.gif]
```

---

## r/IndieGaming

512K subscribers, and itch.io links there draw real discussion. One submission every two
weeks, and the account must be at least a week old with ordinary posting history. Text
posts with footage are in scope; Let's Plays and streams are not.

**Title:**

```
I made a browser game where the only map is a number station reading digits
```

**Body:**

```
Free, in a browser, no signup: https://kleer001.itch.io/finding-numbers

You are one character in a maze of near-identical rooms. There is no map, and nothing
marks the right door. A shortwave number station reads digits through the static, and
that is the only feedback the game gives you. Take the correct door and a number is
added to the broadcast. Take a wrong one and nothing is added. No buzzer, nothing turns
red. You learn the route by what never arrives.

It is tagged horror, but nothing chases you, nothing can kill you, and there is no fail
state. The dread is that the station stops counting you.

Most of the maze holds still and can be learned. Some stretches move their exit a few
times before settling.

It cannot be played without sound.
```

---

## r/indiegames

326K subscribers. Rule 1: a promotion post **must** carry an image, GIF or video of the
game — attach `clips/out/core-loop.gif`. Two posts a week is the ceiling, and framing a
promo as a request for feedback is against the rules, so this one does not ask a question.

**Title:**

```
A maze of identical rooms where a number station is the only thing telling you which way is right
```

**Body:** — attach `clips/out/core-loop.gif`

```
Free, in a browser, no signup: https://kleer001.itch.io/finding-numbers

No map, no minimap, nothing marking the right door. A shortwave number station reads
digits through the static, and that is the whole of the feedback: a correct turn adds a
number to the broadcast, a wrong one adds nothing. Nothing buzzes and nothing turns red,
so the route is learned by what never arrives.

Nothing chases you, nothing can kill you, and there is no fail state.

The station is WebAudio — digits in six languages over a synthesized noise bed, rendered
with Kokoro-82M. A tribute, not a recording. The picture is one character grid in one
phosphor color, bent through a WebGL CRT filter.

It cannot be played without sound.
```

---

## Short video

The three `clips/out/*-9x16.mp4` verticals. Never the itch trailer slot: a 9:16 upload
becomes a Short, and Shorts cannot be A/B tested.

- `core-loop-9x16.mp4` — "The station tells you if you took the right door. Nothing else
  does."
- `room-moved-9x16.mp4` — "You leave a room. You come back. The exit isn't where you
  left it."
- `pulse-9x16.mp4` — "Reach the source of the transmission and it pulls you somewhere
  new."

Each caption ends with: `Nothing chases you. Free in a browser.
finding_numbers on itch.`

---

## Curator and streamer pitches

One email each, then move on. None of these has a queue that can be jumped.

Send in reach × fit order: Alpha Beta Gamer, then Warp Door. The figures behind that
order are in `MARKETING-PLAN.md`.

**Warp Door** — `warpdoor@gmail.com`. Subject:
`finding_numbers — a free browser maze navigated by ear, with a number station for a compass`

```
Hello,

finding_numbers is a free browser game about walking a maze of near-identical rooms
while a shortwave number station reads digits through the static. A correct turn adds
a number to the broadcast, a wrong one adds nothing. No buzzer, no red flash — a
mistake is silence rather than a signal.

It sits on the liminal-horror shelf, but there's no monster in it and no way to die.

One character grid bent through a WebGL CRT filter. Underneath is WebAudio: digit
samples in six languages rendered with Kokoro-82M, over a synthesized noise bed. A
tribute to the real thing, not a recording of it. A jukebox mode ships with it — the
transmitter alone, no maze.

Free, no signup, runs in one click: https://kleer001.itch.io/finding-numbers
Trailer: https://youtu.be/3_maIo0cYAk
Source, MIT: https://github.com/kleer001/finding_numbers

It cannot be played without sound.

— kleer001
```

**Alpha Beta Gamer** — via the Game Submissions contact form. Same body; subject:
`finding_numbers — free browser horror, playable now`

**Jupiter Hadley** — not a pitch. The way in is to enter a jam she is covering and be
one of the entries she plays.

---

## itch devlog — v1.1.1

Written off a player's bug report on the itch page. It names the mechanism because
the readership is other people who ship browser games, and the same trap is waiting
for anyone whose game cancels a pointer event.

**Title:**

```
The keyboard survives fullscreen
```

**Body:**

```
A player wrote in: go fullscreen on itch, the arrow keys die. Leave fullscreen and
they stay dead, and only a reload brings them back. Firefox and Chrome both.

They were right, and it was worse than it looked.

itch runs the game in an iframe from another domain, and the fullscreen button
belongs to itch's page, not mine. It takes the keyboard and keeps it. Plenty of
browser games hit that, and usually a click hands it back.

Not here. The game reads taps to walk, and the code that swallows a tap was also
swallowing the mousedown that hands focus back to the frame. Reload or nothing.

It now takes focus back itself, on any press and on the resize fullscreen causes.
Tested in both browsers, and on the live page.

Fixed in v1.1.1. Sorry, and thanks for writing in.
```

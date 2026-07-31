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
- The station is built in WebAudio — digit samples in six languages, a synthesized noise
  bed under them, and a dial reading a frequency real number stations are logged on, one
  drawn per level. The digits were rendered with Kokoro-82M, one voicepack per language.
- Jukebox mode is the transmitter with no maze.
- One character grid, one phosphor color, bent through a WebGL CRT filter, with the
  signal drawn as a live spectrogram.
- Sixteen levels are the game as designed. Whether anything lies beyond the sixteenth is
  not documented, and posts do not answer it.
- It cannot be played without sound. Headphones are the intended way in.

Not claimable: any "first" or "only", any comparison to another game's quality, any
length of playtime beyond "a few minutes a run", and anything about what players feel.

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
Free, browser, no signup. Headphones — the game cannot be played without sound.

You are @ in a maze of near-identical rooms while a shortwave number station reads
digits through the static. The station is the only compass: take the correct door
and a number is added to the broadcast, take a wrong one and nothing is added. There
is no buzzer and nothing turns red — you find out by what never arrives.

Most of the maze holds still and can be learned. Some stretches move their exit a
few times before settling.

Arrows / WASD / HJKL, or tap the screen edges on a phone. P for preferences. There is
also a jukebox mode that is just the transmitter, no maze.
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
nothing, and nothing else tells you. No buzzer, no red flash, no fail state — the only
thing the game does to you is stop acknowledging you.

Vanilla ES modules, no build step, and the whole station is WebAudio: digits in six
languages over a synthesized noise bed, and a dial reading a frequency real number
stations are logged on. The digits were rendered with Kokoro-82M, one voicepack per
language. Source is MIT: https://github.com/kleer001/finding_numbers

Headphones. It cannot be played without sound.
```

---

## r/playmygame

Flair `[Web]` / `PC (Web)`, NSFW-flag it as horror, the game link before any other
link, one post per game per month. Post from an account with ordinary comment history —
Reddit's site-wide filter shadowbans accounts whose first posts are links.

**Title:**

```
[Web] finding_numbers — a horror maze navigated by ear; the number station is the only compass
```

**Body:**

```
https://kleer001.itch.io/finding-numbers

Free, plays in the browser now, no signup or download. I'm the developer — solo.

The pitch: no map, no minimap, nothing marks the right door. A shortwave number
station reads digits through the static, and it is the only feedback you get. Correct
turn, a number is added to the broadcast. Wrong turn, nothing is added. No buzzer and
no red flash — you learn by what never arrives. Most of the maze holds still and can
be learned; some stretches move their exit a few times before settling.

Controls: arrows / WASD / HJKL on desktop, tap the screen edges on touch. P opens
preferences.

What I'd most like to know: whether the navigate-by-ear loop reads without the
on-screen digit count, which is off by default. If you turn it on in preferences,
I'd like to hear that too.

Headphones — the game cannot be played without sound.
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
and you're alone in the hiss with nothing to steer by. There's no death and no timer;
the game's only move is to stop acknowledging you.

Sound is not optional; it's the whole interface. Headphones.
```

---

## r/numberstations

The people who know the real stations. Lead with the dial and the audio, not the maze,
and do not claim to reproduce any particular station.

**Title:**

```
Browser game built around a WebAudio number station — the dial cycles frequencies these stations are logged on
```

**Body:** attach or link `clips/out/jukebox.mp4`.

```
https://kleer001.itch.io/finding-numbers — free, runs in a browser.

The station is built in WebAudio: digit samples in six languages over a synthesized
noise bed, and a dial whose values are frequencies logged for real stations — UVB-76 on
4625, the Lincolnshire Poacher on 11545, HM01 on 11530, the Cuban V02a on 7887, The Pip,
the Squeaky Wheel, the Goose, Yosemite Sam. One is drawn per level and shown under the
level badge: flavour on the HUD, not a simulation of any one station's schedule or
format. If I've got a value wrong I'd rather hear it than not.

The voices are Kokoro-82M, one voicepack per language, reading number words rather than
digits so the readings are the ones a station would use — yon for 4, nana for 7, kyuu
for 9 in the Japanese set. German and Russian were on the original list; Kokoro-82M has
voices for neither, which is why the set runs English, Spanish, Italian, Japanese,
Chinese and Hindi.

There's a jukebox mode that is only the transmitter, no game around it: pick a
language, set how coherent the message is, how fast it reads, and how much static sits
on top, then leave it running.

The game part is a maze you navigate by ear — a correct turn adds a number to the
broadcast, a wrong one adds nothing.
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
broadcast; a wrong one adds nothing. No buzzer, no red flash, no fail state.

Most of the maze holds still and can be learned. Some stretches move their exit a few
times before settling. Sixteen levels are the game as designed; the later ones read
faster, in a different voice each time, and eventually in a new language per digit —
with more of the level you can't trust to stay put.

Also in there: a jukebox mode that's just the transmitter, and a preferences panel that
lets you dial the CRT decay up until the picture barely holds.

Headphones — it cannot be played without sound. Source is MIT.
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
The level counter is a four-bit field. Sixteen levels are the game as designed, and
sixteen is the most that field can count to — which are two different facts that happen
to land on the same number.

The station is the part I'd trust. However far you get, a correct turn adds a number to
the broadcast and a wrong one adds nothing. The route is honest by construction, not by
discipline: nothing that happens to the picture is allowed to touch it.

I'm not going to say what the sixteenth level is the last of. If you get there, I'd
like to hear what you make of what's on the other side of it.

[core-loop.gif]

[pulse.gif]
```

---

## Bluesky / Fediverse

Post the GIF, not the link — a link in the first post suppresses reach on both. Tags:
`#gamedev` `#horror` `#liminal` `#indiedev`, plus `#screenshotsaturday` when it lands on
one.

**Post 1** — attach `clips/out/core-loop.gif`:

```
A maze with no map. A shortwave number station reads digits through the static, and it
is the only compass you get: a correct turn adds a number to the broadcast, a wrong one
adds nothing. No buzzer, no red flash. Free in a browser. Headphones.

#gamedev #horror #liminal
```

**Post 2** — attach `clips/out/pulse.gif`:

```
No death, no timer, no fail state. The only thing this game can do to you is stop
counting you.

#gamedev #liminal #indiedev
```

Reply to either with the link once the post has settled:
<https://kleer001.itch.io/finding-numbers>

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

Each caption ends with: `Free in a browser — headphones. finding_numbers on itch.`

---

## Curator and streamer pitches

One email each, then move on. None of these has a queue that can be jumped.

**Warp Door** — `warpdoor@gmail.com`. Subject:
`finding_numbers — a free browser maze navigated by ear, with a number station for a compass`

```
Hello,

finding_numbers is a free browser game about walking a maze of near-identical rooms
while a shortwave number station reads digits through the static. The station is the
only compass: a correct turn adds a number to the broadcast, a wrong one adds nothing.
There's no buzzer and no red flash, so a mistake is silence rather than a signal.

It's one character grid bent through a WebGL CRT filter, and the station is synthesized
in WebAudio — six languages of spoken digits, and a dial that cycles frequencies real
number stations are logged on. There's a jukebox mode that's only the transmitter.

Free, no signup, runs in one click: https://kleer001.itch.io/finding-numbers
Trailer: https://youtu.be/3_maIo0cYAk
Source, MIT: https://github.com/kleer001/finding_numbers

Headphones — it cannot be played without sound.

— kleer001
```

**Free Game Planet** — `admin@freegameplanet.com`, or `@FreeGamePlanet`. Same body;
subject: `Free browser horror game — finding_numbers (navigate a maze by ear)`

**Alpha Beta Gamer** — via the Game Submissions contact form. Same body; subject:
`finding_numbers — free browser horror, playable now`

**ManlyBadassHero** — the business email on the channel's About page. Same body, with
this in place of the closing line:

```
It's a short one — a run is a few minutes — and it's free and needs no download, if
it fits a video.
```

**Jupiter Hadley** — not a pitch. The way in is to enter a jam she is covering and be
one of the entries she plays.

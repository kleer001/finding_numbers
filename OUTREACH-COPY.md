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
- The game was designed as sixteen levels. Whether anything lies beyond the sixteenth
  isn't documented, and no post answers it.
- It cannot be played without sound. Headphones are the intended way in.

Not claimable: any "first" or "only", any comparison to another game's quality, any
length of playtime beyond "a few minutes a run", and anything about what players feel.

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
Free, browser, no signup. Headphones — the game cannot be played without sound.

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
language. The dial reads a frequency real number stations are logged on.

Source is MIT: https://github.com/kleer001/finding_numbers

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

Worth saying up front, since it's tagged horror: nothing chases you and nothing can
kill you. There's no fail state at all. The dread is that the station stops counting
you, not that something is coming.

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
and you're alone in the hiss with nothing to steer by. Nothing kills you and nothing is
timing you. The game's only move is to stop acknowledging you.

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
noise bed. The dial values are frequencies logged for real stations: UVB-76 on 4625,
the Lincolnshire Poacher on 11545, HM01 on 11530, the Cuban V02a on 7887. The Pip, the
Squeaky Wheel, the Goose and Yosemite Sam are in there too. One is drawn per level and
sits under the level badge — flavour on the HUD, not a simulation of anybody's schedule
or format. If I've got a value wrong I'd rather hear it than not.

The voices are Kokoro-82M, one voicepack per language. They read number words rather
than digits, so you get the readings a station would use. Yon for 4, nana for 7, kyuu
for 9 in the Japanese set. German and Russian were on the original list. Kokoro has
voices for neither, which is why the set runs English, Spanish, Italian, Japanese,
Chinese and Hindi.

There's a jukebox mode too — the transmitter, no game around it. Pick a language. Set
how coherent the message is, how fast it reads, how much static sits on top. Then leave
it running.

The game part is a maze you navigate by ear — a correct turn adds a number to the
broadcast, a wrong one adds nothing. Nothing chases you and there's no way to lose.
It isn't that kind of game.
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
times before settling. There are sixteen levels. The later ones read faster, in a
different voice each time, and eventually in a new language per digit, with more of the
level you can't trust to stay put.

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
I built sixteen levels. The level counter is four bits wide, so sixteen is also as high
as it can count. Those are two separate facts that happen to land on the same number.

Whatever else happens, the station keeps its word. A correct turn adds a number to the
broadcast and a wrong one adds nothing, however far you get. Nothing that happens to
the picture is allowed to touch the route.

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
adds nothing. No buzzer, no red flash, nothing behind you. Free in a browser.
Headphones.

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

Each caption ends with: `Nothing chases you. Free in a browser — headphones.
finding_numbers on itch.`

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

It sits on the liminal-horror shelf, but there's no monster in it and no way to die.
The dread is that the station can stop acknowledging you.

It's one character grid bent through a WebGL CRT filter. Underneath is WebAudio: digit
samples in six languages, rendered with Kokoro-82M, over a synthesized noise bed, with
the dial reading a frequency real number stations are logged on. A jukebox mode ships
with it — the transmitter on its own, no maze.

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

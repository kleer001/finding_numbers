# finding_numbers

A liminal horror maze you navigate **by ear**.

You are `@`, lost in a shifting maze of near-identical rooms, listening to a
shortwave number station bleed through the static. Walk toward the signal: take
a turn and listen — if a new digit joins the broadcast, you chose right; if not,
you're wandering, and the numbers start to slip away. Find all ten numbers to
reach the source of the transmission, and it will pull you somewhere new.

## ▶ [Play it here](https://kleer001.github.io/finding_numbers/)

Tap or press any key to start the audio, put on headphones, and listen.

## Controls

**Desktop (keyboard):**

- **Move** — arrow keys, WASD, or HJKL
- **C** — toggle the CRT effect
- **P** — preferences (CRT, on-screen numbers, transmission language)

**Mobile / touch:**

- **Move** — tap the top / bottom / left / right of the screen to step that way
- **[P]** (top-right corner) — open preferences

## How to play

- Every room has three doors. One of them leads closer to the station.
- Closer means a **new** number fades into the broadcast. No new number means
  you went the wrong way — turn back the way you came.
- The count of audible digits is your only compass; there is no map, and the
  rooms rearrange themselves as you move.
- Reach the source, then step onto the pulsing glyph to be transported onward.

Headphones recommended — the voice is faint and buried in noise on purpose.

## Run locally

```sh
./run.sh          # serves at http://localhost:8000
```

The game is plain HTML + CSS + ES modules with no build step, so any static file
server works.

## Credits

- Number-station voice samples and the sound-design reference come from the
  `voice_loom` project.
- CRT effect: [CRTFilterWebGL](https://github.com/Ichiaka/CRTFilterWebGL) (MIT).

MIT licensed.

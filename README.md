# finding_numbers

A liminal horror maze you navigate **by ear** — a shortwave number station
bleeding through the static, and a maze that rearranges itself the moment you
stop listening.

![Playing finding_numbers — an amber character-mode screen: a maze of `#` walls with an `@` player, a live spectrogram, and a station frequency on the dial](docs/img/gameplay.png)

You are `@`, lost in a shifting maze of near-identical rooms, listening to a
station read numbers through the noise. Walk toward the signal: take a turn and
listen — if a new digit joins the broadcast, you chose right; if not, you're
wandering, and the numbers start to slip away. Capture the full message to reach
the source of the transmission, and it will pull you somewhere new.

## ▶ [Play it here](https://kleer001.github.io/finding_numbers/)

Tap or press any key to start the audio, **put on headphones**, and listen. The
voice is faint and buried in noise on purpose.

---

## What's inside

### Navigate by ear

There is no map. Every room has doors, and one of them leads closer to the
station. Closer means a **new** number fades into the broadcast; no new number
means you went the wrong way. The count of audible digits is your only compass,
and the rooms rebuild themselves as you move. The transmission never lies — no
decoys, no dropped digits. Only the voice, the message, and the maze get harder.

### A fake number station that sounds real

The whole game is a WebAudio number station built to unsettle:

- **Six languages** of spoken digits — English, Spanish, Italian, Chinese,
  Japanese, Hindi — plus a *babel* mode that picks a different language for
  every digit.
- A **brown-noise dread bed** that swells and stabs between digits but is
  sidechain-ducked under the voice, so it threatens the signal without ever
  masking it.
- **Shortwave character** — band-limited voice, QSB fading, saturation, a
  constant hiss floor — the numbers ride about 15 dB above the noise.
- The status dial reads a **real number-station frequency** in kHz (The Buzzer /
  UVB-76, the Lincolnshire Poacher, the Cuban *Atención*, The Pip, and more),
  chosen per level.

### A character-mode CRT

Everything is drawn as one monospace glyph grid — one font, one size, one
phosphor color — like a text-mode monitor, then run through a WebGL CRT filter
(scanlines, curvature, chromatic aberration, a 0–5 "dying monitor" noise dial).
A **live waterfall spectrogram** of the signal scrolls in the HUD.

Pick your phosphor (**amber** or **green**) and your **mode** — dark, or a light
"amber paper" inversion:

![The preferences panel — CRT FX, CRT NOISE, SHOW NUMBERS, TINT, MODE, JUKEBOX, LEVEL, SOUND TEST](docs/img/preferences.png)

![Light mode — black ink on an amber page](docs/img/light-mode.png)

### Multilingual signal — and multilingual warnings

Before your first move, a cold-open banner drifts through station patter and
commands in many languages (accented Latin *and* Cyrillic), timed to the
station's own digit cadence. And when the local server drops, a **SIGNAL LOST**
bar flickers the warning across languages like a dying relay hunting for the
carrier:

![A SIGNAL LOST warning in Russian — СИГНАЛ ПОТЕРЯН — flickering across the screen](docs/img/signal-lost.png)

### Jukebox mode

Don't want to play — just want a creepy station on in the background? Open
**Preferences → JUKEBOX** for a listen-only transmitter. Pick a **language**,
**coherence** (a fixed message that loops, endless random digits, or a 0–9
counting melody), **cadence**, **static** level, and **numbers on/off** — turn
the numbers off for pure brown-noise ambience.

![The jukebox picker — LANGUAGE, COHERENCE, CADENCE, STATIC, NUMBERS, EXIT — over a live spectrogram](docs/img/jukebox.png)

### 32 levels of decay

Early levels read a short English message. Later ones speak other languages,
repeat every digit twice, and open extra doors at each junction. Past level 12
the message grows one digit per level — random digits, each voiced in a random
language — down to a claustrophobic, hissing "deep station." It goes to 32.

---

## Controls

**Desktop (keyboard):**

- **Move** — arrow keys, WASD, or HJKL
- **C** — toggle the CRT effect
- **P** — preferences
- **Esc** — close a panel

**Mobile / touch:**

- **Move** — tap the top / bottom / left / right of the screen to step that way
- **[P]** (top-right corner) — open preferences; menu rows are tappable
  (`<` / `>` steppers, tap outside to close)

Preferences — CRT effect, CRT noise (0–5), on-screen numbers, tint (amber/green),
mode (dark/light), jukebox, and a level select (1–32) for experts — are saved
locally along with your current level.

## How to play

- Every room has doors. One of them leads closer to the station.
- Closer means a **new** number fades into the broadcast. No new number means
  you went the wrong way — turn back the way you came.
- The count of audible digits is your only compass; there is no map, and the
  rooms rearrange themselves as you move.
- Reach the source, then step onto the pulsing glyph to advance to the next
  level.

Headphones strongly recommended.

## Run locally

```sh
./run.sh          # serves at http://localhost:8000 and opens your browser
```

`run.sh` reclaims the port if a previous server is still holding it, so you can
re-run it freely. The game is plain HTML + CSS + ES modules with **no build
step**, so any static file server works too.

## Built with

- **No build step** — vanilla ES modules, HTML, and CSS.
- **WebAudio** for the station; a seeded mulberry32 RNG generates the maze, so
  every run is reproducible from its seed.
- Tests: `pytest` for Python, `node --test` for the game logic (`npm test`).

## Credits

- Number-station voice samples and the sound-design reference come from the
  `voice_loom` project.
- CRT effect: [CRTFilterWebGL](https://github.com/Ichiaka/CRTFilterWebGL) (MIT).

MIT licensed.

---

<details>
<summary>📻 <b>Further reading — the real number stations</b> (for the curious)</summary>

<br>

Number stations are real: shortwave broadcasts of spoken digit groups, widely
believed to send one-time-pad messages to intelligence agents. The frequencies,
voices, and dread in this game are drawn from documented ones. Start here:

- **[Numbers station — Wikipedia](https://en.wikipedia.org/wiki/Numbers_station)** —
  the overview: message format (groups of four or five, read twice or looped),
  history, and the famous stations.
- **[The Conet Project — Wikipedia](https://en.wikipedia.org/wiki/The_Conet_Project)** —
  the canonical four-hour compilation of numbers-station recordings; the sound
  this game is chasing. (Freely available on the Internet Archive.)

**The stations on the dial** (the kHz values the frequency readout cycles through):

- **The Buzzer — UVB-76** (4625 kHz) —
  [Wikipedia](https://en.wikipedia.org/wiki/UVB-76) ·
  [Priyom](https://priyom.org/military-stations/russia/the-buzzer)
- **The Lincolnshire Poacher — E03** (11545 kHz), 5-figure groups with the fifth
  digit pitched up —
  [Wikipedia](https://en.wikipedia.org/wiki/Lincolnshire_Poacher_(numbers_station)) ·
  [Priyom](https://priyom.org/number-stations/english/e03)
- **The Cuban "Atención" — V02a → HM01** (7887 / 11530 kHz) —
  [Priyom](https://priyom.org/number-stations/other/v02a)
- **The Pip — S30** (5448 day / 3756 night kHz) —
  [Wikipedia](https://en.wikipedia.org/wiki/The_Pip) ·
  [Priyom](https://priyom.org/military-stations/russia/the-pip)
- **The Squeaky Wheel — S32**, **The Goose**, and **Yosemite Sam** — indexed in
  the databases below.

**Databases, trackers & communities:**

- **[Priyom.org](https://priyom.org/)** — the definitive live schedule, station
  IDs (E-, S-, V-, HM- designators), and recordings.
- **[Numbers & Oddities](https://www.numbersoddities.nl/)** — long-running
  logs, profiles, and the ENIGMA station catalogue.
- **[HFUnderground Wiki](https://www.hfunderground.com/wiki/)** — hobbyist notes
  and identifications across the shortwave spectrum.

</details>


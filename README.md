# finding_numbers

A liminal horror maze you navigate **by ear**. You are `@`, lost in near-identical
rooms while a shortwave number station reads digits through the static. Nothing
chases you and nothing can kill you — the station going quiet is the only way to lose.

## ▶ [Play it here](https://kleer001.github.io/finding_numbers/) · [on itch.io](https://kleer001.itch.io/finding-numbers)

Press any key to start the audio and **put on headphones**. What you're listening for
is whether a number arrives at all.

---

## What's inside

<table>
<tr>
<td width="34%" valign="top">

### Navigate by ear

No map, nothing marks the right door. A correct turn adds a number to the
broadcast, a wrong one adds nothing — no buzzer, no red flash. Most rooms hold
still and can be learned; some move their exit before settling.

</td>
<td width="66%" valign="top">

<img src="docs/img/gameplay.png" width="600" alt="An amber character-mode screen: a brick-walled maze with an @ player, the digits heard so far, and a live spectrogram in the HUD">

</td>
</tr>

<tr>
<td width="34%" valign="top">

### A station that sounds real

A number station built in WebAudio — six languages, a brown-noise bed that
circles the signal without swallowing it, and a dial tuned to frequencies that
really broadcast.

**Jukebox mode** plays it on its own, no maze.

</td>
<td width="66%" valign="top">

<img src="docs/img/jukebox.png" width="600" alt="The jukebox picker over a live spectrogram">

</td>
</tr>

<tr>
<td width="34%" valign="top">

### A character-mode CRT

One font, one phosphor color, one glyph grid — a text-mode monitor bent through a
WebGL CRT filter, the signal scrolling as a live spectrogram. Dial the decay up
until the picture barely holds.

The game ships the font that draws its walls (`make_font.py` builds it): no stock
face has the glyphs, and a fallback would put a second typeface in the grid.

</td>
<td width="66%" valign="top">

<img src="docs/img/preferences.png" width="600" alt="The preferences panel">

<img src="docs/img/light-mode.png" width="600" alt="Light mode — black ink on an amber page">

</td>
</tr>

</table>

### 16 levels

The message grows from three digits to fourteen, and the station tightens its gaps
to match, so a longer message never buys you more time. Past the opening stretch the
language changes level to level, until every digit picks its own.

What's past the sixteenth isn't documented.

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

Preferences — CRT effect, CRT noise (0–5), burn-in, on-screen numbers, tint
(amber/green), mode (dark/light), jukebox, noise tone, volume, the run's seed,
and restart level / restart game — are saved locally along with your current
level. On-screen numbers start **off**: the station is meant to be the compass.

## How to play

Take a turn, then listen. Reach the source and step onto the pulse to move on. The
rest is yours to work out. The game can't be played without sound.

## Run locally

```sh
./run.sh          # serves at http://localhost:8000 and opens your browser
```

`run.sh` reclaims the port if a previous server is still holding it, so you can
re-run it freely. The game is plain HTML + CSS + ES modules with **no build
step**, so any static file server works too.

## Built with

- **No build step** — vanilla ES modules, HTML, and CSS.
- **Its own font** — VT323 plus block and masonry glyphs drawn to the character
  cell, self-hosted, so a wall tiles seamlessly and never falls back.
- **WebAudio** for the station; a seeded mulberry32 RNG generates the maze, so
  every run is reproducible from its seed.
- Tests: `node --test` for the game logic (`npm test`).

## Credits

- Number-station voices rendered with Kokoro-82M, one voicepack per language, via
  the `voice_loom` project.
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


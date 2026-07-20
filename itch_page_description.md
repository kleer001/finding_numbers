# itch.io page description — paste-ready

Live page: <https://kleer001.itch.io/finding-numbers>

itch.io's description box takes basic formatting only (headings, bold/italic, lists,
links, images, quotes). Paste the block below into **Edit game → Description**. The
editor has an **Edit as HTML** toggle if you'd rather paste markup; the markdown here
maps cleanly onto what it allows.

- **Cover image**: `docs/img/cover.png` (630×500) → *Edit game → Cover image*.
- **Screenshots**: add `docs/img/gameplay.png`, `jukebox.png`, `signal-lost.png`,
  `light-mode.png` under *Screenshots*.
- **Tagline** (the one-liner under the title): `Navigate a shifting maze by ear — a number station bleeding through the static.`

---

## A liminal horror maze you navigate **by ear**

A shortwave number station is bleeding through the static, and the maze rearranges
itself the moment you stop listening.

You are `@`, lost in a shifting maze of near-identical rooms, listening to a station
read numbers through the noise. Walk toward the signal, capture the whole message, and
reach the source of the transmission — it will pull you somewhere new.

> **Put on headphones.** The voice is faint and buried in noise on purpose. This game
> is played with your ears as much as your eyes.

## What's inside

- **Navigate by ear** — there is no map, and the rooms rebuild themselves the moment
  you look away. The station is your only compass.
- **A station that sounds real** — the whole game is a number station built in WebAudio:
  many voices, a brown-noise dread that circles the signal without ever swallowing it,
  and a dial tuned to frequencies that really broadcast into the dark.
- **Jukebox mode** — no maze, just the transmitter. Tune it and let it run.
- **A character-mode CRT** — one font, one phosphor color, one glyph grid, bent through
  a WebGL CRT filter, with the signal scrolling as a live spectrogram. Dial the decay up
  until the picture barely holds.
- **32 levels of decay** — six languages, more doors, and walls that lose their nerve
  the deeper you go. Thirty-two levels down, the signal can barely hold itself together.

## Controls

**Desktop:** arrow keys / WASD / HJKL to move · **C** toggles the CRT · **P** for
preferences · **Esc** closes a panel.

**Mobile:** tap the top / bottom / left / right of the screen to step that way · **[P]**
in the corner opens preferences.

## How to play

Take a turn, then listen — the broadcast tells you whether you're getting warmer. Reach
the source and step onto the pulse to go deeper. The rest is yours to work out.

**Headphones strongly recommended.**

## Credits

- Number-station voice samples and sound-design reference from the `voice_loom` project.
- CRT effect: [CRTFilterWebGL](https://github.com/Ichiaka/CRTFilterWebGL) (MIT).
- Source: [github.com/kleer001/finding_numbers](https://github.com/kleer001/finding_numbers) · MIT licensed.

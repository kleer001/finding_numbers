# itch.io page description — paste-ready

Live page: <https://kleer001.itch.io/finding-numbers>

itch.io's description box takes basic formatting only (headings, bold/italic, lists,
links, images, quotes). Paste the block below into **Edit game → Description**. The
editor has an **Edit as HTML** toggle if you'd rather paste markup; the markdown here
maps cleanly onto what it allows.

- **Cover image**: `docs/img/cover.png` (630×500) → *Edit game → Cover image*.
- **Screenshots**: add `docs/img/gameplay.png`, `jukebox.png`, `light-mode.png`,
  `preferences.png` under *Screenshots*.
- **Trailer**: `clips/out/trailer.mp4` (~44s, built by `./post.sh`). itch takes a hosted
  link rather than a file -- see `itch_publish_howto.md` section 6b.
- **Tagline** (the one-liner under the title): `Navigate a maze by ear — a number station bleeding through the static, and rooms that don't stay where you left them.`
  itch caps this field at **120 characters** and rejects the *whole* form when it
  is over, reporting `short_text: expected text between 1 and 120 characters` and
  silently discarding every other edit in the same save. Count before pasting.

---

## A liminal horror maze you navigate **by ear**

You are `@`, lost in near-identical rooms while a shortwave number station reads digits
through the static. Nothing chases you and nothing can kill you — the station going
quiet is the only way to lose.

## What's inside

- No map, and nothing marks the right door.
- A correct turn adds a number. A wrong one adds nothing.
- Rooms that move their exit before settling.
- Spoken digits in six languages.
- Jukebox mode: the transmitter, no maze.
- A character-mode CRT through a WebGL filter.
- 16 levels. What's past the sixteenth isn't documented.

## Controls

**Desktop:** arrows / WASD / HJKL · **C** CRT · **P** preferences · **Esc** closes.

**Mobile:** tap the screen edges · **[P]** for preferences.

Play it with sound — by ear is the whole design. If you can't, turn on **SHOW
NUMBERS** in preferences (**P**) and the digits and the count are drawn on screen
instead.

## Credits

- Voices: Kokoro-82M via the `voice_loom` project.
- CRT effect: [CRTFilterWebGL](https://github.com/Ichiaka/CRTFilterWebGL) (MIT).
- Source: [github.com/kleer001/finding_numbers](https://github.com/kleer001/finding_numbers) · MIT licensed.

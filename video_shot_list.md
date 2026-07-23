# Video shot list

What to record for promotion, and how. Companion to `itch_page_description.md`
(positioning) and `itch_publish_howto.md` (publishing steps).

## The governing constraint

The hook is **audio**, but social video autoplays **muted**. "Navigate by ear" is
invisible with the sound off, so every clip has to read silently. Two on-screen
proxies carry the sound:

- the **waterfall spectrogram** in the HUD — each spoken digit is a vertical streak
- the **digit readout** — the running count of captured numbers

The digit readout is the `SHOW NUMBERS` preference and is **off by default**. Turn
it **on** for any clip where the count is the tell. Burn captions into every clip.

## Recording setup

`./capture.sh` records just the game window at its native 800×600 with the sound
you hear and no mouse cursor. `./capture.sh -s` starts recording immediately;
without `-s` it arms and waits for Enter so you can get set before the first frame.

Open preferences with `P`. Useful rows: `SHOW NUMBERS`, `CRT NOISE`, `TINT`,
`BURN-IN`, `LEVEL` (jump straight to a level), `JUKEBOX`, `VOLUME`.

Record more than you need and cut in. A clean take of the same beat three times
gives an editor room to find the loop point.

## The clips

| # | Clip | Length | Where it goes |
|---|---|---|---|
| 1 | Core loop | 12–15s | itch GIF, `promo.html` share card, social — the one that sells it |
| 2 | The wrong-turn tell | 12–18s | Explains the mechanic; the "oh, I get it" post |
| 3 | The room that moved | 10–15s | The horror beat |
| 4 | The pulse | 6–10s | Seamless loop; strongest muted performer |
| 5 | CRT decay | 10–15s | The aesthetic pillar |
| 6 | Jukebox | 20–30s | Ambient audience; the clip that rewards sound-on |
| 7 | Title and burn-in | 5–8s | Trailer opener, page header |
| 8 | Trailer | 30–45s | Cut from the others |

### 1. Core loop

Level 1 or 2, `SHOW NUMBERS` on. Walk to a door, cross it, land in the next room as
the count ticks up and the waterfall streaks.

- **First 3 seconds:** the door crossing, the static cut, a new number appearing.
- **Caption:** "no map. the station is your compass."

### 2. The wrong-turn tell

`SHOW NUMBERS` on. Take a wrong door — the count **stalls**, no new digit. Walk back
the way you came; it resumes.

- **First 3 seconds:** the count visibly failing to move.
- **Caption:** "a wrong turn doesn't tell you. the silence does."

Absence is the mechanic, so this is the strongest teaching clip. Hold on the frozen
count a beat longer than feels comfortable.

### 3. The room that moved

Use `LEVEL` to reach a level deep enough to contain an unstable stretch (level 9 and
beyond). Learn a room's correct door, leave through a wrong one, walk back, and find
the exit somewhere else.

- **Caption:** "you memorized this room. it didn't stay memorized."
- Keep the claim bounded — most rooms hold still, and that is what makes the ones
  that don't land. See "Honest copy" in `itch_page_description.md`.

### 4. The pulse

Reach a source room and step onto the pulsing glyph. The spiral of numbers wipes
outward into the next level.

Cut it so the last frame matches the first. No caption needed — it carries itself.

### 5. CRT decay

Open `PREFS` and walk `CRT NOISE` from 0 to 5 so the picture degrades live, then flip
`TINT` between amber and green.

- **Caption:** "dial the decay until the picture barely holds."

### 6. Jukebox

`PREFS` → `JUKEBOX`. No maze, just the transmitter and the scrolling waterfall. Let it
run. This is the one clip worth explicitly asking for headphones on.

### 7. Title and burn-in

The title splash with the phosphor burn-in settling in. Short, no gameplay.

### 8. Trailer

Assemble in this order: 7 → 1 → 2 → 5 → 3 → 4, then hold on the title with the play
URL. Keep it under 45 seconds; the first five seconds decide whether the rest is
watched.

## Platform variants

- **Vertical (9:16)** cuts of clips 1, 3 and 4 for short-video feeds. **Pad** the 4:3
  frame rather than cropping — the HUD carries the digit count and the waterfall, and
  cropping to vertical throws away the part that makes the clip legible.
- **Looping GIF** from clip 1 or 4 for the itch page and README.
- **Static frames** for stills: the deepest level reachable via `LEVEL` with `CRT NOISE`
  high makes the most striking screenshot.

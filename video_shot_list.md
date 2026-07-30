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

Naming a clip — `./capture.sh core-loop` — plays that take from `src/demo.js`
instead, boots the game from factory settings so the previous take's tint and
noise dial can't leak in, and stops recording on its own. The driver reads the
level's golden path, so it walks the intended route rather than fumbling for it;
a take that fails to land its beat throws instead of banking silent footage.

- `--seed N` pins the maze layout, so the same take can be re-shot verbatim
  until the framing is right. Without it every run lays out a different maze.
- `-t SECONDS` overrides the clip's recording length.

Clips 6 and 8 are the manual ones. Everything else is a named take.

Open preferences with `P`. Useful rows: `SHOW NUMBERS`, `CRT NOISE`, `TINT`,
`BURN-IN`, `LEVEL` (jump straight to a level), `JUKEBOX`, `VOLUME`.

Record more than you need and cut in. A clean take of the same beat three times
gives an editor room to find the loop point.

## The clips

| # | Clip | Command | Length | Where it goes |
|---|---|---|---|---|
| 1 | Core loop | `core-loop` | 12–15s | itch GIF, `promo.html` share card, social — the one that sells it |
| 2 | The wrong-turn tell | `wrong-turn` | 12–18s | Explains the mechanic; the "oh, I get it" post |
| 3 | The room that moved | `room-moved` | ~5s | The horror beat - staged, see below |
| 4 | The pulse | `pulse` | 6–10s | Seamless loop; strongest muted performer |
| 5 | CRT decay | `crt-decay` | ~18s | The aesthetic pillar |
| 6 | Jukebox | `jukebox` | 20–30s | Ambient audience; the clip that rewards sound-on |
| 7 | Title and burn-in | `title` | 5–8s | Trailer opener, page header |
| 8 | Trailer | — | ~37s | Cut from 7, 1, 5, 3 and 4 |

### 1. Core loop

Level 1 or 2, `SHOW NUMBERS` on. Walk to a door, cross it, land in the next room as
the count ticks up and the waterfall streaks.

- **First 3 seconds:** the door crossing, the static cut, a new number appearing.
- **Caption:** "no map. the station is your compass."

### 2. The wrong-turn tell

`SHOW NUMBERS` on. Take a wrong door — the count **stalls**, no new digit. Walk back
the way you came; it resumes.

- **First 3 seconds:** the count visibly failing to move.
- **Caption:** "a correct turn adds a number. a wrong one adds nothing."

Nothing goes silent on a wrong turn. The first stray is graced, so the readout keeps
saying exactly what it said before; only a second stray shortens it. The tell is a
number that never arrives, which is why the copy has to talk about what is added
rather than about silence.

Absence is the mechanic, so this is the strongest teaching clip. Hold on the frozen
count a beat longer than feels comfortable. It stays out of the trailer: the beat
needs more setup than a trailer segment can give it.

### 3. The room that moved

Cross a room that is a bare corridor, step into the room past it, turn around,
walk back - and the corridor you crossed is now a crossroads. A "-", then a "7",
then a "+".

**This one is staged**, on its own page (`promo-room-moved.html`) rather than
driven through `src/demo.js`. The game will not perform the beat to camera. A
room's openings never move, so the only thing a real revisit can change is the
corridor width, and only in the deep station - and most rolls change the wall
texture at the same time, at which point the room stops reading as the same room
and the shot says nothing. A room that is recognisable has not visibly changed; a
room that has visibly changed is not recognisable.

What staging buys is legibility. What it costs is literal accuracy: the room
gains doors, which the game does not do. Everything drawing it is the game's own
- `buildCell` for the geometry, `render()` for the frame, `renderStatic` for the
cut, the shipped font, the CRT filter - so every shape on screen is a shape the
game builds. The licence is the transition between them.

`capture.sh room-moved` records it like any other clip; the page takes the same
go-file handshake.

- **Caption:** "you memorized this room. it didn't stay memorized."
- Keep the claim bounded — most rooms hold still, and that is what makes the ones
  that don't land. See "Honest copy" in `itch_page_description.md`.

The take loads whichever deep level's first unstable room sits shallowest, so the
walk in stays short.

### 4. The pulse

Reach a source room and step onto the pulsing glyph. The spiral of numbers wipes
outward into the next level.

Cut it so the last frame matches the first. No caption needed — it carries itself.

### 5. CRT decay

Open `PREFS` and walk every dial that changes the look: `CRT NOISE` 0 to 5 so the
picture degrades live, `BURN-IN` on so the title ghosts in behind the menu, `TINT`
amber to green, and `MODE` to light, which inverts the whole picture.

- **Caption:** "dial in the decay."
- `MODE` goes last: inverting the picture is the biggest jump of the four.

### 6. Jukebox

`PREFS` → `JUKEBOX`. No maze, just the transmitter and the scrolling waterfall. Let it
run. This is the one clip worth explicitly asking for headphones on.

The picker panel is part of jukebox mode and stays on screen the whole time, so
the take is the panel over the waterfall — frame it as the instrument it is
rather than expecting a clean transmitter shot.

### 7. Title and burn-in

The title splash with the phosphor burn-in settling in. Short, no gameplay.

### 8. Trailer

Assemble in this order: 7 → 1 → 5 → 3 → 4, then hold on the title with the play URL.
Clip 3 appears twice — how the room looked, cut straight to how it came back, with
its caption split across the two. Played whole, the walk out and back eats twenty
seconds of a forty-second trailer; cut together, the two states of one room stand
side by side, which is the whole point.
Aim for about 45 seconds. A second or two over is not worth a recut — retime from the
tables in `post.sh` if it matters. The first five seconds decide whether the rest is
watched.

Clip 2 is deliberately absent. Its beat is a number that fails to arrive, which needs
more setup than a trailer segment can give it and reads as nothing happening without
one.

## Post

`./post.sh` cuts everything in `clips/` into `clips/out/`: each clip trimmed to its
beat with its caption burned in, 9:16 versions, looping GIFs, and the trailer. It is
re-runnable and overwrites its own output, so a re-shot take just needs another pass.

The trim windows and the trailer's running order live in the tables at the top of
`post.sh` — retime a clip by editing the numbers there, not by re-recording.

- **Vertical (9:16)** cuts of clips 1, 3 and 4 for short-video feeds. **Pad** the 4:3
  frame rather than cropping — the HUD carries the digit count and the waterfall, and
  cropping to vertical throws away the part that makes the clip legible. The caption
  moves into the black band below the frame, where it covers nothing.
- **Looping GIF** from clips 1 and 4 for the itch page and README, held to a few
  seconds so the file stays light enough to autoplay.
- **Static frames** for stills: the deepest level reachable via `LEVEL` with `CRT NOISE`
  high makes the most striking screenshot.

# Mobile transition — spec sheet

The settled half of `MOBILE-PLAN.md`, written as buildable specification. Every
item here is one I would start today without another decision from you: the
current value is measured, the target is exact, and the acceptance test is
something a machine can check.

**What this excludes, deliberately:** the portrait receiver deck, haptics on
capture, the portrait-vs-landscape default posture, and the DPR cap value. Those
are open design questions in `MOBILE-PLAN.md` §4 and none of them are specified
here. Nothing below depends on how you answer them.

---

## Baseline

Measured on `claude/mobile-game-optimization-zpi4h2`, commit at time of writing.

| Property | Value |
| --- | --- |
| Test suite | **117 tests, 117 pass, 0 fail** (after `npm ci`) |
| Canvas buffer | fixed `800 x 600`, 4:3 |
| Character grid | `23 x 20` (`GRID` 23 x 17 maze + `HUD_ROWS` 3) |
| Cell size | `CHAR.W` 34.78 px, `CHAR.H` 30 px, `CHAR.FONT` 28 px |
| Voice bank | 60 files, mono 24 kHz 16-bit, 1.43 s, ~68.4 KB each — **3.1 MB** |
| Runtime assets in zip | `index.html`, `styles.css`, `src/`, all of `assets/` |
| Per-frame CPU readback | `800 x 600 x 4` = **1.92 MB** |
| rAF loops | **2** (game loop in `main.js`, filter loop in `CRTFilter.js`) |

`GRID` (23 x 17) is load-bearing — `maze/cell.js` generates rooms against it and
the golden path derives from it. **No item in this spec changes `GRID`.** Any
change that would alter a seed's maze is out of scope by construction.

---

## Build order

Three items are coupled and the order is not free:

```
S-01 (drop CRT readback)  ──┐
                            ├──►  S-02 (drop willReadFrequently)
S-05 (renderStatic blit)  ──┘
```

`willReadFrequently: true` makes the 2D canvas CPU-backed. `putImageData` — the
only call in the codebase that benefits from that — lives in `renderStatic`. So
S-02 cannot land until S-01 has removed the last `getImageData` **and** S-05 has
removed the last `putImageData`. Landing S-02 early would trade one slow path for
another.

Everything else is independent and can go in any order, in parallel, as separate
atomic commits.

---

## S-01 — Remove the CRT filter's per-frame canvas readback

**File:** `src/lib/CRTFilter.js:226,229`

**Now**

```js
const ctx = this.sourceCanvas.getContext('2d');
const imageData = ctx.getImageData(0, 0, this.sourceCanvas.width, this.sourceCanvas.height);
this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, imageData);
```

**Target**

```js
this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.sourceCanvas);
```

`HTMLCanvasElement` is a valid `TexImageSource`; the `ImageData` hop is a GPU →
CPU → GPU round trip of 1.92 MB per frame that buys nothing.

**Acceptance**

- `grep -c getImageData src/` returns 0.
- Filter output is pixel-identical at `?seed=` fixed, CRT on, comparing a captured
  frame before and after.
- No `WebGL: INVALID_VALUE` in console.

**Verify explicitly:** `start()` detaches `sourceCanvas` from the DOM
(`this.sourceCanvas.remove()`, line 257). A detached canvas keeps its backing
store and remains a valid texture source — confirm this on a real iOS Safari
build, not only desktop Chrome, before calling the item done.

**Risk:** low. **Reverts cleanly:** yes, single hunk.

---

## S-02 — Drop `willReadFrequently`

**File:** `src/main.js:19-20`

**Now**

```js
// willReadFrequently: the CRT filter reads the canvas back every frame.
const ctx = canvas.getContext("2d", { willReadFrequently: true });
```

**Target**

```js
const ctx = canvas.getContext("2d");
```

The flag instructs the browser to stop hardware-accelerating the 2D context so
reads are cheap. After S-01 and S-05 nothing reads. Published measurements put
the trade at roughly −2 ms on reads against +35 ms on draws; this codebase draws
~460 glyphs a frame plus a waterfall and pays that on every one.

**Depends on:** S-01 and S-05, both landed.

**Acceptance**

- Comment on line 19 removed with the flag (it documents a behaviour that no
  longer exists).
- Frame time at CRT-on, level 1, measured over 300 frames on a 4x-throttled CPU
  profile, is **lower** than baseline. This is the item's whole justification —
  if it does not measure faster, do not keep it.

**Risk:** medium — it is the item most likely to surprise, because the win is
platform-dependent. Measure on Android Chrome and iOS Safari separately.

---

## S-03 — Cache the shader uniform locations

**File:** `src/lib/CRTFilter.js:233-248`

**Now:** 16 `getUniformLocation` string lookups per frame, one per uniform.

**Target:** resolve all 16 once after `createProgram()` into a `this.uniforms`
map; the render loop reads properties.

**Acceptance**

- `getUniformLocation` appears only in the init path, never inside `renderCRT()`.
- Output pixel-identical.

**Risk:** none. **Note:** small win in absolute terms — it is here because it is
free and it is in the same function S-01 touches.

---

## S-04 — One requestAnimationFrame loop

**Files:** `src/lib/CRTFilter.js:251,258`, `src/main.js:frame()`

**Now:** `renderCRT()` self-schedules an independent rAF. Two loops drive one
display, so the filter can present a game frame that is half-drawn.

**Target:** `CRTFilter` exposes a synchronous `draw()`; `main.js` calls it as the
final statement of `frame()`, after every render pass including `renderBurnIn`.
`start()`/`stop()` keep their DOM-swap behaviour and set a flag `frame()` reads.

**Acceptance**

- `requestAnimationFrame` appears exactly once in `src/`.
- CRT toggle (`C` key and the `CRT FX` menu row) still swaps canvases correctly
  in both directions, and `applyCrt()` needs no change.
- Burn-in still composites over the filtered image, not under it.

**Risk:** medium — `start()`/`stop()` currently own the animation-frame id as
their liveness flag. That coupling has to be replaced, not just cut.

---

## S-05 — Cheap transition static

**File:** `src/render/render.js:268-286`

**Now:** every frame of every 260 ms cell crossing allocates a fresh `800 x 600`
`ImageData` (1.92 MB), runs 120 000 loop iterations, writes 480 000 pixels, and
`putImageData`s the result.

**Target:** one module-level offscreen canvas, allocated once, at **200 x 150**
(a quarter linear, matching the existing 2x2 quantisation so the snow's apparent
grain is unchanged). Fill it, then `drawImage` it scaled to full size. The
existing comment already states coarse snow is the intent — this makes the
implementation say so too.

**Acceptance**

- No `createImageData` or `putImageData` anywhere in `src/`.
- Allocation happens once, not per frame — assert via a counter in a test or by
  hoisting it to a named module constant reviewers can see.
- Visual: the wash still reads as tinted snow at both `TINT` values and in both
  `MODE` values. `image-rendering: pixelated` is already set, so the upscale is
  nearest-neighbour and stays in style.

**Risk:** low, but it is the one item here with a **visible** result. Get a
before/after capture signed off before it lands.

---

## S-06 — Transcode the voice bank

**Files:** `assets/audio/*.wav` (60 files), `src/audio/station.js:401`

**Now:** mono 24 kHz 16-bit WAV, 1.43 s, ~68.4 KB each. **3.1 MB total.**

**Target:** AAC-LC mono `.m4a`, 32 kbps, 24 kHz. ~5.7 KB each, **~340 KB total** —
a ~9x reduction.

| Decision | Value | Why |
| --- | --- | --- |
| Codec | **AAC-LC**, not Opus | Safari's `decodeAudioData` history with Opus is uneven across container formats; AAC in `.m4a` decodes everywhere the game runs. |
| Bitrate | 32 kbps mono | `buildVoiceBus` lowpasses at **2700 Hz** and the hiss bed at 2500 Hz. Everything a codec discards above that, the design already discarded. |
| Sample rate | 24 kHz (unchanged) | Matches the source; no resample artefacts. |

`loadDigits()` line 401 changes `.wav` → `.m4a`. Keep the WAVs in the repo as the
mastering source; exclude them from the package (see S-08).

**Acceptance**

- `normalize_voices.py` grows a transcode step so the bank is reproducible, not
  hand-converted.
- All 60 files decode via `decodeAudioData` on iOS Safari, Android Chrome, and
  desktop Firefox — a decode failure is silent in `playDigit()` (`if (!buf) return`),
  so this must be checked directly, not by ear.
- A/B listen at `VOLUME 5` with `CRT NOISE 0`: no audible difference through the
  band-limited chain.

**Risk:** medium. The silent-failure path in `playDigit` means a bad transcode
degrades to *the station stops saying some numbers*, which is indistinguishable
from the game working. Do not ship this on a listen test alone.

---

## S-07 — Load English first

**File:** `src/audio/station.js:106-107,395-409`

**Now**

```js
await loadDigits();   // all 60 files, all six languages
scheduleNext();       // first digit only after every one lands
```

Levels 1–3 are `english` only (`levels.js:139-141`). 50 of those 60 files are for
content the player cannot reach yet, and the cold open — the `MOVE TO BEGIN`
banner over a station that is meant to already be transmitting — plays over
silence for as long as the network takes.

**Target**

```js
await loadLanguage("english");   // 10 files
scheduleNext();                  // station is live
loadRemaining();                 // unawaited; fills in behind play
```

**Acceptance**

- Time-to-first-digit on a throttled *Fast 3G* profile drops from
  "all 3.1 MB" to "the English bank only" — with S-06 that is ~57 KB.
- `debug().langsLoaded` reaches 6 without a reload.
- Reaching level 4 (`spanish`) before the background load finishes must not go
  silent. `playDigit` already returns early on a missing buffer, so **this is the
  one case that needs new behaviour**: either await the level's language on
  `setLevel`, or prioritise the next level's bank in the background queue. Specify
  before building; do not leave it to the early-return.

**Risk:** medium — the level-4 race above is a real hole, not a hypothetical.

**Test:** `tests/station-load.test.mjs` — a fake fetch asserting English resolves
and `scheduleNext` fires before the other five languages settle. Fails before,
passes after, per `CLAUDE.md`.

---

## S-08 — Trim the package

**File:** `package.sh:11`

**Now:** `RUNTIME=(index.html styles.css src assets)` zips all of `assets/`,
including `VT323-Regular.ttf` (153 KB) and `vt323-subset.woff2` (7.9 KB). Neither
is referenced by the game — `styles.css` loads `station-grid.woff2`. They serve
`promo.html` and `docs/` only. **161 KB shipped to every player for nothing.**

**Target:** exclude the promo-only fonts and (after S-06) the WAV masters.

**Acceptance**

- A fresh unzip runs with no 404s in the network log.
- Zip size drops by 161 KB plus the WAV bank.
- `zip -sf dist/finding_numbers.zip` contains no file the game does not fetch.

**Risk:** low, but this is exactly the class of change that fails only in the
artifact and not in the dev tree — the Shipper's heartbeat finding in
`REVIEW-LOG.md` is the precedent. **Verify in a fresh unzip, not in `src/`.**

---

## S-09 — Resume audio on visibility change

**File:** `src/audio/station.js:82` (`arm()`), new listener

**Now:** `arm()` re-resumes the context on every input gesture, which is correct
as far as it goes. But iOS suspends the `AudioContext` whenever the page is
backgrounded, a call arrives, or the screen locks — and there is no
`visibilitychange` handler. The station stays dead until the player happens to
tap. In a game where the audio is the only compass, that is the game broken, not
degraded.

**Target:** on `visibilitychange` → visible, and on `pageshow`, call `ctx.resume()`
when `ctx.state` is `suspended` **or** `interrupted`.

`interrupted` is a WebKit-only state that is not in the spec's enum. Check for it
by string comparison; do not switch exhaustively over the standard states.

**Acceptance**

- Background the tab for 30 s on a real iPhone, return without touching the
  screen — the station is speaking within one readout interval.
- Same across an incoming call and a screen lock/unlock.
- `debug().ctxState` reads `running` after return.

**Risk:** low. **Priority: high** — this is a one-function fix for a bug that
silences the compass, and it is independent of every other item.

---

## S-10 — Screen wake lock

**Files:** `src/main.js` (acquire on first gesture), new listener

**Now:** none. At `CALM` cadence a 10-digit message takes 10–40 s to read once;
iOS auto-lock bottoms out at 30 s. The core instruction is *take a turn, then
listen* — hold still, touch nothing — which is precisely what the OS reads as
idle.

**Target:** `navigator.wakeLock.request("screen")` on the first user gesture,
re-acquired on `visibilitychange` → visible (the lock is released when the page
hides and does **not** return by itself).

Feature-detect and no fallback, per the project's one-path rule — the game is
correct without a wake lock, merely interrupted. Support is Safari 16.4+ /
Chrome 84+, ~94 % global.

**Acceptance**

- Idle on a real iPhone for 60 s at level 1 without touching the screen: display
  stays lit, station keeps reading.
- On an unsupporting browser, no console error and no behaviour change.

**Risk:** low.

---

## S-11 — CSS and viewport hardening

**Files:** `index.html:5`, `styles.css:25,32,36,51`

Independent of any layout redesign — these are correct for the current fixed-buffer
layout and stay correct under any of the §4 outcomes.

| Now | Target | Fixes |
| --- | --- | --- |
| `content="width=device-width, initial-scale=1"` | `+ viewport-fit=cover` | Enables `env(safe-area-inset-*)` |
| `height: 100%` on `html, body` | `height: 100dvh` | iOS Safari's collapsing URL bar changes the viewport under a layout that cannot hear about it |
| `width: min(100vw, 128vh)` | `min(100vw, 128dvh)` | same |
| `touch-action: none` on `#stage` | also on `body` | Gestures outside the stage box |
| — | `overscroll-behavior: none` on `html, body` | Android Chrome pull-to-refresh, live directly over the "north" tap zone |
| — | `user-select: none`, `-webkit-user-select: none` | 150 ms hold-to-walk raises the selection UI |
| — | `-webkit-touch-callout: none` | Same hold raises the iOS callout menu |
| — | `-webkit-tap-highlight-color: transparent` | Grey flash box on every step |
| — | `padding: env(safe-area-inset-*)` on `#stage` | Notch and home indicator |

**Acceptance**

- On a real iPhone, a 3-second press anywhere on the canvas produces no callout,
  no selection, no highlight — and walks continuously.
- On Android Chrome, a downward drag from the top of the screen steps the player
  north and does **not** trigger pull-to-refresh.
- Nothing is clipped by the notch or the home indicator in either orientation.
- `dvh` is Safari 15.4+ / Chrome 108+; no fallback needed at current support.

**Risk:** low. **Note:** this is the highest ratio of felt improvement to lines
changed in the whole spec.

---

## S-12 — Correct the documented controls

**File:** `README.md:97`

`README.md` says PREFS is "**[P]** (top-right corner)". `PREFS_BTN` is
`{ x: 18 * CHAR.W, y: 17 * CHAR.H }` — columns 18–22 of rows 17–19, the
**bottom-right**. The on-screen box is labelled `PREFS`, not `[P]`.

Fix both, then run the section through the `honest-copy` and `humanized-copy`
gates. `ITCH-PAGE.md:35` says "tap the screen edges" for movement; the zones are
the four triangles cut by the screen diagonals, which is not the same claim.

**Risk:** none. **Note:** it is a factual error in player-facing text, so it is in
this spec rather than waiting for the layout work.

---

## Measurements to take before any of this lands

So the claims above can be checked rather than believed:

1. **Frame time**, 300 frames, CRT on, level 1, 4x CPU throttle — for S-01/02/03/04.
2. **Frame time during a cell crossing** specifically — for S-05, which only costs
   anything for 260 ms at a time.
3. **Time to first audible digit**, Fast 3G profile — for S-06/07.
4. **Transferred bytes to interactive**, and packaged zip size — for S-06/08.
5. **Battery drain over 10 minutes** on a real mid-range Android, CRT on — the
   aggregate number that S-01 through S-05 exist to move.

Items 1–4 are scriptable with Playwright against `run.sh`; `capture.sh` already
does the harness half. Item 5 needs a real device.

---

## Definition of done, per item

- Atomic commit, Conventional Commits prefix (`perf`, `fix`, `chore`, `docs`).
- `npm test` green — **117 baseline**, plus any test the item adds.
- New behaviour carries a test that fails before and passes after (`CLAUDE.md`).
- Nothing touches `GRID`, `.scaffold.json`, or any generated maze.
- Anything visible has a before/after capture.

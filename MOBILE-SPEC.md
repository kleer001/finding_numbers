# Mobile transition — spec sheet

The settled half of `MOBILE-PLAN.md`, at implementation depth. Every item states
the exact current code, the exact target, the test cases, and the edge cases that
will bite. Nothing here needs another decision from you before it can be built.

**Excluded deliberately:** the portrait receiver deck, haptics on capture, the
portrait-vs-landscape default posture, and the DPR cap value — the open design
questions in `MOBILE-PLAN.md` §4. No item below depends on how you answer them.

---

## Baseline

| Property | Value |
| --- | --- |
| Test suite | **117 tests, 117 pass, 0 fail** (after `npm ci`) |
| Canvas buffer | fixed `800 x 600`, 4:3 |
| Character grid | `23 x 20` (`GRID` 23 x 17 maze + `HUD_ROWS` 3) |
| Cell size | `CHAR.W` 34.78 px, `CHAR.H` 30 px, `CHAR.FONT` 28 px |
| Voice bank | 60 files, mono 24 kHz 16-bit, 1.43 s, ~68.4 KB each — **3.1 MB** |
| Authored levels | `TABLE.length` = 12; levels 13+ generated |
| Language schedule | L1–3 `english`, L4 `spanish`, L5 `italian`, L6 `japanese`, L7 `chinese`, L8 `hindi`, L9 `spanish`, L10 `italian`, L11 `chinese`, **L12+ `babel`** |
| Per-frame CPU readback | `800 x 600 x 4` = **1.92 MB** |
| rAF loops | **2** (`main.js: frame()`, `CRTFilter.js: renderCRT()`) |

`GRID` (23 x 17) is load-bearing — `maze/cell.js` generates rooms against it and the
golden path derives from it. **No item in this spec changes `GRID`**, so no item
can alter a seed's maze.

---

## Build order

```
S-01 (drop CRT readback)   ──┐
                             ├──►  S-02 (drop willReadFrequently)
S-05 (static via offscreen) ──┘
```

`willReadFrequently: true` makes the **main** canvas CPU-backed. S-02 cannot land
until the main canvas is free of both `getImageData` (S-01) and `putImageData`
(S-05). Note the precision: S-05 keeps a `putImageData`, but moves it onto a small
offscreen context that carries no such flag. What matters is the flagged canvas.

S-06 → S-07 (transcode before changing what is fetched) and S-06 → S-08 (transcode
before excluding the WAVs from the zip). Everything else is independent.

---

## S-01 — Remove the CRT filter's per-frame canvas readback

**File:** `src/lib/CRTFilter.js:224-229`

### Now

```js
renderCRT() {
    if (!this.sourceCanvas) return;
    const ctx = this.sourceCanvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, this.sourceCanvas.width, this.sourceCanvas.height);

    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, imageData);
```

### Target

```js
renderCRT() {
    if (!this.sourceCanvas) return;

    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, false);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.sourceCanvas);
```

`HTMLCanvasElement` is a valid `TexImageSource`. The `ImageData` hop is a
GPU → CPU → GPU round trip of 1.92 MB per frame that buys nothing.

### Edge cases

1. **Orientation.** `ImageData` and `HTMLCanvasElement` upload with the same row
   order — WebGL's `UNPACK_FLIP_Y_WEBGL` defaults to `false` for both. The explicit
   `pixelStorei` above is belt-and-braces; drop it if the vertex shader already
   flips. **If the image appears upside-down after this change, that is the cause** —
   fix it at the `pixelStorei`, not in the shader.
2. **Detached source.** `start()` calls `this.sourceCanvas.remove()` (line 257), so
   the texture source is a canvas outside the document. A detached canvas retains
   its backing store and stays a valid `TexImageSource`. **Confirm on real iOS
   Safari, not only desktop Chrome** — this is the single assumption in the item.
3. **Alpha.** The 2D context is opaque in practice (`render()` fills the full rect
   first) but is not created with `alpha: false`. Uploading a canvas uses its
   premultiplied alpha; `ImageData` does not. If any pass ever leaves alpha < 255,
   colour will shift. Today none does — `renderBlank`, `render`, `renderJukebox`,
   and `renderTitle` all `fillRect` the full canvas opaquely.

### Acceptance

- `grep -rn getImageData src/` returns nothing.
- Pixel-identical output: capture frame 120 at `?seed=` fixed, CRT on, `CRT NOISE 0`,
  before and after; images must be byte-identical after PNG normalisation.
- No `WebGL: INVALID_VALUE` or `INVALID_OPERATION` in console over 300 frames.

**Risk:** low. **Rollback:** single hunk.

---

## S-02 — Drop `willReadFrequently`

**File:** `src/main.js:19-20`

### Now

```js
// willReadFrequently: the CRT filter reads the canvas back every frame.
const ctx = canvas.getContext("2d", { willReadFrequently: true });
```

### Target

```js
const ctx = canvas.getContext("2d");
```

Delete the comment with the flag — it documents a behaviour that no longer exists.

The flag instructs the browser to stop hardware-accelerating the 2D context so
reads are cheap. After S-01 and S-05 nothing reads the main canvas. Published
measurements put the trade at roughly −2 ms on reads against +35 ms on draws; this
codebase draws ~460 glyphs a frame plus a waterfall and pays that cost on each.

**Depends on:** S-01 and S-05, both landed and verified.

### Not affected

`makeLayer()` (`main.js:25-31`) creates the `oldLevel` / `newLevel` snapshot
contexts without the flag already, and they are only ever `drawImage` sources. No
change.

### Acceptance

- Frame time over 300 frames, CRT on, level 1, 4x CPU throttle, measured on
  **Android Chrome and iOS Safari separately**, is lower than baseline.
- **This is the item's entire justification.** If it does not measure faster on a
  given platform, that is a finding, not a nuisance — record it and consider
  reverting rather than shipping it on faith.

**Risk:** medium — the win is platform-dependent. **Rollback:** single hunk.

---

## S-03 — Cache the shader uniform locations

**File:** `src/lib/CRTFilter.js:233-248`

### Now

16 `getUniformLocation` string lookups per frame — `u_time`, `u_barrel`,
`u_aberration`, `u_noise`, `u_tearing`, `u_glow`, `u_jitter`, `u_retrace`,
`u_dotMask`, `u_brightness`, `u_contrast`, `u_desaturation`, `u_flicker`,
`u_scanlineIntensity`, `u_curvature`, `u_signalLoss`.

### Target

Resolve once at the end of `initShaders()`, after `createProgram()`:

```js
const UNIFORMS = [
    "u_time", "u_barrel", "u_aberration", "u_noise", "u_tearing", "u_glow",
    "u_jitter", "u_retrace", "u_dotMask", "u_brightness", "u_contrast",
    "u_desaturation", "u_flicker", "u_scanlineIntensity", "u_curvature", "u_signalLoss",
];

this.uniforms = Object.fromEntries(
    UNIFORMS.map((n) => [n, this.gl.getUniformLocation(this.program, n)]),
);
```

Render loop then reads `this.uniforms.u_barrel` etc.

### Edge case

`getUniformLocation` returns `null` for a uniform the GLSL compiler optimised away.
`uniform1f(null, x)` is a silent no-op, which is the same behaviour as today — do
**not** add a throw here. Preserving the existing tolerance is the point.

### Acceptance

- `getUniformLocation` appears only inside `initShaders()`.
- Output pixel-identical (same capture protocol as S-01).
- `CRT NOISE` dial 0→5 still changes the picture, proving `applyCrtNoise()`'s
  `Object.assign(crt.config, ...)` still reaches the render loop.

**Risk:** none. Included because it is free and sits in the function S-01 touches.

---

## S-04 — One requestAnimationFrame loop

**Files:** `src/lib/CRTFilter.js:251,253-261`, `src/main.js:frame()`

### Now

`renderCRT()` self-schedules (`CRTFilter.js:251`) and `start()` uses
`this.animationFrameId` as its liveness flag. Two loops drive one display, so the
filter can sample a game frame mid-draw.

### Target

**`CRTFilter.js`**

```js
draw() {                      // was renderCRT(), minus the self-schedule
    if (!this.running || !this.sourceCanvas) return;
    /* ... texture upload + uniforms + drawArrays, unchanged ... */
}

start() {
    if (this.running) return;
    this.running = true;
    this.sourceCanvas.parentNode.insertBefore(this.glcanvas, this.sourceCanvas);
    this.sourceCanvas.remove();
}

stop() {
    if (!this.running) return;
    this.running = false;
    this.glcanvas.parentNode.replaceChild(this.sourceCanvas, this.glcanvas);
    this.sourceCanvas.style.display = '';
}
```

**`main.js`** — call `crt?.draw()` as the last statement before every
`requestAnimationFrame(frame)`.

### The edge case that will break a naive fix

`frame()` has **two** `requestAnimationFrame(frame)` call sites, not one. The
title-screen branch returns early:

```js
  if (title.open) {
    renderTitle(...);
    ...
    if (prefs.burnIn) renderBurnIn(...);
    requestAnimationFrame(frame);      // <-- early return path
    return;
  }
```

Appending `crt.draw()` only at the bottom of `frame()` leaves **the title screen
unfiltered** — the splash is where most players first see the CRT effect. Either
call `crt?.draw()` at both sites, or restructure `frame()` to a single exit. The
single exit is preferable and is a small refactor: hoist the title branch into a
`renderFrame()` that returns, and keep `frame()` as
`renderFrame(); crt?.draw(); requestAnimationFrame(frame);`.

Ordering within a frame is fixed: **`renderBurnIn` must run before `crt.draw()`**,
so burn-in is composited into the source the filter samples. That is the current
behaviour (`renderBurnIn` writes to the 2D canvas the filter reads) and it must
survive.

### Not affected

`input.js: toCanvas()` resolves `document.querySelector("#stage canvas")` every
call, so it follows whichever canvas is mounted. No change needed.

### Acceptance

- `grep -rn requestAnimationFrame src/` returns exactly one call site.
- CRT toggles correctly both directions via the `C` key **and** the `CRT FX` menu
  row, from the title screen and from gameplay, without `applyCrt()` changing.
- The title splash is filtered when CRT is on.
- Burn-in still composites over the filtered image.

**Risk:** medium — `start()`/`stop()` currently overload `animationFrameId` as
their state flag. That coupling must be replaced, not merely cut.

---

## S-05 — Transition static via a small offscreen

**File:** `src/render/render.js:268-286`

### Now

```js
export function renderStatic(ctx, t, rgb) {
  const img = ctx.createImageData(CANVAS.W, CANVAS.H);   // 1.92 MB, every frame
  ...
  for (let y = 0; y < CANVAS.H; y += 2) {
    for (let x = 0; x < CANVAS.W; x += 2) {              // 120 000 iterations
      ...                                                 // writes 4 px each
    }
  }
  ctx.putImageData(img, 0, 0);
}
```

Runs every frame for the 260 ms of **every single move**.

### Target — 400 x 300, which is pixel-identical

The current loop already writes 2 x 2 blocks of one value. A `400 x 300` buffer
blitted at 2x with smoothing off reproduces **exactly** the same output — same
grain, same quantisation — for a quarter of the pixel work and one allocation
instead of one per frame.

```js
// Allocated once. The snow is already written as 2x2 blocks of a single value, so
// a half-size buffer upscaled 2x with smoothing off is the same picture for a
// quarter of the work.
const SNOW_W = CANVAS.W / 2;   // 400
const SNOW_H = CANVAS.H / 2;   // 300
const snow = document.createElement("canvas");
snow.width = SNOW_W;
snow.height = SNOW_H;
const snowCtx = snow.getContext("2d");
const snowImg = snowCtx.createImageData(SNOW_W, SNOW_H);

export function renderStatic(ctx, t, rgb) {
  const rm = rgb[0] / 255, gm = rgb[1] / 255, bm = rgb[2] / 255;
  const d = snowImg.data;
  const bias = 90 * (1 - Math.abs(0.5 - t) * 2);
  for (let i = 0; i < d.length; i += 4) {
    const v = (((Math.random() * 160 + bias) / 64) | 0) * 64;
    d[i] = (v * rm) | 0;
    d[i + 1] = (v * gm) | 0;
    d[i + 2] = (v * bm) | 0;
    d[i + 3] = 255;
  }
  snowCtx.putImageData(snowImg, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(snow, 0, 0, CANVAS.W, CANVAS.H);
}
```

**`imageSmoothingEnabled = false` is required, not cosmetic.** The 2D context
defaults it to `true`; leaving it on blurs the snow into grey mush and loses the
coarse quantisation the existing comment calls for.

### Interaction with S-02

The remaining `putImageData` is on `snowCtx`, a separate offscreen context created
without `willReadFrequently`. The **main** canvas now only receives `drawImage`,
which is what unblocks S-02.

### Edge case

`ctx.imageSmoothingEnabled` is sticky on the context. `renderSpiralWipe` and
`render` also call `drawImage` (the level snapshots) — those blit 1:1 at full size,
where the smoothing flag has no visible effect. No restore needed, but say so in a
comment so the next reader does not have to re-derive it.

### Acceptance

- No `createImageData` or `putImageData` anywhere in `src/render/render.js` outside
  the module-level allocation.
- Allocation is module-level and provably once.
- Visual: snow still reads as tinted, coarse, and brightest at mid-transition, at
  both `TINT` values and both `MODE` values. **Get a before/after capture signed
  off** — this is the only item in the spec with a visible result.

**Risk:** low, visible.

---

## S-06 — Transcode the voice bank

**Files:** `assets/audio/*.wav` (60), `src/audio/station.js:401`, `normalize_voices.py`

### Now

Mono 24 kHz 16-bit WAV, 1.43 s, ~68.4 KB each. **3.1 MB total.**

### Target

AAC-LC mono `.m4a`, 32 kbps, 24 kHz. ~5.7 KB each, **~340 KB total** — ~9x smaller.

| Decision | Value | Why |
| --- | --- | --- |
| Codec | **AAC-LC**, not Opus | Safari's `decodeAudioData` history with Opus is uneven across containers. AAC in `.m4a` decodes everywhere this game runs. |
| Bitrate | 32 kbps mono | `buildVoiceBus` lowpasses at **2700 Hz**, the hiss bed at 2500 Hz. Everything a codec discards up there, the design already discarded. |
| Sample rate | 24 kHz, unchanged | Matches the source; no resample artefacts. |

```sh
ffmpeg -i "$in" -c:a aac -b:a 32k -ac 1 -ar 24000 -movflags +faststart "$out"
```

`station.js:401` changes `.wav` → `.m4a`. Keep the WAVs in the repo as mastering
masters; exclude them from the package (S-08).

### Pipeline placement

`normalize_voices.py` overwrites WAVs in place and is re-runnable — it must stay
the lossless stage. Transcoding belongs **after** it, as a separate step writing
`.m4a` alongside, so normalisation is never applied to a lossy file. Add it as a
new script or a `--transcode` flag; do not fold it into the normalise loop.

### Edge case: encoder delay

AAC encoders prepend ~1024–2112 priming samples, which `decodeAudioData` surfaces
as up to ~90 ms of leading silence at 24 kHz. The station schedules by gaps rather
than sample-accurately, and the assets already carry leading silence, so this is
very likely inaudible — but it is a real change to when a digit starts speaking
relative to `duckFor(buf.duration)`. **Measure `buf.duration` before and after** on
one file; if it has grown, decide whether to trim.

### The failure mode that makes this medium risk

`playDigit` line 411: `if (!buf || !voiceIn) return;`. A file that fails to decode
degrades to **the station silently skipping that digit** — indistinguishable from
the game working correctly. A listen test cannot catch this.

### Acceptance

- Transcode is scripted and reproducible from the WAV masters.
- **All 60 files verified to decode** via `decodeAudioData` on iOS Safari, Android
  Chrome, and desktop Firefox — assert the returned `AudioBuffer` for each, do not
  listen for it.
- `debug().langsLoaded === 6`.
- A/B at `VOLUME 5`, `CRT NOISE 0`: no audible difference through the band-limited
  chain.

**Risk:** medium, because it fails silently.

---

## S-07 — Load English first, and never go silent

**File:** `src/audio/station.js:106-107, 395-409`

### Now

```js
await loadDigits();   // all 60 files, all six languages
scheduleNext();       // first digit only after every one lands
```

Levels 1–3 are `english`. 50 of the 60 files are for content the player cannot
reach, and the cold open — `MOVE TO BEGIN` over a station meant to be already
transmitting — plays over silence for as long as the network takes.

### Two holes a naive "English first, rest in background" leaves

1. **Level 4 is `spanish`.** A fast player can arrive before the background load
   finishes.
2. **The jukebox is reachable at boot, and can pick anything.** `handleKey` opens
   PREFS on the title splash (`KeyP` while `title.open`), `JUKEBOX` is a `MENU_ROWS`
   entry, and `JB_LANGS` is `[...LANGUAGES, "babel"]`. A player who opens the
   jukebox on the splash and selects `hindi` hits the same `playDigit` early-return.
   **`babel` needs all six banks**, and it is also the language of level 12 onward.

Both land on `if (!buf) return` — the station goes quiet with no indication why.
That is worse than a slow load, because the game's whole instruction is *listen*.

### Target

```js
export function requestLanguage(lang)   // -> Promise, resolves when that bank is decoded
export function languageReady(lang)     // -> boolean, synchronous
```

- Boot: `await requestLanguage("english")`, then `scheduleNext()`, then kick the
  remaining five off unawaited.
- `setLevel` / `newMaze`: request the new level's `spec.language`, promoted to the
  front of the queue. `"babel"` requests all six.
- Jukebox: request `prefs.jbLang` on selection, same promotion.
- Dedupe: a second request for an in-flight language returns the same promise.

### The not-yet-loaded state must be visible, not silent

Substituting another language is not available — `progression.js:15` fixes `lang`
per digit at message creation, and *the transmission never lies* is a design law.
So the honest options are silence or an acknowledged wait, and the game already
owns the furniture for the second: the cold-open banner writes into the waterfall
box (`drawIntroBanner`), and `INTRO_MESSAGES` is exactly this register.

**Spec:** while the current readout's language is not ready, the waterfall box
shows a tuning message in place of the spectrogram. `ACQUIRING` / `TUNING` /
`STAND BY` — a receiver warming onto a band, which is what is literally happening.
This costs nothing in fiction and turns a silent bug into a diegetic beat.

### Acceptance

- Time-to-first-digit on a throttled *Fast 3G* profile drops from all 3.1 MB to the
  English bank alone — with S-06, ~57 KB.
- `debug().langsLoaded` reaches 6 without a reload.
- **Level 4 before background load completes** → banner shows, then digits speak.
  Never silence with a live spectrogram.
- **Jukebox `hindi` selected from the title splash at t=0** → same.
- **`babel` (level 12) with any bank missing** → same.

### Tests — `tests/station-load.test.mjs` (new)

Pure, against an injected fetch stub; no `AudioContext`.

1. `english resolves before the other five settle`
2. `scheduleNext fires once english is ready, not after all six`
3. `requestLanguage dedupes an in-flight request`
4. `babel requests all six languages`
5. `languageReady is false for a bank still in flight`

Fails before, passes after, per `CLAUDE.md`.

**Risk:** medium. The two holes above are real, not hypothetical.

---

## S-08 — Trim the package

**File:** `package.sh:11`

### Now

```sh
RUNTIME=(index.html styles.css src assets)
```

Zips all of `assets/`, including `VT323-Regular.ttf` (153 KB) and
`vt323-subset.woff2` (7.9 KB). Neither is referenced by the game — `styles.css`
loads `station-grid.woff2`; those two serve `promo.html` and `docs/` only.
**161 KB shipped to every player for nothing**, plus (after S-06) 3.1 MB of WAV
masters.

### Target

Exclude promo-only fonts and the WAV masters:

```sh
zip -r "$OUT" "${RUNTIME[@]}" \
  -x '*.DS_Store' '**/.gitkeep' \
     'assets/fonts/VT323-Regular.ttf' 'assets/fonts/vt323-subset.woff2' \
     'assets/fonts/OFL.txt' 'assets/audio/*.wav'
```

**Keep `OFL.txt` if any shipped font derives from VT323.** `station-grid.woff2` is
built by `make_font.py` from VT323, so the SIL Open Font License requires the
notice to travel with it — check `make_font.py`'s provenance before excluding it.
Listed above as a placeholder to force that decision, not as a recommendation.

### Acceptance

- Fresh unzip, served statically: **zero 404s** in the network log across a full
  level-1 run with the jukebox opened.
- `zip -sf dist/finding_numbers.zip` lists no file the game does not fetch.
- Size drops by 161 KB (fonts) + ~3.1 MB (WAVs).

**Risk:** low, but this is the class of change that fails only in the artifact —
the Shipper's heartbeat finding in `REVIEW-LOG.md` is the precedent. **Verify in a
fresh unzip, not in the dev tree.**

---

## S-09 — Resume audio on visibility change

**File:** `src/audio/station.js` (new listener beside `arm()`)

### Now

`arm()` re-resumes on every input gesture, which is right as far as it goes. But
iOS suspends the context whenever the page is backgrounded, a call arrives, or the
screen locks — and there is no `visibilitychange` handler. The station stays dead
until the player happens to tap. Where the audio *is* the compass, that is the game
broken, not degraded.

### Target

```js
// iOS suspends the context on background, call, or screen lock and does not
// resume it by itself; `interrupted` is WebKit's own state for that and is not in
// the spec's enum, so it is matched by name rather than switched on.
function resumeIfInterrupted() {
  if (!ctx) return;
  if (ctx.state === "suspended" || ctx.state === "interrupted") ctx.resume();
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") resumeIfInterrupted();
});
window.addEventListener("pageshow", resumeIfInterrupted);
```

### Edge cases

1. `pageshow` fires on bfcache restore, where `visibilitychange` may not. Both are
   needed.
2. `resume()` returns a promise that rejects if called without a gesture on a
   context that was never unlocked. Guarding on `ctx` being non-null is sufficient —
   `ctx` only exists after `arm()` ran inside a gesture. Do not add a `.catch()`
   that swallows a real failure.
3. Do **not** call `arm()` here. `arm()` also runs `unmuteIOS()`, which plays an
   `<audio>` element — outside a gesture that will reject, and it is not what this
   handler is for.

### Acceptance

- Background a real iPhone for 30 s, return **without touching the screen** — the
  station speaks within one readout interval.
- Same across an incoming call and a screen lock/unlock.
- `debug().ctxState === "running"` after return.

**Risk:** low. **Priority: highest in the spec** — one function, fixes a bug that
silences the compass, independent of everything else.

---

## S-10 — Screen wake lock

**File:** `src/main.js`

### Now

None. At `CALM` cadence a 10-digit message takes 10–40 s to read once; iOS
auto-lock bottoms out at 30 s. The core instruction is *take a turn, then listen* —
hold still, touch nothing — which is exactly what the OS reads as idle.

### Target

```js
// The game asks the player to hold still and listen, which is what the OS reads
// as idle. Feature-detected with no fallback: without a lock the game is correct,
// merely interrupted.
let wakeLock = null;

async function holdWakeLock() {
  if (!navigator.wakeLock || wakeLock) return;
  wakeLock = await navigator.wakeLock.request("screen");
  wakeLock.addEventListener("release", () => { wakeLock = null; });
}
```

Call from the first user gesture (alongside `station.arm()` in `handleTap` /
`handleKey`) and again on `visibilitychange` → visible — **the lock is released
when the page hides and does not come back by itself.**

### Edge cases

1. `request()` rejects on a hidden document and on some low-power modes. It must be
   caught, because an unhandled rejection here would surface in the console on every
   backgrounded resume. This is the one place a `.catch()` is correct — the project's
   one-path rule concerns fallback logic, not an optional capability's rejection.
2. Support is Safari 16.4+ (fully 16.6+) / Chrome 84+, ~94 % global. A long-standing
   iOS bug broke it in installed PWAs until 18.4 — relevant only if the PWA work in
   `MOBILE-PLAN.md` Phase 3.4 ships.

### Acceptance

- Idle 60 s on a real iPhone at level 1 without touching the screen: display stays
  lit, station keeps reading.
- On an unsupporting browser: no console error, no behaviour change.
- After background/foreground, the lock is re-held (log `wakeLock !== null`).

**Risk:** low.

---

## S-11 — Viewport and touch CSS hardening

**Files:** `index.html:5`, `styles.css:23-36, 44-53`

Correct for the current fixed-buffer layout and still correct under any §4 outcome.

### index.html:5

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
```

### styles.css

```css
html,
body {
  height: 100dvh;                 /* not 100%: iOS Safari's URL bar collapses under a
                                     layout that has no way to hear about it */
  background: var(--bg);
  color: var(--amber);
  font-family: "Station Grid", "Courier New", monospace;
  overscroll-behavior: none;      /* Android Chrome pull-to-refresh sits directly
                                     over the north tap zone */
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;    /* 150 ms hold-to-walk is also a long-press */
  -webkit-tap-highlight-color: transparent;
}

#stage {
  min-height: 100dvh;
  padding: env(safe-area-inset-top) env(safe-area-inset-right)
           env(safe-area-inset-bottom) env(safe-area-inset-left);
  ...
}

#stage canvas {
  width: min(100vw, 128dvh);
  ...
}
```

### Rationale, per line

| Change | Fixes |
| --- | --- |
| `viewport-fit=cover` | Without it `env(safe-area-inset-*)` all resolve to `0px` |
| `100dvh` (three places) | URL-bar collapse resizing the viewport silently |
| `touch-action` on `body` | Currently `#stage` only; gestures outside the stage box |
| `overscroll-behavior: none` | Pull-to-refresh over the "north" input |
| `user-select`, `-webkit-user-select` | Hold-to-walk raising the selection UI |
| `-webkit-touch-callout: none` | Same hold raising the iOS callout menu |
| `-webkit-tap-highlight-color` | Grey flash box on every single step |
| `env(safe-area-inset-*)` padding | Notch and home indicator |

### Edge cases

1. **`padding` on `#stage` shrinks the box the canvas sizes against**, but the
   canvas sizes off `vw`/`dvh` (viewport), not the parent. In landscape with a notch
   the canvas can therefore overflow its padded parent. Either move the canvas to
   `width: min(100%, 128dvh)` so it respects the padding, or use `margin` on the
   canvas instead. **Decide this when writing it and note which**; it is the one
   place these declarations interact.
2. `dvh` is Safari 15.4+ / Chrome 108+. No fallback needed at current support, and a
   `vh` fallback line would violate the one-path rule for no live benefit.
3. `user-select: none` on `body` does not affect the canvas content (there is no
   selectable text), only the long-press selection gesture. Nothing regresses.

### Acceptance

- Real iPhone: a 3-second press anywhere on the canvas produces **no callout, no
  selection, no highlight**, and walks continuously.
- Android Chrome: a downward drag from the top of the screen steps the player north
  and does **not** trigger pull-to-refresh.
- Nothing clipped by the notch or home indicator, either orientation.
- Rotating with the URL bar collapsed does not letterbox or crop the canvas.

**Risk:** low. Highest ratio of felt improvement to lines changed in this spec.

---

## S-12 — Correct the documented controls

**Files:** `README.md:97`, `ITCH-PAGE.md:35`

`README.md` says PREFS is "**[P]** (top-right corner)". `PREFS_BTN` is
`{ x: 18 * CHAR.W, y: 17 * CHAR.H, w: 5 * CHAR.W, h: 3 * CHAR.H }` — columns 18–22
of rows 17–19, the **bottom-right**. The on-screen box reads `PREFS`, not `[P]`.

`ITCH-PAGE.md:35` says movement is "tap the screen edges". `tapZone` splits the
screen into four triangles by its diagonals — a tap anywhere moves you, including
dead centre. "Edges" is a different claim from what the code does.

Fix both, then run the sections through the `honest-copy` and `humanized-copy`
gates.

**Risk:** none. It is a factual error in player-facing text, so it does not wait
for the layout work.

---

## Measurements to take before anything lands

So the claims above are checked rather than believed.

| # | Measurement | Gates |
| --- | --- | --- |
| 1 | Frame time, 300 frames, CRT on, L1, 4x CPU throttle | S-01, S-02, S-03, S-04 |
| 2 | Frame time **during a cell crossing** | S-05 (only costs anything for 260 ms at a time) |
| 3 | Time to first audible digit, Fast 3G | S-06, S-07 |
| 4 | Bytes to interactive, and packaged zip size | S-06, S-08 |
| 5 | Battery drain over 10 min, real mid-range Android, CRT on | the aggregate S-01…S-05 exist to move |

1–4 are scriptable with Playwright against `run.sh`; `capture.sh` already has the
harness half. 5 needs a real device.

---

## Definition of done, per item

- Atomic commit, Conventional Commits prefix (`perf`, `fix`, `chore`, `docs`).
- `npm test` green — **117 baseline**, plus whatever the item adds.
- New behaviour carries a test that fails before and passes after (`CLAUDE.md`).
- Nothing touches `GRID`, `.scaffold.json`, or any generated maze.
- Anything visible carries a before/after capture.
- Anything mobile-specific is verified on a real device, not an emulator — S-06,
  S-07, S-09, S-10 and S-11 all have failure modes emulators do not reproduce.

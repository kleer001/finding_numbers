# Mobile plan

How `finding_numbers` becomes a game that was *made* for a phone rather than one
that merely runs on one. Findings are measured against the tree at
`claude/mobile-game-optimization-zpi4h2`; every number below came from reading the
shipped code, not from estimation.

---

## 1. Where it actually stands

The game does run on a phone today. What it does not do is fit one, sound right on
one, or stay cheap enough to run on one.

### It is a landscape game that opens in portrait

The canvas is a fixed `800x600` buffer (`config.js: CANVAS`) scaled by one CSS rule:

```css
#stage canvas { width: min(100vw, 128vh); height: auto; }
```

`128vh` is `96vh` at the 4:3 buffer ratio, so the canvas fills whichever axis runs
out first. On a phone that resolves very differently by orientation:

| Orientation | CSS viewport | Canvas lands at | Share of screen height |
| --- | --- | --- | --- |
| Portrait | 390 x 844 | 390 x 292 | **35 %** |
| Landscape | 844 x 390 | 499 x 374 | 96 % |

Landscape is close to correct. Portrait — which is how a phone is held unless the
game says otherwise, and there is nothing in the build that says otherwise — puts
the game in a 292 px strip with 550 px of black above and below it. For a game
whose argument is *the screen is a monitor you are inside*, two thirds of the
screen being nothing is the same damage the Shipper flagged for desktop in
`REVIEW-LOG.md` §3, still open on the platform where it is worst.

### Nothing responds to the device

There is no `resize`, `orientationchange`, `visibilitychange`, `matchMedia`, or
`devicePixelRatio` reference anywhere in `src/`, `index.html`, or `styles.css`.
Geometry is decided once, at module load, by constants. Rotating the phone
re-runs the CSS and nothing else.

### The glyphs are being resampled at a fractional ratio

In portrait a cell is `390 / 23 = 17.0` CSS px. At DPR 3 the 800 px backing store
is composited into 1170 device px — a **1.46x non-integer upscale** under
`image-rendering: pixelated`. Nearest-neighbour at 1.46x doubles some glyph stems
and not others, so letter weight varies across the row. The pixel font is being
fought by the scaler instead of served by it.

### The touch targets are at or under the guideline

`PREFS_BTN` is `174 x 90` canvas px. In portrait that composites to
**84.8 x 43.9 CSS px** — 43.9 against Apple's 44 pt minimum. It is the only
discrete control in the game and it is a rounding error under the floor.

The movement scheme is worse in a way size cannot fix: the screen is split into
four triangles by its diagonals (`input.js: tapZone`), so **the finger that moves
you covers the maze you are reading**. Hold-to-repeat fires every 150 ms, which
means during a walk the thumb is parked over the picture continuously. On a
desktop the mouse does not occlude anything; on a phone it is the primary
interaction and it hides the primary information.

### The station is silent until 3.1 MB arrives

`station.js: loadDigits()` fetches **all 60 WAV files across all six languages**
and `await`s every one before `scheduleNext()` runs:

```js
await Promise.all(jobs);   // 60 fetches
scheduleNext();            // first digit only after ALL of them land
```

The files are mono 24 kHz 16-bit, 1.43 s, ~68 KB each — **3.1 MB total**. Levels
1–3 are `english` only (`levels.js`), so 50 of those 60 files are for content the
player cannot reach yet. On a cellular connection the cold open — the banner that
says `MOVE TO BEGIN` over a station that is supposed to already be broadcasting —
plays over silence for several seconds. The one beat the game cannot afford to
miss is the one the network is holding.

The audio is also uncompressed for no benefit: the voice bus lowpasses at
**2700 Hz** (`buildVoiceBus`) and the hiss bed at 2500 Hz. Everything a codec
would throw away is already being thrown away by the design.

### The CRT filter is the most expensive thing on the device

Per frame, `CRTFilter.js: renderCRT()`:

1. `getImageData(0, 0, 800, 600)` — a **1.92 MB CPU readback** of the whole canvas.
2. `texImage2D(...)` — uploads it straight back to the GPU.
3. **16 `getUniformLocation` string lookups**, every frame, uncached.
4. `requestAnimationFrame` — a **second rAF loop**, independent of the game's.

The readback exists only because the source is passed as an `ImageData`.
`texImage2D` accepts an `HTMLCanvasElement` directly; the round trip is
avoidable in full.

Worse, the readback is why `main.js` opens the 2D context with
`willReadFrequently: true`. That flag is not free — it is an instruction to the
browser to **stop hardware-accelerating the 2D canvas** so that reads are cheap.
Measured elsewhere, it buys ~2 ms on the read and costs 35 ms+ on the draw. The
game is paying for software rasterisation of every glyph, every frame, to make a
readback fast that should not be happening at all.

And `render.js: renderStatic()` — the cell-crossing wash — allocates a fresh
`800x600` `ImageData` (1.92 MB) and runs 120 000 loop iterations **per frame** for
the 260 ms of every single move.

### Mobile browser chrome is unhandled

- No `overscroll-behavior` — Android Chrome pull-to-refresh is live over a game
  whose "up" input is a swipe-shaped tap at the top of the screen.
- No `user-select` / `-webkit-touch-callout` / `-webkit-tap-highlight-color` —
  a 150 ms hold-to-walk is also a long-press, which raises the iOS callout and
  the selection UI over the canvas.
- `touch-action: none` is on `#stage` only, not `body`.
- `height: 100%` and `vh` units, not `dvh` — on iOS Safari the collapsing URL bar
  changes the viewport under a layout that cannot hear about it.
- No `viewport-fit=cover`, no `env(safe-area-inset-*)` — nothing is told about the
  notch or the home indicator.

### iOS drops the audio and never picks it back up

`arm()` re-resumes the `AudioContext` on every input gesture, which is right. But
iOS suspends the context (state `interrupted`) whenever the page is backgrounded,
a call arrives, or the screen locks — and there is no `visibilitychange` handler,
so **the station stays dead until the player happens to tap something**. In a
game where the audio *is* the compass, coming back from a notification to a
silent radio is the game being broken, not degraded.

### The screen locks mid-readout

At `CALM` cadence a 10-digit message takes 10–40 s to read once. iOS auto-lock
bottoms out at 30 s. The game's core instruction is *take a turn, then listen* —
that is, hold still and touch nothing — which is exactly the behaviour the OS
reads as idle. There is no `wakeLock` call anywhere.

### The zip carries dead weight

`package.sh` zips all of `assets/`. `VT323-Regular.ttf` (153 KB) and
`vt323-subset.woff2` (7.9 KB) are used only by `promo.html` and `docs/` — never by
the game, which loads `station-grid.woff2`. **161 KB** ships to every mobile
player for nothing.

---

## 2. The decision this plan turns on

Portrait cannot be fixed by scaling. A 23-column grid on a 390 px phone gives a
17 px cell no matter what, and 17 maze rows plus 3 HUD rows is 20 rows — a 4:3
block on a 9:19.5 screen. There will always be leftover vertical space.

And `GRID` (23 x 17) is **load-bearing**: `maze/cell.js` builds rooms against it and
the golden path is generated from it. Changing it changes every seed. It stays.

So the question is not *how do we stretch the game to fill the phone* but
**what goes in the leftover rows**. My recommendation:

> **Portrait becomes a receiver.** The maze band (23 x 17) sits at the top under the
> safe area. The waterfall HUD expands beneath it. The remaining rows — roughly 10
> on a typical phone — become a drawn control deck in the same character grid, same
> font, same phosphor: a directional cross and the PREFS key, thumb-reachable at
> the bottom of the screen.

This is not a compromise dressed as a feature. It:

- **Frees the maze from the finger.** The thumb lives in the deck; the picture is
  never occluded. This is the single biggest playability change available.
- **Fills the screen honestly** — the void becomes hardware.
- **Costs nothing in fiction.** A shortwave set is a screen with a keypad under it.
  The game's own object gains a body.
- **Keeps the load-bearing rule.** One uniform character grid, one font, one size.
  `SCREEN.ROWS` grows; `GRID` does not move.

Landscape stays close to today's layout — it already fills 96 % of the height —
with the HUD given the horizontal room it gains.

The alternative worth naming and rejecting: a *rotate your device* prompt. It is
one afternoon of work versus several, and it is the answer that tells the player
their phone is wrong.

---

## 3. Phases

Ordered by dependency, not by appetite. Phase 0 must land before Phase 1, because
Phase 1 raises the pixel count and Phase 0 is what makes pixels affordable.

### Phase 0 — Make a frame cheap (no visible change)

Nothing here alters a single drawn pixel. It is the budget the rest is spent from.

1. **Kill the CRT readback.** Pass `this.sourceCanvas` to `texImage2D` directly
   instead of `getImageData` output. Removes 1.92 MB of CPU round-trip per frame.
2. **Drop `willReadFrequently`.** Once (1) lands nothing reads the canvas back, and
   the 2D context can be hardware-accelerated again. Expect the largest single win
   on mid-range Android.
3. **Cache the uniform locations** once at link time rather than 15 string lookups
   per frame.
4. **One rAF loop.** Have `main.js` drive the CRT draw at the end of its own frame
   instead of the filter running a competing loop. Two loops on one display means
   the filter can present a half-finished game frame.
5. **Cheap static.** Render `renderStatic` snow into a small reusable offscreen
   canvas (e.g. 200 x 150, allocated once) and blit it up, instead of allocating and
   filling a full 800 x 600 `ImageData` every frame. Under `pixelated` upscaling the
   snow reads coarser, which the existing comment already says is the intent.
6. **Transcode the voice bank** to AAC-LC mono (`.m4a`), 24–32 kbps. AAC, not Opus:
   Safari's `decodeAudioData` history with Opus is uneven, and the chain lowpasses
   at 2.7 kHz so the bitrate costs nothing audible. 3.1 MB → **~300 KB**.
7. **Load `english` first.** `await` the 10 files level 1 needs, start the station,
   then background-load the rest. The cold open plays on time on cellular.
8. **Trim the zip.** Restrict `package.sh` to the assets the game loads, or move
   the promo-only fonts out of `assets/`. −161 KB.

*Verify:* a Playwright trace on a throttled CPU profile showing frame time before
and after; a `curl`-measured transfer size for first-audible-digit.

### Phase 1 — Geometry that responds

The structural change. Do it as a **pure function first**, so it is testable
without a browser and so nothing else has to know it happened.

1. **Extract a layout module.** `computeLayout(vw, vh, dpr) -> { cols, rows, charW,
   charH, canvasW, canvasH, mazeTop, hudTop, deckTop }`. Pure, no DOM, no imports —
   the same discipline `config.js` already holds.
2. **Seed it with today's numbers.** The first commit must return exactly
   `800 x 600 / 23 x 20 / CHAR.W 34.78 / CHAR.H 30` for a desktop viewport, so the
   change is provably inert before it is made to move.
3. **Re-point the consumers.** `CHAR`, `SCREEN`, `PREFS_BTN`, `WATERFALL`,
   `menu.js: layout()`, and `title.js`'s button rects all read from the live layout
   rather than from module constants. This is the bulk of the work and the bulk of
   the risk — `PREFS_BTN` in particular is currently shared between hit-testing and
   drawing, which is the property that must survive.
4. **DPR-aware backing store**, capped. Size the buffer to
   `cssPx * min(devicePixelRatio, 2)` and cap total pixels (~2.5 M) so the CRT
   fragment shader stays affordable. Snap the cell size to a whole number of device
   pixels so `pixelated` gets the integer ratio it wants.
5. **Re-layout on `resize` and `orientationchange`**, debounced to a frame.
6. **CSS hardening**: `dvh` instead of `vh`; `viewport-fit=cover` plus
   `env(safe-area-inset-*)` padding; `overscroll-behavior: none`;
   `touch-action: none` on `body`; `user-select: none`;
   `-webkit-touch-callout: none`; `-webkit-tap-highlight-color: transparent`.

*Verify:* `tests/layout.test.mjs` asserting the pure function across a device
matrix (iPhone SE / 14 / 15 Pro Max, Pixel, iPad, desktop) in both orientations —
grid never below 23 columns, HUD never overlapping the maze band, every declared
tap target ≥ 44 CSS px. This is the "fails before, passes after" test `CLAUDE.md`
requires.

### Phase 2 — The receiver layout

1. **Portrait control deck.** Directional cross plus PREFS, drawn in the character
   grid, in the bottom rows, sized off the layout so it is always ≥ 44 pt.
2. **Re-zone touch.** In portrait the maze band stops taking movement taps — the
   deck owns movement. Landscape keeps today's diagonal quadrants (nothing is wrong
   with them when the screen is wide and the thumb is at the edge).
3. **Expand the waterfall** into the rows portrait frees up. It is the best-looking
   thing in the game and it currently gets 13 columns by 3 rows.
4. **Hold-to-repeat on the deck**, with the existing 150 ms cadence.

*Verify:* Playwright screenshots at each device size, both orientations, checked
into `docs/`; the existing `menu.test.mjs` / `title.test.mjs` hit-testing suites
extended to the new geometry.

### Phase 3 — Behave like an app

1. **Screen Wake Lock** on first gesture, re-acquired on `visibilitychange`
   (the lock is dropped when the page hides and does not come back by itself).
   Supported Safari 16.4+ / Chrome 84+; ~94 % global. Feature-detect, no fallback —
   the game is fine without it, just interrupted.
2. **Resume audio on `visibilitychange`**, not only on input. Check for state
   `suspended` *and* iOS's `interrupted`.
3. **Fullscreen request** on the first gesture where supported (Android). iOS
   Safari does not do element fullscreen on iPhone — that is what (4) is for.
4. **PWA shell**: `manifest.webmanifest` (`display: standalone`,
   `orientation: any`, `background_color: #000`), `theme-color`,
   `apple-touch-icon`, and a service worker precaching the shell and the `english`
   voice bank so a second visit is instant and offline-capable.
   **Honest caveat:** on itch.io the game is served inside an iframe on an
   `itch.zone` origin, so the manifest will not offer an install from the itch
   page. The PWA only pays off from a self-hosted copy (GitHub Pages off this
   repo). Worth doing, worth not overselling.
5. **Haptics, narrowly.** `navigator.vibrate` on a *blocked move* and on a control
   deck press — mechanical feedback only. **Not** on a captured digit. The station
   is the only compass; a buzz that confirms a correct turn is a second compass and
   it would gut the design. This is a design line, not a technical one, and I would
   not cross it without you saying so.

### Phase 4 — Ship it

1. Tick **Mobile Friendly** in the itch embed settings. With it on, mobile always
   launches fullscreen at the device's own resolution — which is precisely what
   Phase 1 makes the game able to use, and why the flag should not be ticked
   before Phase 1 lands.
2. Real-device pass: at minimum one small iPhone, one large iPhone, one mid-range
   Android. Emulators will not surface the audio-interruption or auto-lock
   behaviours.
3. Update `README.md` Controls (it still documents "[P] (top-right corner)" — the
   button is bottom-right) and the `ITCH-PAGE.md` input line, then run both through
   the `honest-copy` and `humanized-copy` gates.

### Phase 5 — Native wrapper (optional, and I would not)

Capacitor around the web build gets you App Store and Play listings. It also gets
you store review, age ratings, a privacy policy, two more build pipelines, and an
update cycle measured in days instead of a `package.sh` — plus $25 one-time for a
Play account, or $99/yr for Apple. The game has no IAP, no ads, no push, and
nothing that needs a native API. **Recommend: no**, unless store presence is
itself the goal — in which case it is its own project, not a phase of this one.

Spelled out in full in `MOBILE-STORE.md`, including the two code changes a wrap
needs that the web build does not have, and a cheaper route that skips the store
entirely.

---

## 4. What I would check with you before starting

1. **The receiver layout is a real design change**, not an optimisation. It puts a
   drawn control deck permanently on screen in portrait. If the intended reading is
   *bare screen, nothing between you and the maze*, say so now and Phase 2 becomes
   "letterbox politely and enlarge the tap targets" instead.
2. **Haptics on capture** — I have argued against it above. Your call, not mine.
3. **Portrait or landscape as the default posture.** I have assumed portrait is
   what must work because it is what phones are held in. If you would rather ship a
   *rotate to play* card and perfect landscape, Phases 1 and 2 shrink by more than
   half.
4. **DPR cap.** Rendering at true DPR 3 on a large phone puts ~3 M pixels through
   the CRT shader every frame. I have proposed capping at 2x with a pixel ceiling.
   That is a sharpness-versus-battery trade and it is visible.

---

## 5. Order of value

If only part of this gets built, build it in this order:

1. **Phase 0.6 + 0.7** (compress and lazy-load the voice bank) — the cold open is
   currently broken on cellular, and this is a day's work.
2. **Phase 0.1 + 0.2** (CRT readback and `willReadFrequently`) — largest frame-time
   win in the codebase, no visual change, no design risk.
3. **Phase 3.2** (resume audio on `visibilitychange`) — a one-function fix for a
   bug that silences the compass.
4. **Phase 1** — everything visual depends on it.
5. **Phase 2** — the change that makes it a phone game rather than a game on a phone.

---

## Sources

- [Slow HTML Canvas Performance? Understanding Chrome's `willReadFrequently`](https://www.schiener.io/2024-08-02/canvas-willreadfrequently)
- [canvas2D spec — will-read-frequently](https://github.com/fserb/canvas2D/blob/master/spec/will-read-frequently.md)
- [MDN — Screen Wake Lock API](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API)
- [caniuse — Screen Wake Lock API](https://caniuse.com/wake-lock)
- [WebKit bug 226922 — Safari 15 breaks Web Audio content using WebM Opus](https://bugs.webkit.org/show_bug.cgi?id=226922)
- [WebKit bug 237878 — AudioContext is suspended on iOS when page is backgrounded](https://bugs.webkit.org/show_bug.cgi?id=237878)
- [WebAudio/web-audio-api#2585 — AudioContext stuck on "interrupted" in Safari](https://github.com/WebAudio/web-audio-api/issues/2585)
- [itch.io — Uploading HTML5 games](https://itch.io/docs/creators/html5)
- [MDN — BaseAudioContext.decodeAudioData()](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/decodeAudioData)

# Publishing finding_numbers on itch.io

A browser build for itch.io. `package.sh` produces the upload; this walks through
turning that into a live, playable page.

## 0. Build the upload

```sh
./package.sh
```

Produces `dist/finding_numbers.zip` with `index.html` at the archive root — the one
hard requirement itch has for browser games. Everything below uploads that file.

---

## Path A — the itch.io dashboard (do this the first time)

### 1. Make the project

- Sign in at [itch.io](https://itch.io), then **Dashboard → Create new project**.
- **Title**: `finding_numbers` (or whatever public name you want).
- **Project URL**: the slug in the page address — locked-ish once people bookmark it,
  so pick deliberately.
- **Short description**: one line for search results and cards.

### 2. Set it as a browser game — this is the step people miss

- **Kind of project**: choose **HTML**. Nothing plays in-browser until this is HTML.

### 3. Upload the zip

- Under **Uploads**, add `dist/finding_numbers.zip`.
- A checkbox appears on that file: **"This file will be played in the browser."**
  **Tick it.** (It only shows when Kind of project = HTML.)

### 4. Embed settings

The game canvas is **800×600** and it has touch controls, so:

- **Viewport dimensions**: `800` × `600`.
- **Fullscreen button**: on — the pixel maze rewards a bigger window.
- **Mobile friendly**: on. itch auto-switches to fullscreen on phones; the touch
  controls (tap top/bottom/left/right to move, `[P]` for prefs) take over there.
- **Click to play / start on load**: either is fine. The audio can't start until the
  first tap or keypress anyway (browser autoplay policy), so "click to play" reads
  honestly — the player clicks, then presses a key and the station comes up.

### 5. The page furniture itch requires

- **Cover image** (required): recommended **630×500**, minimum 315×250. A screenshot
  of the amber maze works.
- **Screenshots**: a couple of the maze / spectrogram / jukebox.
- **Genre / tags**: e.g. horror, atmospheric, experimental, audio.
- **Pricing**: "No payments" for free, or set a minimum / suggested price.

### 6. Preview, then go live

- **Visibility & access** starts as **Draft**. Save, then **View page** and actually
  play it in the browser embed — confirm the voice samples load and the dial spins.
- When it's right, set visibility to **Public** and save.

---

## Path B — butler CLI (fast updates & automation)

[butler](https://itch.io/docs/butler/) is itch's command-line uploader. Use it once
the page exists (you still set **Kind = HTML** and tick the browser checkbox once, in
the dashboard — butler pushes builds, it doesn't set page type).

```sh
# one-time: install butler, then authenticate
butler login

# build, then push the zip to the html5 channel
./package.sh
butler push dist/finding_numbers.zip <your-itch-username>/finding-numbers:html5
```

- `<user>/<game>` is all lowercase and matches your project URL slug.
- `:html5` is just the channel name — pick anything, but a browser build conventionally
  goes to `html5`.
- Re-run the two build+push lines for every update; butler diffs and uploads only what
  changed, and the live page updates with no re-upload in the browser.
- `butler status <user>/finding-numbers` shows the channel's build list.

---

## Updating later

1. `./package.sh`
2. Upload the new `dist/finding_numbers.zip` (dashboard) **or** `butler push …` (CLI).
3. Players get the new build immediately — no page edits needed.

---

## Gotchas

- **`index.html` must be at the zip root.** `package.sh` already arranges this; don't
  hand-zip a folder (that nests everything one level down and itch shows a blank page).
- **All asset paths are relative** (`assets/audio/…`, `src/…`), so the build runs from
  whatever URL itch serves it at. Don't introduce absolute `/…` paths.
- **Audio needs a gesture.** The station stays silent until the first tap/keypress — this
  is the browser's autoplay policy, not a bug. The "click to play" embed option makes
  that expectation obvious to players.
- **The VT323 font loads from Google Fonts** over the network. It renders online (itch is
  online); a monospace fallback covers any hiccup.

# Publishing finding_numbers on itch.io

A browser build for itch.io. `package.sh` produces the upload; this walks through
turning that into a live, playable page.

The page is live at **<https://kleer001.itch.io/finding-numbers>**. Steps 1–7 below are
the first-time setup; for later builds skip to *Updating later*.

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

The file to upload is **`dist/finding_numbers.zip`** — not `index.html` on its own, and
not `promo.html` (that's the GitHub Pages landing page, which itch never sees).

- **Uploads** sits between *Pricing* and *Embed options* on the edit page — above the
  big **Details** block. There is no separate "upload a webpage" widget; a browser game
  on itch *is* a zip with `index.html` at its root.
- Add `dist/finding_numbers.zip` there.
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

### 5. The page furniture — the **Details** block

Everything here lives under **Details**, below Embed options. The copy is already
written: `itch_page_description.md` holds paste-ready text for the description and the
tagline.

- **Short description / tagline** (near the top of the form, under Title): the one-liner
  in `itch_page_description.md`.
- **Description**: paste the block from `itch_page_description.md`. The toolbar's `<>`
  button toggles **Edit as HTML** if you'd rather paste markup than retype formatting.
- **Genre**: *Adventure* is the closest fit; the specifics go in tags.
- **Tags** (max 10): horror, atmospheric, experimental, audio, roguelike, exploration,
  procedural-generation, psychological-horror.
- **AI generation disclosure** (mandatory): **Yes**, and tick **Sounds**, **Text &
  Dialog**, **Code**. Leave **Graphics** unticked — the game draws itself from a single
  font and a WebGL filter, no generated images.
- **Download & install instructions**: leave empty. Nothing is downloaded.
- **Community**: your call — *Comments* is the low-effort option, *Disabled* if you
  don't want to moderate.
- **Pricing**: "No payments" for free, or set a minimum / suggested price.

### 6. Cover image and screenshots — the right-hand column

These are **not** in the Details flow. They sit in a separate column on the right side of
the edit page. On a narrow browser window that column collapses to the very bottom of the
page, below *Visibility & access* — widen the window if you'd rather see it beside the form.

- **Cover image** (required): `docs/img/cover.png` — 630×500, itch's recommended size at
  the required 315:250 aspect ratio.
- **Screenshots** (the *add screenshots* button under the cover): `docs/img/gameplay.png`,
  `jukebox.png`, `signal-lost.png`, `light-mode.png`, `preferences.png`. Any size is fine;
  itch suggests 3–5.
- Screenshots only render on the public page if the theme puts them there: **View page →
  Edit theme → Layout → Sidebar**. Any other layout hides them.

### 7. Theme — banner, background, colors

Save the page first, then **View page → Edit theme** (the theme editor lives on the public
page, not in the edit form). Its fields are **BG, BG2, BG2 Alpha, Text, Link, Buttons,
Headers**, plus a **Banner** and **Background** image and a **Layout** control.

- **Banner**: `docs/img/banner.png` — 960×300. It replaces the title above the description,
  and 960 is itch's content width for an 800×600 embed.
- **Background**: `docs/img/background.png` — 1920×1080, a dim maze field with scanlines,
  dark enough to sit under body text.
- **Colors** (the game's palette):

  | Field | Value | |
  |---|---|---|
  | BG | `#060504` | the void behind everything |
  | BG2 | `#0d0b07` | content panels |
  | BG2 Alpha | `0.92` | lets the background texture show through |
  | Text | `#d8c9a4` | warm off-white — amber body text is unreadable at length |
  | Link | `#ffd257` | phosphor |
  | Buttons | `#ffd257` | phosphor |
  | Headers | `#ffe4a0` | bright phosphor |

- **Layout → Sidebar** if you want the screenshots visible. Note itch defaults embedded
  HTML games to a single column that hides the screenshot column.
- There is **no separate embed background** setting. The 800×600 game frame sits on the
  page's **BG**, so `#060504` makes the embed blend into the page instead of floating on a
  lighter rectangle.

### 8. Preview, then go live

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

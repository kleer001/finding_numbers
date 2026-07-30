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
  `jukebox.png`, `light-mode.png`, `preferences.png`. Any size is fine;
  itch suggests 3–5.
- Screenshots only render on the public page if the theme puts them there: **View page →
  Edit theme → Layout → Sidebar**. Any other layout hides them.

### 6b. Trailer and loops

`./post.sh` builds these into `clips/out/` (gitignored -- they are rebuilt, not stored).

- **Trailer**: `trailer.mp4`, ~44s. itch takes a **link**, not a file: the trailer field
  accepts YouTube, Vimeo or SketchFab URLs, so it has to be hosted there first. The field
  is under *Edit game -> Details*. A trailer also lights up the "Watch trailer" button on
  grid listings.
- **Looping GIFs**: `core-loop.gif`, `pulse.gif` -- small enough to autoplay, and they can
  go straight into the page body or a devlog, which takes image uploads directly.
- **Vertical cuts**: `*-9x16.mp4` are for short-video feeds off-site, not for itch.

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
2. Note the archive's byte count — `stat -c %s dist/finding_numbers.zip`. Step 4 needs it.
3. Upload the new `dist/finding_numbers.zip` (dashboard) **or** `butler push …` (CLI).
4. **Verify server-side, then check the browser-playable flag.** See below. Do not treat
   the dashboard's own display as evidence, and do not assume "no page edits needed" —
   a same-named replacement swaps the live game the moment the transfer finishes, with
   no staged state to review.

### Verify a release from the API

The dashboard shows what it loaded, not what is live. Two checks actually prove a release:

```sh
KEY=$(cat ~/Dropbox/ai/code/itch_io_api_secret.txt)   # never echo it, never put it in a URL that gets logged
curl -sS "https://itch.io/api/1/$KEY/game/4800315/uploads"
```

- **`type` must be `html`.** Anything else means the page is serving a download instead
  of a game.
- **`size` must equal the local archive's byte count.** This is the only proof that the
  build people can play is the build that was packaged.

### The browser-playable flag on a replacement

A zip uploaded under the same filename replaces the existing upload in place — one row,
new upload id. Whether that replacement keeps the "This file will be played in the
browser" flag is **unsettled**: Trace ROM Studio's `PUBLISHING-RUNBOOK.md` states in one
section that the replacement arrives as `type=default` and loses the flag, and in another
that a dashboard replacement preserves the existing upload's flags. Both cannot be true,
and the contradiction has not been resolved against a real upload.

So do not rely on either claim. Run the `uploads` check above after every build
replacement; if `type` is not `html`, re-tick the checkbox and save. `butler push`
sidesteps the question for later updates, but its *first* push creates a new channel
whose upload is not browser-playable until the flag is set once in the dashboard.

---

## Gotchas

- **`index.html` must be at the zip root.** `package.sh` already arranges this; don't
  hand-zip a folder (that nests everything one level down and itch shows a blank page).
- **All asset paths are relative** (`assets/audio/…`, `src/…`), so the build runs from
  whatever URL itch serves it at. Don't introduce absolute `/…` paths.
- **Audio needs a gesture.** The station stays silent until the first tap/keypress — this
  is the browser's autoplay policy, not a bug. The "click to play" embed option makes
  that expectation obvious to players.
- **Saving the edit page rewrites every field, not just the one you changed.** The
  form posts the whole record from whatever the loaded page contained, so a form
  that came up with a stale or empty field will silently write that emptiness back
  over good data — changing one field can revert the description and tagline
  without any error. The save reports `{"success":true}` either way. Before saving,
  confirm the fields you are *not* editing still hold what you expect.
- **One bad field rejects the whole form.** Validation is all-or-nothing: an
  over-length tagline returns `short_text: expected text between 1 and 120
  characters` and discards every other edit in the same save, so a rejected save
  looks like the field you *were* editing simply refused to take.
- **The description lives in a rich-text editor, not the textarea.** The backing
  `game[description]` textarea is what gets posted; the visible editor syncs into
  it. Setting one without the other loses the edit.
- **The font ships with the game** (`assets/fonts/station-grid.woff2`, built by
  `make_font.py`). Nothing is fetched from a CDN, so the walls draw correctly offline and
  on a first load with a cold network. It carries block and masonry glyphs no stock face
  has -- a fallback would draw the walls in a second typeface, or not at all.

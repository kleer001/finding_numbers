# Google Play deliverables

Expands `MOBILE-PLAN.md` Phase 5, which recommended against this. The
recommendation has not changed — but the question deserves a real answer, and
some of what follows (the back-button handling, the `fetch` origin) is worth
knowing even if you never open a Play Console account.

**Policy dates and thresholds below were checked in August 2026 and move often.
Verify against Play Console Help before acting on any of them.**

---

## 1. No, HTML is not a deliverable

Google Play accepts exactly one upload format: a signed **Android App Bundle**
(`.aab`). Not a `.zip`, not an `.apk` (for new apps), and not HTML.

Your HTML, CSS, JS and assets do not go to Google. They become the *payload
inside* an Android app that you build and sign. Something has to be that app.
There are two candidates.

| | **TWA** (Bubblewrap) | **Capacitor** |
| --- | --- | --- |
| What it is | Chrome rendering your hosted site, chrome-less | A WebView loading assets bundled in the app |
| Assets live | On your HTTPS origin | Inside the `.aab` |
| Needs hosting | **Yes** — a live origin, forever | No |
| Needs a PWA | **Yes** — manifest + service worker, Lighthouse-installable | No |
| Needs `assetlinks.json` | Yes, served from your origin | No |
| Works with no network | Only if the service worker cached everything | Yes, inherently |
| If the host goes down | The shipped app breaks | Nothing happens |

### Recommendation: Capacitor

This game has no backend, no live data, and — after `MOBILE-SPEC.md` S-06 —
about 350 KB of audio plus ~90 KB of code and fonts. It is a self-contained
offline artifact that happens to be written in web technology.

TWA would take that self-contained artifact and make it **depend on a web server
you must keep alive for as long as the app is listed**. If `kleer001.github.io`
or itch.zone changes shape in three years, an installed app breaks. Capacitor
bundles the same files into the `.aab` and the app is done being your problem
once it ships.

The one thing TWA buys — updating the game without a store release — is worth
less here than the coupling it costs.

---

## 2. Code the wrap needs that the web build does not have

The valuable half of this document. These are real gaps, not boilerplate.

### 2.1 The Android back button — **required**

Currently unhandled. In a wrapped app, gesture-back and hardware-back **quit the
game instantly** — mid-level, from an open preferences panel, with no
confirmation. Reviewers notice this and players hate it.

Needed behaviour, matching what `Escape` already does in `handleKey`:

| State | Back does |
| --- | --- |
| Jukebox open | `jukebox.active = false` |
| Menu open | `menu.open = false` |
| In a level | Open the title screen, or confirm-to-exit |
| Title screen | Exit the app |

`main.js` already has this decision tree — `handleKey` handles `Escape` for the
first two cases. The work is routing Capacitor's `backButton` event into it, plus
authoring the level → title case, which has no keyboard equivalent today.

### 2.2 The `fetch()` origin — **verify early, it fails silently**

`station.js:401` does `fetch("assets/audio/...")` with a relative path. Under a
raw `file://` origin — the old Cordova default — that is blocked, `loadDigits`
rejects, and `playDigit`'s `if (!buf) return` turns the failure into **a station
that never speaks**. Same silent-failure class as S-06.

Modern Capacitor serves from `https://localhost` on Android via a local server
scheme, so relative `fetch` works. **Confirm this on the first build before
anything else is done** — it is the single highest-consequence unknown in a wrap,
and its failure mode is indistinguishable from working.

### 2.3 Orientation and display cutout

`AndroidManifest.xml` declares `android:screenOrientation`, which is where the
open portrait-vs-landscape question in `MOBILE-PLAN.md` §4 becomes a one-line
commitment. Also set `android:windowLayoutInDisplayCutoutMode="shortEdges"` and
hide the system bars for immersive mode — the `env(safe-area-inset-*)` CSS from
S-11 still does the real work, and is what keeps the HUD off the cutout.

### 2.4 Audio focus

When another app starts playing, or a call arrives, an Android app is expected to
duck or pause. A WebView's Web Audio graph does not do this on its own. S-09's
`visibilitychange` handling covers app-switching; a true audio-focus listener is a
native plugin and is a genuinely new requirement the web build never had.

### 2.5 Smaller items

- **Wake lock** — the Screen Wake Lock API (S-10) works in WebView, but native
  `android:keepScreenOn` is more reliable inside a wrap. Pick one, not both.
- **Vibration** — `navigator.vibrate` needs
  `<uses-permission android:name="android.permission.VIBRATE" />`. Only if the
  haptics question in §4 resolves to yes.
- **`versionCode`** must increment on every upload, forever. Automate it in
  `package.sh`'s successor or you will lose an evening to it.
- **`?seed=` sharing dies.** There is no URL bar in a wrapped app, so the
  share-a-seed affordance becomes menu-only via the `SEED` / `SEED CHAR` rows.
  Worth a line in the store description rather than letting players discover the
  absence.
- **Dev handles** (`window.game`, `window.station`, `?demo=`) should be stripped
  or gated from a store build, on the same argument that removed the dev-server
  heartbeat in `REVIEW-LOG.md`.

---

## 3. Build deliverables

| Deliverable | Notes |
| --- | --- |
| Signed `.aab` | The only accepted upload format for new apps |
| **Upload key** (keystore) | Yours. **Lose it and you cannot update the app** — back it up off-machine before the first upload |
| Play App Signing enrolment | Google holds the app signing key; you hold the upload key |
| `targetSdk` | **API 36 (Android 16)** for new apps and updates from 31 Aug 2026; extension to 1 Nov 2026 available on request |
| `minSdk` | Your call. API 24–26 is a reasonable floor; WebGL and Web Audio are long-settled |
| Adaptive icon | Foreground + background layers, 108 x 108 dp with a 72 x 72 dp safe zone, plus a **monochrome** layer for themed icons on Android 13+ |

---

## 4. Console and policy deliverables

The administrative pile. None of it is hard; all of it is required.

- **Developer account** — **$25 one-time** (this is Google; Apple's $99/yr is a
  separate thing and does not apply here).
- **Privacy policy at a public URL** — required even though the game collects
  nothing. It needs to exist and be reachable.
- **Data safety form** — declare *no data collected, no data shared*. Accurate:
  `localStorage` never leaves the device, and after the heartbeat removal the game
  makes no network requests at runtime.
- **Content rating** — IARC questionnaire. Horror atmosphere, no violence, no
  gore; expect roughly PEGI 12 / ESRB Teen. Answer it honestly rather than
  optimistically; a rating challenged later is worse than a higher rating now.
- **Target audience declaration** — declare 13+. **Do not declare a child
  audience.** It triggers the Families policy programme, a design-review pass, and
  ongoing obligations wildly out of proportion to this game.
- **Ads declaration** — none.
- **Contact email**, app category (Games → Puzzle or Adventure), and a
  **tester-facing note** if any content needs explaining to a reviewer.

---

## 5. Store listing assets

| Asset | Spec |
| --- | --- |
| App name | ≤ 30 characters |
| Short description | ≤ 80 characters |
| Full description | ≤ 4000 characters |
| App icon | 512 x 512 PNG, 32-bit with alpha, ≤ 1 MB |
| Feature graphic | 1024 x 500 PNG or JPG — **required**, and it is what the listing leads with |
| Phone screenshots | 2–8, PNG or JPG, 16:9 or 9:16, each side 320–3840 px |
| Tablet screenshots | Only if you want tablet distribution; skip otherwise |
| Promo video | Optional, a YouTube URL |

**Most of this already exists.** `ITCH-PAGE.md` has the descriptions (they need
cutting to 80 and 30 characters, then the `honest-copy` and `humanized-copy`
gates). `promo.html`, `promo-room-moved.html`, `capture.sh` and
`video_shot_list.md` are a screenshot and trailer pipeline that already works.

The genuinely new artwork is the **feature graphic** — a 1024 x 500 banner, which
is a format the project has never needed. It is also the highest-leverage asset on
the page.

Screenshots should come from the mobile build **after** `MOBILE-PLAN.md` Phase 2,
not before. Shipping 9:16 screenshots of the current 35 %-of-screen portrait
layout would advertise the exact problem this whole effort exists to fix.

---

## 6. The gate that will actually cost you

Personal developer accounts created on or after **13 November 2023** must run a
**closed test with at least 12 testers, opted in continuously for 14 days**, before
applying for production access.

Not 12 installs. Twelve real Google accounts, opted into your closed track, still
opted in two weeks later. Organisation accounts (which need a D-U-N-S number) are
exempt; so are accounts created before that date.

This is the deliverable that turns "publish to Play" from a weekend into a
month-plus of calendar time, and it is the one most people do not budget for.
**Check which category your account falls into before committing to any of this** —
if you hold a pre-2023 account, the largest single cost here does not apply to you
and the calculus changes substantially.

---

## 7. The cheaper route, which I would take first

**Capacitor gets you an `.apk`. itch.io accepts `.apk` uploads directly**, and the
itch.io Android app installs them.

That means you can have a real, installable, offline Android build of
`finding_numbers` with:

- no $25 account
- no closed-testing gate
- no content rating questionnaire
- no privacy policy URL
- no target API deadline
- no store review
- no `versionCode` discipline
- and the same `.aab` build pipeline already standing if you later decide Play is
  worth it

You keep your existing audience and your existing page. Sections 1 and 2 of this
document — the wrap, the back button, the `fetch` origin — are shared work either
way. Sections 4, 5 and 6 are pure Play tax.

---

## 8. Recommendation, unchanged

**Do not ship to Play yet.** Not because it is hard, but because of ordering: a
store listing is a promise about the build behind it, and the build behind it is
currently a game that occupies 35 % of a portrait screen and goes silent when you
take a phone call.

The sequence that makes sense:

1. `MOBILE-SPEC.md` S-01 … S-12 — the settled fixes.
2. `MOBILE-PLAN.md` Phases 1–2 — responsive geometry, then whatever §4 resolves to.
3. Capacitor wrap + §2 code changes → `.apk` → **itch.io**. Real mobile
   distribution, near-zero overhead, and it proves the wrap works with actual
   players.
4. *Then* decide about Play, with a game that deserves the listing and a wrap
   that has already been tested by strangers.

Step 3 is the one worth doing soon. Step 4 can wait indefinitely without costing
anything.

---

## Sources

- [Target API level requirements for Google Play apps](https://support.google.com/googleplay/android-developer/answer/11926878?hl=en)
- [App testing requirements for new personal developer accounts](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en)
- [Everything about the 12 testers requirement — Play Developer Community](https://support.google.com/googleplay/android-developer/community-guide/255621488/everything-about-the-12-testers-requirement?hl=en)
- [Google Play target API requirements for Android apps (2026) — Median.co](https://median.co/blog/google-plays-target-api-level-requirement-for-android-apps)

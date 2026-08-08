# Mobile roadmap

The sequence across `MOBILE-PLAN.md` (what and why), `MOBILE-SPEC.md` (how, for
the settled parts) and `MOBILE-STORE.md` (Play). This document is ordering only —
it repeats none of their detail.

**The through-line:** every milestone ships something a player can feel, and the
open design questions are deferred to the exact point where they block work rather
than answered up front. Nothing before M2 needs a decision from you.

Effort figures are day-ranges for focused work and are guesses — I do not know
your working rhythm. Calendar figures under M5 are not guesses; they are imposed
by Google.

---

## Milestones

| | Milestone | Ships to | Effort | Needs a decision |
| --- | --- | --- | --- | --- |
| **M0** | Floor — `MOBILE-SPEC.md` S-01…S-12 | itch web | 4–7 d | No |
| **M1** | Responsive geometry — Plan Phase 1 | itch web | 3–5 d | DPR cap |
| **M2** | Posture and layout — Plan Phase 2 | itch web | 4–8 d | **Posture, deck, haptics** |
| **M3** | Mobile web release — Plan Phase 4 | itch web | 1–2 d | No |
| **M4** | Capacitor wrap → `.apk` | **itch Android** | 3–5 d | No |
| **M5** | Google Play | Play | 2–4 d work, **4–8 weeks calendar** | Whether at all |

M0 through M3 are the project. M4 is the cheap win. M5 is optional and is the only
one with a clock you do not control.

---

## M0 — Floor

**Goal:** make a frame cheap, make the audio arrive, stop the platform fighting
the game. No visual change except S-05's snow.

Everything is specified in `MOBILE-SPEC.md`. Build order there is binding:
S-01 and S-05 both land before S-02.

**Done when:** 117 tests still green plus whatever S-07 adds; the five measurements
in `MOBILE-SPEC.md` §"Measurements" are taken before and after; a real iPhone
survives background/call/lock without losing the station.

**Ships:** yes, to itch, as an ordinary build. Players get a faster, quieter,
correctly-behaving game before any of the layout work starts. **This is the single
best reason to do M0 first** — it is the only milestone that improves the game for
existing desktop players too.

**Blocked by:** nothing.

---

## M1 — Responsive geometry

**Goal:** `computeLayout(vw, vh, dpr)` as a pure function, consumers re-pointed at
it, DPR-aware backing store, re-layout on resize and orientation.

`MOBILE-PLAN.md` Phase 1 has the substance. The discipline that matters: the first
commit must return today's exact numbers (`800 x 600`, `23 x 20`, `CHAR.W 34.78`)
for a desktop viewport, so the refactor is provably inert before it is made to
move. `tests/layout.test.mjs` is the proof.

**Decision needed: the DPR cap.** I proposed `min(devicePixelRatio, 2)` with a
~2.5 M pixel ceiling. It is a sharpness-versus-battery trade and it is visible.
Cheap to defer *within* the milestone — build the cap as a constant and try three
values on a real device before picking.

**Done when:** the layout test passes across the device matrix; rotating a phone
re-lays out cleanly; nothing regressed on desktop.

**Ships:** yes. Portrait is still a 4:3 block, but it is now a *correctly scaled,
integer-ratio, safe-area-aware* one.

**Blocked by:** M0 — M1 raises the pixel count and M0 is what makes pixels
affordable.

---

## M2 — Posture and layout

**Goal:** decide what portrait is, then build it.

**This is where the deferred questions come due**, all three at once, because they
are the same decision seen from different sides:

1. **Posture** — portrait-first, or a rotate-to-play card and a perfected
   landscape? If landscape, M2 shrinks by more than half and questions 2 and 3
   mostly evaporate.
2. **The receiver deck** — a drawn control band in the bottom rows, or letterbox
   politely and just enlarge the tap targets?
3. **Haptics** — I argued for mechanical feedback only (wall bump, key press) and
   against anything on a captured digit, because the station is meant to be the
   only compass. Your call.

I would answer these on a device, not on paper. M1 delivers a build that scales
correctly; spend an evening playing it in portrait on a real phone before choosing.

**Done when:** the thumb no longer covers the maze; every tap target ≥ 44 pt;
screenshots captured at each device size for M3.

**Ships:** yes, and this is the milestone that makes it a phone game rather than a
game on a phone.

**Blocked by:** M1.

---

## M3 — Mobile web release

**Goal:** tell people, and stop shipping stale claims.

- Tick **Mobile Friendly** in the itch embed settings — *after* M1/M2, not before.
  With it on, mobile launches fullscreen at the device's own resolution, which is
  precisely what M1 makes the game able to use.
- Real-device pass: one small iPhone, one large iPhone, one mid-range Android.
- `README.md` and `ITCH-PAGE.md` control corrections (S-12), then the
  `honest-copy` and `humanized-copy` gates.
- New screenshots from the M2 build.
- Optional here or later: PWA shell and a self-hosted copy on GitHub Pages. Only
  meaningful self-hosted — the itch iframe cannot offer an install.

**Blocked by:** M2.

---

## M4 — Capacitor wrap, distributed on itch

**Goal:** a real installable offline Android build, with none of the Play tax.

`MOBILE-STORE.md` §1 and §2 are the work. The two that matter:

- **The Android back button**, which currently quits the game instantly.
- **The `fetch()` origin** — verify on the very first build, because its failure
  mode is a station that never speaks.

Then upload the `.apk` to the existing itch page.

**Why this before M5:** it proves the wrap works, on real devices, with real
players, at zero administrative cost. Every line of it is shared work if you later
go to Play. If the wrap has a problem, you find out here rather than inside a
14-day testing window.

**Blocked by:** M3 in principle, M2 in practice.

---

## M5 — Google Play

`MOBILE-STORE.md` §3–6 is the checklist. Two things about the shape of it:

**The work is small; the calendar is not.** Two to four days of actual effort —
signing, the `.aab`, the forms, the listing, the feature graphic. Then four to
eight weeks of waiting, almost all of it the testing gate.

**Check your account's date first.** The 12-testers requirement applies only to
personal accounts created on or after **13 November 2023**. If yours predates that,
or is an organisation account, the largest cost in this milestone does not apply to
you and M5 becomes a long weekend. **Establish this before planning anything else
here.**

---

## Getting twelve testers for a fortnight

The part with no engineering in it and the part most likely to stall.

### What the requirement actually is

Twelve testers **opted in continuously for the last 14 days**, at the moment you
apply for production access. Read that precisely:

- **Twelve accounts, not twelve installs.** Real Google accounts, opted into your
  closed track.
- **Continuously.** Someone who opts in on day 9 contributes nothing. The clock is
  per-tester, and it is the *twelfth* tester's clock that gates you.
- **Opting out or being removed resets that person.** Do not tidy the list
  mid-window.
- Google reviews the application. Twelve accounts that installed nothing and said
  nothing is a pattern the review is looking for.

### The scheduling consequence

**Recruit first, then start the clock.** Get your list assembled and everyone
opted in, *then* count 14 days. Trickling people in over two weeks means the
window ends 14 days after the last one, not the first.

Uploading new builds to the closed track during the window does not reset it — the
clock is on tester opt-in, not on the release. So the fortnight is calendar time
you can spend working. Start it the moment you have a wrap that is not
embarrassing, and keep improving throughout. *(Worth confirming against current
Play Console Help before you rely on it.)*

### Over-recruit

Aim for **eighteen to twenty**. Attrition is real: people change phones, clear
accounts, or opt out by accident. Twelve recruited is twelve at risk; eighteen
recruited is twelve that hold.

### Use a Google Group, not an email list

A Group lets you add and remove members without touching the track configuration
or cutting a release. An individual-email tester list is edited in the Console and
is far more annoying to maintain over a fortnight.

### The single most common failure

**People accept the invitation and never click the opt-in link.** Being on your
list is not being opted in. Send both, spelled out, in one message:

1. the opt-in URL,
2. the Play link that only works *after* opting in,
3. an explicit "you must tap the first link before the second one will work."

Then **verify the count in the Console** rather than trusting replies. Somebody
will say yes and do nothing, and you will not find out for two weeks.

### Where to find them

Your existing channel research in `MARKETING-PLAN.md` is a *promotion* map.
Recruiting testers is a different ask — participation, not attention — so the
fit ranking changes.

**Best fit — people who already like this game:**

- **Your itch followers.** A devlog on the existing page — "Android closed beta,
  need a dozen testers" — reaches people who have already played it and liked it
  enough to follow. This is the highest-conversion route you have and it costs one
  post.
- **Haunted PS1 Discord** (~5k, ~1.8k online). The lo-fi horror dev scene. Devs
  test each other's builds as a matter of course, and an Android beta of a
  liminal-horror game is on-topic rather than an imposition. Rules are only
  readable from inside — join and read first, as the marketing plan already notes.
- **`r/numberstations`** (~18k). Small and slow, but these are the people who know
  the real stations and the ones most likely to care. A genuine "help me test"
  post reads very differently from promo in a niche this invested.

**Purpose-built for exactly this** — not in the marketing plan, because it is
promo-focused rather than tester-focused:

- `r/alphaandbetausers`, `r/betatests`, `r/androidapps`, `r/AndroidAppTesters`,
  `r/TestersCommunity`. These exist for recruiting testers. Lower affinity with
  your game, higher affinity with the ask. *(Names collected from secondary
  sources — check each still exists and read its self-promo rules before posting.)*
- **The itch.io community forum and your own devlog.** Validated by precedent:
  other indie devs have recruited Play testers through itch devlogs and forum
  threads specifically for this requirement. It is the closest thing to a free
  channel where the people arriving already want to play the game.

**Personal network.** Realistically six to eight of your eighteen. It is the most
reliable source and the one people forget to work first.

### Services and swap groups — prices and trade-offs

An industry exists purely to sell twelve testers. Prices checked August 2026;
verify before paying, because these come and go.

**Paid services** — they supply the testers, you supply the build.

| Service | Price | Notes |
| --- | --- | --- |
| Testers Community | from **$15** | Starter is 15 testers; also runs a free credit tier |
| PrimeTestLab | **$19.99** | Starter is exactly 12, one-time |
| 12-testers-for-14-days | from **$22.99** | |
| TestFi | **$39.99** | Flat; auto-replaces anyone who drops |

Most advertise real-device verification, drop-out replacement, and a money-back
guarantee if production access is refused. Read that guarantee carefully — it
refunds the fee, not the month.

**Free credit exchanges** — you test other developers' apps to earn credits, then
spend credits to have yours tested.

| Platform | Model |
| --- | --- |
| Get12Testers | Fully free, credit system, no paid tier |
| BetaTribe | Free credit exchange, aimed at indie devs |
| Testers Community (free tier) | ~20 credits per app you test |
| tester.dinnger.com | Developer-to-developer swap |

The cost here is your time: you become a tester for a dozen strangers' apps.

### What Google actually rejects for

This is the part the vendor pages do not lead with. Production access is refused
when the review sees:

- **Testers who did not genuinely engage.** Twelve people opening the app once for
  ten seconds is explicitly flagged as fake. Daily activity is tracked.
- **The same account testing many apps** — the defining signature of swap groups.
- **Emulators**, or every tester on the same device model.
- **IP and account-creation patterns** suggesting coordinated inauthentic activity.
- **Vague answers** on the production-access form.
- **No app updates during the window**, i.e. no evidence you acted on feedback.

**And there is no appeal.** A refusal is not a resubmission — it is another full
14-day cycle from zero.

### The trade-off, stated honestly

The paid services and the free exchanges fail for the *same structural reason*:
neither produces anyone with a reason to actually play your game. A paid tester is
there for the fee; a credit-exchange tester is there to farm credits for their own
app. Both open it briefly and leave. That is precisely the pattern the review
inspects for.

So the arithmetic is asymmetric. Buying twelve testers saves you roughly two weeks
of recruiting **when it works**, and costs you four or more **when it doesn't** —
and the thing it optimises is the exact signal Google examines. I have no reliable
success-rate figures and will not invent one; what I can say is that the downside
is four times the upside and the failure has no appeal.

**For most developers asking this question, that is still a close call**, because
most of them are shipping a utility app that nobody has heard of and have no
audience to draw on.

**You are not in that position.** `finding_numbers` is live, has been played, and
has followers on itch — plus `MARKETING-PLAN.md` already maps the niches that care
about number stations and liminal horror. You have the one asset that makes the
organic route work: **people who will genuinely play it because they want to.**
That converts the engagement requirement from an obstacle into a by-product.

**Recommendation:** recruit organically, and treat the paid services as a
last-resort top-up if you finish week two at ten people rather than eighteen — a
handful of bought testers inside a genuinely engaged group looks very different
from a group made entirely of them. Do not use the credit exchanges at all; the
time cost is real, and testing a dozen strangers' apps is the same week you could
spend posting in three communities that already like your work.

One thing to do regardless of route: **ship at least one build during the 14 days
in response to tester feedback.** "No app updates showing you acted on feedback" is
its own rejection reason, and the seven-question brief above is designed to
generate exactly the feedback that justifies one.

### What the evidence for these services actually is

I went looking for reviews from developers who had actually shipped. The result is
worth recording, because **it is mostly an absence.**

**Access limits, stated up front:** in this environment I can run web searches but
cannot open pages — Reddit is blocked to the crawler, and Hacker News, itch.io,
`support.google.com` and `dev.to` are all blocked by the network proxy. Everything
below is search-result level. I have not read the threads. Treat the
characterisations as leads to verify, not as verified findings.

**The one strong independent source.** There is a peer-reviewed study of exactly
this question: *No Country for Indie Developers: A Study of Google Play's Closed
Testing Requirements for New Personal Developer Accounts*, ACM Transactions on
Software Engineering and Methodology (DOI `10.1145/3736578`). Its method is a
qualitative analysis of developer discussion on Reddit plus **a survey of 14 indie
developers who had recently passed the requirements or were actively trying to** —
which is precisely the population you asked about. Reported findings: the
requirements are widely perceived as discriminatory, they impose logistical and
bureaucratic barriers on small creators, and the paper documents the workaround
strategies the community has adopted. **If you read one thing before deciding on
M5, read this rather than anything a vendor published.**

**Independent, real, and unread by me** — first-hand developer accounts I located
but could not open:

- Hacker News: *Google Console closed testing requirements are awful*
  (`item?id=40520051`), *Android App Devs now require 20 people to test*
  (`38258101`), *Need 12 testers for my first Android app launch* (`45468010`),
  and *I built TestCrew to solve the Android 12-tester problem* (`46013217`). That
  last one is evidence in itself: developers are building mutual-aid tooling
  because the commercial answer did not satisfy them.
- Google Play Developer Community: *Closed Testing Worst Thing Ever*
  (`thread/353245020`), *Production access rejected after 14 days of closed
  testing* (`283988803`), *Repeated Production Access Rejection Despite Completing
  All Testing Requirements* (`396609566`), and *Lack of Clear, Measurable Approval
  Criteria for Indie Developers* (`396948357`).
- **itch.io devlogs — the closest match to your exact situation:** indie game devs
  recruiting Play testers through their own itch pages. *Renewed Pixel Dungeon*
  (`itch.io/devlog/1007452`), `itch.io/devlog/869393`, and `itch.io/blog/1089564`.
  This is the organic route working, by people in your position, on your platform.

**The layer to discount.** Most of what a search returns for "12 testers review"
is written by the services themselves. Named so you can filter it:

- `dev.to/testerscommunity` publishes *"Google Play Rejected My App After 14 Days —
  Here Is What I Did Wrong"* — a confessional first-person post **on the vendor's
  own account**.
- The `note.com` piece headlined *"A Savior for Indie Developers?"* reproduces
  vendor marketing copy close to verbatim; it reads as affiliate content, not an
  independent account.
- `primetestlab.com/blog`, `testfi.app/blog`, `testerbee.com/blog`,
  `20apptester.com`, and most *"7 legit ways to get 12 testers"* listicles are
  vendor blogs. They are not wrong about the mechanics — the rejection criteria
  they list match Google's own — but they all conclude by selling you testers.

**Trustpilot, and why its signal is weaker than it looks.** Testers Community shows
**5 stars across ~854 reviews**; `20testers.com` and `12-testers-for-14-days` have
pages too. Two problems. Reviews on solicited platforms in this category are worth
discounting generally, and more specifically: **a Trustpilot review measures "did
the service deliver testers", not "did Google approve me."** Those are different
events, separated by two weeks and a review nobody controls. The rating cannot tell
you the thing you actually want to know.

**What this changes:** nothing about the recommendation, but the reason is now
better. It is not that paid services are proven bad — it is that **after real
searching, no independent body of shipped-game evidence exists either way**, while
the only peer-reviewed work on the subject documents the community routing around
the requirement rather than buying its way through. Spending $20 on an outcome with
no independent evidence base and no appeal on failure is a worse bet than spending
a week posting to three communities that already like your game.

**On tester-swap services:** paid and reciprocal-testing communities exist and
advertise heavily against this exact requirement. Two honest problems. Google has
been rejecting production-access applications that look like reciprocal farms, and
paying for twelve accounts that never open the app produces precisely the
engagement signature the review examines. If you use them at all, use them to top
up a real group — never as the group.

### Give them something to actually do

This is where the requirement stops being a tax and starts paying for itself.

`MOBILE-SPEC.md` says S-06, S-07, S-09, S-10 and S-11 all have failure modes that
emulators do not reproduce, and that the work needs a real device matrix.
**Your twelve testers are that device matrix.** The brief writes itself from the
spec's acceptance criteria:

> Thanks for testing. Seven things, five minutes, and please tell me your phone
> model and Android version.
>
> 1. Does the radio start talking within the first ten seconds?
> 2. Switch to another app for half a minute, come back, and **don't touch the
>    screen** — is it still talking?
> 3. Take or make a phone call while it is running. Still talking afterwards?
> 4. Leave it sitting untouched for a minute. Does the screen stay on, or dim?
> 5. Press and hold anywhere on the maze for three seconds. Any text-selection
>    popup, magnifier, or grey flash?
> 6. Swipe down from the very top of the screen. Does the page reload instead of
>    moving you?
> 7. Open PREFS, then press back. Does it close the menu, or quit the game?
>
> Headphones strongly recommended — the game is played by ear. It is quiet horror:
> no jump scares, no gore.

Seven answers across a dozen handsets is a better device matrix than you could buy,
it demonstrates exactly the engagement the production-access review wants to see,
and it is genuinely how M0's mobile-only acceptance criteria get verified.

### Realistic calendar

| | |
| --- | --- |
| Recruiting to 18 | 1–2 weeks |
| Getting everyone actually opted in | 3–7 days of chasing |
| The window itself | 14 days, fixed |
| Production access review | days, occasionally longer |

**Four to eight weeks**, mostly waiting. Which is exactly why M4 exists: an
installable Android build on itch, in hand, weeks before any of this resolves.

### Sources

- [App testing requirements for new personal developer accounts](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en)
- [Everything about the 12 testers requirement — Play Developer Community](https://support.google.com/googleplay/android-developer/community-guide/255621488/everything-about-the-12-testers-requirement?hl=en)
- [Production access rejected after 14 days of closed testing — Play Developer Community](https://support.google.com/googleplay/android-developer/thread/283988803/production-access-rejected-after-14-days-of-closed-testing?hl=en)
- [Repeated production access rejection despite completing all testing requirements](https://support.google.com/googleplay/android-developer/thread/396609566?hl=en&msgid=396652582)
- [PrimeTestLab — pricing](https://primetestlab.com/pricing-plan) · [7 legit ways to get 12 testers](https://primetestlab.com/blog/7-legit-ways-to-get-12-testers-for-google-play)
- [TestFi — 12 testers guide](https://www.testfi.app/blog/get-12-testers-google-play-closed-testing)
- [Testers Community](https://www.testerscommunity.com/) · [free tier](https://www.testerscommunity.com/free-app-testers)
- [Get12Testers](https://get12testers.com/) · [BetaTribe](https://betatribe.app/) · [Testers (Dinnger)](https://tester.dinnger.com/)
- [itch.io devlog — open for testers, closed testing on Google Play](https://itch.io/devlog/869393/open-for-testers-closed-testing-on-google-play-store.amp)

Independent sources on the requirement itself:

- **[No Country for Indie Developers — ACM TOSEM, DOI 10.1145/3736578](https://dl.acm.org/doi/10.1145/3736578)** — peer-reviewed; Reddit discourse analysis plus a survey of 14 indie developers who passed or were pursuing compliance. The best source on this subject. ([ResearchGate mirror](https://www.researchgate.net/publication/391969378_No_Country_for_Indie_Developers_A_Study_of_Google_Play's_Closed_Testing_Requirements_for_New_Personal_Developer_Accounts))
- Hacker News: [closed testing requirements are awful](https://news.ycombinator.com/item?id=40520051) · [20 testers announcement](https://news.ycombinator.com/item?id=38258101) · [need 12 testers](https://news.ycombinator.com/item?id=45468010) · [TestCrew](https://news.ycombinator.com/item?id=46013217)
- Google Play Developer Community: [closed testing worst thing ever](https://support.google.com/googleplay/android-developer/thread/353245020/closed-testing-worst-thing-ever?hl=en) · [rejected after 14 days](https://support.google.com/googleplay/android-developer/thread/283988803/production-access-rejected-after-14-days-of-closed-testing?hl=en) · [repeated rejection](https://support.google.com/googleplay/android-developer/thread/396609566?hl=en&msgid=396652582) · [no measurable criteria](https://support.google.com/googleplay/android-developer/thread/396948357/closed-testing-for-production-access-%E2%80%93-lack-of-clear-measurable-approval-criteria-for-indie-develop?hl=en)
- itch.io devlogs — indie game devs recruiting Play testers: [Renewed Pixel Dungeon](https://itch.io/devlog/1007452/please-join-the-closed-test-for-android-version) · [tester needed](https://itch.io/blog/1089564/tester-needed)
- [Trustpilot — testerscommunity.com](https://www.trustpilot.com/review/testerscommunity.com) · [20testers.com](https://www.trustpilot.com/review/20testers.com) · [12-testers-for-14-days](https://www.trustpilot.com/review/12-testers-for-14-days.github.io)

---

## Risk register

| Risk | Milestone | Mitigation |
| --- | --- | --- |
| S-02 does not measure faster on some platform | M0 | Spec already says: record it and revert. Not a failure. |
| S-06 transcode fails silently on one language | M0 | Assert every `AudioBuffer` decodes; never sign off by ear |
| S-07's jukebox/babel holes reappear | M0 | The tuning-banner state is the fix; test cases 4 and 5 cover it |
| Re-pointing `PREFS_BTN` breaks hit-test/draw agreement | M1 | It is one shared constant today — keep it one shared source |
| Posture decision reverses after M2 is built | M2 | Decide on a device after M1, not on paper before it |
| `fetch()` blocked by the wrap's origin | M4 | Verify on the very first build, before anything else |
| Lost upload keystore | M4/M5 | Back it up off-machine before the first upload. Unrecoverable. |
| Testers opt in and go quiet | M5 | Over-recruit to 18; give them the seven-question brief |
| Play target API deadline moves | M5 | API 36 from 31 Aug 2026 — re-check before building |

---

## If you only do three things

1. **M0's S-09** — resume audio on `visibilitychange`. One function. Fixes a bug
   that silences the compass after any notification.
2. **M0's S-06 + S-07** — compress and lazily load the voice bank. The cold open is
   currently broken on cellular.
3. **M0's S-11** — the viewport and touch CSS. Highest ratio of felt improvement to
   lines changed in the whole effort.

None of the three touches layout, none needs a decision from you, and all three
ship to existing players the day they land.

---

## Appendix — unread sources on the tester requirement

Everything here was found by search but **could not be opened** from the session
that wrote this document: Reddit is blocked to the crawler, and Hacker News,
`itch.io`, `support.google.com` and `dev.to` are blocked by the network proxy. So
none of it has been read, and the notes are what the search results implied, not
what the pages say. Bare URLs, for pasting.

### Read this one first

Peer-reviewed, and the only rigorous work on the subject. Method: Reddit discourse
analysis plus a survey of 14 indie devs who had passed the requirement or were
pursuing it.

    https://dl.acm.org/doi/10.1145/3736578
    https://www.researchgate.net/publication/391969378_No_Country_for_Indie_Developers_A_Study_of_Google_Play's_Closed_Testing_Requirements_for_New_Personal_Developer_Accounts

Paywalled at ACM; the ResearchGate entry is "Request PDF", and authors usually
send it if asked.

### Hacker News — developer discussion

    https://news.ycombinator.com/item?id=40520051   closed testing requirements are awful
    https://news.ycombinator.com/item?id=38258101   the original 20-tester announcement
    https://news.ycombinator.com/item?id=45468010   dev asking HN directly for 12 testers
    https://news.ycombinator.com/item?id=46013217   TestCrew: someone built mutual-aid tooling for this

### Google Play Developer Community — rejection threads

Devs describing what got them refused. The most direct evidence of failure modes.

    https://support.google.com/googleplay/android-developer/thread/353245020   "closed testing worst thing ever"
    https://support.google.com/googleplay/android-developer/thread/283988803   rejected after a full 14 days
    https://support.google.com/googleplay/android-developer/thread/396609566   repeated rejection despite meeting every stated requirement
    https://support.google.com/googleplay/android-developer/thread/396948357   no clear or measurable approval criteria

### itch.io — indie game devs doing exactly this

The closest match to your position: game devs recruiting Play testers off their own
itch pages.

    https://itch.io/devlog/1007452/please-join-the-closed-test-for-android-version
    https://itch.io/devlog/869393/open-for-testers-closed-testing-on-google-play-store
    https://itch.io/blog/1089564/tester-needed
    https://itch.io/t/5087435/lfs-tester-looking-for-android-users-for-google-play-beta-testing

### Reddit — no URLs, because the crawler is blocked

Search these yourself. `r/androiddev` is where the substantive discussion is; the
rest are recruitment venues.

    r/androiddev          "12 testers" · "closed testing" · "production access rejected"
    r/gamedev             "closed testing" android
    r/alphaandbetausers   recruitment
    r/betatests           recruitment
    r/androidapps         recruitment
    r/AndroidAppTesters   recruitment
    r/TestersCommunity    recruitment (note: shares a name with a vendor)

The ACM study's Reddit corpus is drawn from these, so the paper is a shortcut to
the same material.

### Vendor-authored — read as marketing, not testimony

Listed so they are recognisable, not to be trusted. The first is a first-person
"here's what I did wrong" confessional published on the vendor's own dev.to account.

    https://dev.to/testerscommunity/google-play-rejected-my-app-after-14-days-of-testing-here-is-what-i-did-wrong-3c21
    https://note.com/umark/n/nc114e6daafff
    https://primetestlab.com/blog/7-legit-ways-to-get-12-testers-for-google-play
    https://www.testfi.app/blog/get-12-testers-google-play-closed-testing
    https://testerbee.com/blog/google-play-12-testers-closed-testing
    https://20apptester.com/2026/06/20/google-play-closed-testing-en/

### Trustpilot — weak signal, see the caveat above

A review here records that testers were delivered, not that Google approved you.

    https://www.trustpilot.com/review/testerscommunity.com
    https://www.trustpilot.com/review/20testers.com
    https://www.trustpilot.com/review/12-testers-for-14-days.github.io

### The services themselves

    https://www.testerscommunity.com/          paid from $15; also a free credit tier
    https://primetestlab.com/pricing-plan      $19.99 for 12
    https://12-testers-for-14-days.github.io/  from $22.99
    https://www.testfi.app/                    $39.99 flat, auto-replacement
    https://get12testers.com/                  free credit exchange
    https://betatribe.app/                     free credit exchange
    https://tester.dinnger.com/                free credit exchange

### Google's own pages — the only authoritative ones

    https://support.google.com/googleplay/android-developer/answer/14151465    testing requirements for new personal accounts
    https://support.google.com/googleplay/android-developer/answer/11926878    target API level requirements
    https://support.google.com/googleplay/android-developer/answer/9845334     setting up open / closed / internal tests
    https://support.google.com/googleplay/android-developer/community-guide/255621488   the 12-testers community guide

Prices and thresholds throughout this document were checked in August 2026 and
move often. These four pages are the tiebreaker whenever anything else disagrees.

---

## Appendix — research prompts

For Perplexity or any search-grounded assistant with access to the sources above.
Three prompts rather than one: these tools return better work on a bounded question
than on a broad one. Run them separately.

### 1. First-hand accounts — the main one

```text
I'm a solo indie developer with an HTML5 browser game already published on
itch.io with an existing player base. I'm evaluating wrapping it with Capacitor
and publishing to Google Play. The obstacle is the closed-testing gate: 12
testers opted in continuously for 14 days, required for personal developer
accounts created on or after 13 November 2023.

I already know the mechanics and Google's stated rejection criteria. Do not
re-explain those. I need EVIDENCE — first-hand accounts from developers who
actually went through it.

Find and summarise:

1. Developers who COMPLETED closed testing and were granted production access.
   How did they recruit? How long did recruiting take? How many testers did they
   start with versus finish with? Approved first attempt, or rejected first?
2. Developers REJECTED after completing the full 14 days. What reason did Google
   give? What did they change? How long did the second attempt take?
3. Documented cases of Google rejecting or penalising developers specifically
   for using paid tester services, tester-swap groups, or credit exchanges. I
   want reported cases from affected developers — not vendors warning about
   rival vendors.
4. Anyone with an existing audience (itch.io followers, a Discord, a mailing
   list) who recruited organically, and how that compared on time and outcome.

Source constraints, applied strictly:

- EXCLUDE anything published by companies that sell testers, including their
  posts on dev.to, Medium and note.com, which they publish under their own
  accounts. Specifically ignore: testerscommunity.com, primetestlab.com,
  testfi.app, testerbee.com, 20apptester.com, 12testers.live, 20testers.com,
  12-testers-for-14-days.github.io, get12testers.com, betatribe.app,
  tester.dinnger.com, closedtesthelp.com, realapptesters.com,
  appconsolelab.com, ontest.app, getapphive.com.
- PRIORITISE: reddit.com/r/androiddev and r/gamedev, news.ycombinator.com,
  Google Play Developer Community threads on support.google.com, itch.io
  devlogs and forums, personal developer blogs, and the ACM TOSEM paper "No
  Country for Indie Developers" (DOI 10.1145/3736578).

For every claim give: source URL, date, whether the author is an independent
developer or has a commercial interest, and whether they actually shipped or are
only describing the process.

If you cannot find first-hand shipped accounts for any of the four questions,
say so explicitly rather than substituting vendor guidance. An honest "no
independent evidence found" is more useful to me than a confident summary of
marketing copy.
```

### 2. The services specifically

```text
For each of these Google Play tester services — Testers Community, PrimeTestLab,
TestFi, 12-testers-for-14-days, Get12Testers, BetaTribe, and tester.dinnger.com
— find discussion from OUTSIDE the vendor's own properties and outside
Trustpilot.

The outcome I care about is whether developers were granted PRODUCTION ACCESS
after using the service — not whether testers were delivered. Those are
different events roughly two weeks apart, and most reviews are collected after
the first and before the second. Treat any review that only confirms delivery as
not answering the question.

Look on reddit, Hacker News, Google Play Developer Community, and independent
developer blogs. Report negative and neutral accounts as prominently as positive
ones.

If the only available evidence for a given service is vendor-published or
Trustpilot, say that plainly for that service.
```

### 3. Currency check — run this last, before acting

```text
As of today, what is the current state of Google Play's closed testing
requirement for new personal developer accounts?

Specifically:
- Is it still 12 testers opted in for 14 continuous days?
- Has the 13 November 2023 account-creation cutoff changed?
- What is the current target API level requirement and its deadline?
- Any 2026 changes to how production access applications are reviewed?
- Any change to the $25 registration fee?

Cite only support.google.com and the official Android Developers Blog. Give the
publication or last-updated date for each page you cite. If a page contradicts
something widely repeated in secondary sources, say so.
```

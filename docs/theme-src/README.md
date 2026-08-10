# itch.io theme art — sources

Generators for the itch.io page images. Rendered from the game's palette (VT323,
`#ffd257` phosphor on `#060504`) so the page frames the embed rather than clashing
with it — no external art tools.

| Source | Output | Native size |
|---|---|---|
| `banner.html` | `../img/banner.png` | 960×300 |
| `background.html` | `../img/background.png` | 1920×1080 |

`font.css` holds the VT323 `@font-face` that both HTML files link. It points at
`assets/fonts/vt323-subset.woff2` — the same file the game ships — so the page art
and the game cannot drift onto different cuts of the face.

## Re-render

Serve the repo root, so the font path resolves, and screenshot the `#stage` element
at its native size:

```sh
./run.sh
# open http://localhost:8000/docs/theme-src/banner.html and .../background.html
# screenshot #stage → save over docs/img/banner.png and docs/img/background.png
```

The maze field is seeded (fixed LCG in each file), so re-rendering is deterministic —
the same glyph pattern every time.

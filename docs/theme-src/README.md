# itch.io theme art — sources

Generators for the itch.io page images. Rendered from the game's palette (VT323,
`#ffd257` phosphor on `#060504`) so the page frames the embed rather than clashing
with it — no external art tools.

| Source | Output | Native size |
|---|---|---|
| `banner.html` | `../img/banner.png` | 960×300 |
| `background.html` | `../img/background.png` | 1920×1080 |

`font.css` holds the VT323 `@font-face` (embedded woff2) that both HTML files link.
All three must sit in the same directory to render.

## Re-render

Serve this directory and screenshot the `#stage` element at its native size:

```sh
cd docs/theme-src
python3 -m http.server 8000
# open http://127.0.0.1:8000/banner.html and http://127.0.0.1:8000/background.html
# screenshot #stage → save over ../img/banner.png and ../img/background.png
```

The maze field is seeded (fixed LCG in each file), so re-rendering is deterministic —
the same glyph pattern every time.

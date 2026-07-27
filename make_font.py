#!/usr/bin/env python3
"""Build the game's font: VT323 plus the block glyphs it doesn't have.

VT323 carries no box-drawing or block characters at all, so the shade-block walls
the maze wants were being drawn by whatever fallback monospace the player's OS
supplied — a second typeface in the middle of a character grid, and tofu on a
machine with no such font. Google Fonts also splits VT323 into subsets that only
download on first use, so a level built from anything past Latin-1 flashes
fallback walls before the real ones arrive, and has nothing at all offline.

Packing our own fixes both: one file, self-hosted, with the blocks drawn in.

The blocks are sized to the game's character cell rather than to the font's em,
so a wall of them tiles with no seams. Shades are a stipple on an 8x8 subgrid,
the way a CP437 ROM font drew them — at this size the eye reads density, not dots.

Output is committed; this only needs re-running to change the glyphs.
Usage: ./make_font.py
"""
import os

from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.ttLib import TTFont

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "assets", "fonts", "VT323-Regular.ttf")
OUT = os.path.join(HERE, "assets", "fonts", "station-grid.woff2")

# Renamed because this is no longer VT323: it has glyphs VT323 never had. The OFL
# requires the derivative stay under the OFL and carry the original notice, which
# assets/fonts/OFL.txt does.
FAMILY = "Station Grid"

# The game's character cell, from config.js: an 800x600 canvas over 23 columns
# and 20 rows, drawn at 28px. Block ink is built to these, not to the em square,
# so a filled cell is exactly a filled cell.
CANVAS_W, CANVAS_H, COLS, ROWS, FONT_PX = 800, 600, 23, 20, 28
CELL_W_PX, CELL_H_PX = CANVAS_W / COLS, CANVAS_H / ROWS

UPEM = 1000
ADVANCE = 400  # VT323's own advance; keep it so the grid metrics don't shift

# Canvas centres a glyph on its advance box (textAlign) and on the midpoint
# between ascender and descender (textBaseline "middle"), so that is where the
# cell's centre lands in font units.
ASCENDER, DESCENDER = 800, -200
CX = ADVANCE / 2
CY = (ASCENDER + DESCENDER) / 2

CELL_W = CELL_W_PX / FONT_PX * UPEM
CELL_H = CELL_H_PX / FONT_PX * UPEM
X0, X1 = CX - CELL_W / 2, CX + CELL_W / 2
Y0, Y1 = CY - CELL_H / 2, CY + CELL_H / 2

SUB = 8  # stipple resolution, as in a CP437 ROM font


def rect(pen, x0, y0, x1, y1):
    pen.moveTo((x0, y0))
    pen.lineTo((x1, y0))
    pen.lineTo((x1, y1))
    pen.lineTo((x0, y1))
    pen.closePath()


def solid(pen):
    rect(pen, X0, Y0, X1, Y1)


def stipple(keep):
    """A shade: `keep(row, col)` decides which cells of the subgrid carry ink."""
    def draw(pen):
        w, h = (X1 - X0) / SUB, (Y1 - Y0) / SUB
        for r in range(SUB):
            for c in range(SUB):
                if keep(r, c):
                    x, y = X0 + c * w, Y0 + r * h
                    rect(pen, x, y, x + w, y + h)
    return draw


def half(x0f, y0f, x1f, y1f):
    def draw(pen):
        rect(pen, X0 + (X1 - X0) * x0f, Y0 + (Y1 - Y0) * y0f,
             X0 + (X1 - X0) * x1f, Y0 + (Y1 - Y0) * y1f)
    return draw


# Densities chosen so the ramp reads as even steps: a quarter, a half, three
# quarters, then solid.
BLOCKS = {
    0x2591: ("uni2591", stipple(lambda r, c: r % 2 == 0 and c % 2 == 0)),
    0x2592: ("uni2592", stipple(lambda r, c: (r + c) % 2 == 0)),
    0x2593: ("uni2593", stipple(lambda r, c: not (r % 2 and c % 2))),
    0x2588: ("uni2588", solid),
    0x2580: ("uni2580", half(0, 0.5, 1, 1)),
    0x2584: ("uni2584", half(0, 0, 1, 0.5)),
    0x258C: ("uni258C", half(0, 0, 0.5, 1)),
    0x2590: ("uni2590", half(0.5, 0, 1, 1)),
}


def main():
    src = TTFont(SRC)
    if src["head"].unitsPerEm != UPEM:
        raise SystemExit(f"{SRC}: expected {UPEM} upem, got {src['head'].unitsPerEm}")

    glyf, hmtx, cmap = src["glyf"], src["hmtx"], {}
    for table in src["cmap"].tables:
        cmap.update(table.cmap)

    order = list(src.getGlyphOrder())
    for code, (name, draw) in BLOCKS.items():
        if code in cmap:
            raise SystemExit(f"U+{code:04X} already in the source font — nothing to add")
        pen = TTGlyphPen(None)
        draw(pen)
        glyf[name] = pen.glyph()
        hmtx[name] = (ADVANCE, 0)
        cmap[code] = name
        order.append(name)

    src.setGlyphOrder(order)
    for table in src["cmap"].tables:
        table.cmap = cmap

    # Rename: this is a derivative, and calling it VT323 would misdescribe it.
    for rec in src["name"].names:
        text = str(rec)
        if rec.nameID == 1:
            rec.string = FAMILY
        elif rec.nameID == 4:
            rec.string = f"{FAMILY} Regular"
        elif rec.nameID == 6:
            rec.string = FAMILY.replace(" ", "") + "-Regular"
        elif rec.nameID == 0:
            rec.string = text + "; block glyphs added for finding_numbers"

    src.flavor = "woff2"
    src.save(OUT)
    print(f"wrote {OUT}  ({os.path.getsize(OUT) / 1024:.1f} KB)")
    print(f"  family      : {FAMILY}")
    print(f"  cell        : {CELL_W_PX:.2f} x {CELL_H_PX:.2f} px at {FONT_PX}px")
    print(f"  block ink   : x {X0:.0f}..{X1:.0f}   y {Y0:.0f}..{Y1:.0f} (font units)")
    print(f"  added       : {' '.join(chr(c) for c in BLOCKS)}")


if __name__ == "__main__":
    main()

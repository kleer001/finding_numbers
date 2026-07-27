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
from fontTools.ttLib.tables._c_m_a_p import CmapSubtable

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


def stipple_at(sub, keep):
    """`keep(row, col)` decides which squares of a `sub`x`sub` grid carry ink."""
    def draw(pen):
        w, h = (X1 - X0) / sub, (Y1 - Y0) / sub
        for r in range(sub):
            for c in range(sub):
                if keep(r, c):
                    x, y = X0 + c * w, Y0 + r * h
                    rect(pen, x, y, x + w, y + h)
    return draw


def stipple(keep):
    """A shade, on the CP437-style subgrid."""
    return stipple_at(SUB, keep)


def half(x0f, y0f, x1f, y1f):
    def draw(pen):
        rect(pen, X0 + (X1 - X0) * x0f, Y0 + (Y1 - Y0) * y0f,
             X0 + (X1 - X0) * x1f, Y0 + (Y1 - Y0) * y1f)
    return draw


def checker(sub):
    """A checkerboard at `sub` squares across the cell — half ink at any scale."""
    return stipple_at(sub, lambda r, c: (r + c) % 2 == 0)


# Masonry is drawn as the joints between blocks, not as filled blocks: a wall of
# line-work reads unmistakably as built structure while costing a fifth of the ink
# a filled one would, which is what keeps the opening levels dim.
STROKE = 70  # ~2px at the game's 28px, in font units


def hjoint(pen, yf, x0f=0.0, x1f=1.0):
    """A mortar line across the cell. Drawn just inside the edge it sits on, so
    the neighbouring cell's own line abuts it instead of doubling its width."""
    y = Y0 + (Y1 - Y0) * yf
    rect(pen, X0 + (X1 - X0) * x0f, y, X0 + (X1 - X0) * x1f, y + STROKE)


def vjoint(pen, xf, y0f=0.0, y1f=1.0):
    x = X0 + (X1 - X0) * xf
    rect(pen, x, Y0 + (Y1 - Y0) * y0f, x + STROKE, Y0 + (Y1 - Y0) * y1f)


def brick(pen):
    """Running bond: two courses, the upper one offset half a block."""
    hjoint(pen, 0.0)
    hjoint(pen, 0.5)
    vjoint(pen, 0.0, 0.0, 0.5)
    vjoint(pen, 0.5, 0.5, 1.0)


def ashlar(pen):
    """One large dressed block per cell."""
    hjoint(pen, 0.0)
    vjoint(pen, 0.0, 0.0, 1.0)


def grate(pen):
    """A cage: joints on both axes, quartering the cell."""
    hjoint(pen, 0.0)
    hjoint(pen, 0.5)
    vjoint(pen, 0.0, 0.0, 1.0)
    vjoint(pen, 0.5, 0.0, 1.0)


def rising(pen):
    """Corner to corner, bottom-left to top-right. Drawn as a parallelogram that
    stays inside the cell: ink outside it would spill into the corridors, which
    are simply cells nobody drew a wall in. Meeting at the corners is what lets
    neighbouring cells carry one unbroken diagonal across a whole wall."""
    t = STROKE
    pen.moveTo((X0, Y0))
    pen.lineTo((X0 + t, Y0))
    pen.lineTo((X1, Y1))
    pen.lineTo((X1 - t, Y1))
    pen.closePath()


def falling(pen):
    t = STROKE
    pen.moveTo((X0, Y1))
    pen.lineTo((X0 + t, Y1))
    pen.lineTo((X1, Y0))
    pen.lineTo((X1 - t, Y0))
    pen.closePath()


def crossed(pen):
    rising(pen)
    falling(pen)


def plate(pen):
    """A riveted panel: an inset border with a rivet at each corner."""
    i, o = 0.08, 0.92
    hjoint(pen, i, i, o)
    hjoint(pen, o, i, o)
    vjoint(pen, i, i, o)
    vjoint(pen, o, i, o)
    r = STROKE * 0.9
    for fx, fy in ((0.26, 0.24), (0.74, 0.24), (0.26, 0.72), (0.74, 0.72)):
        x, y = X0 + (X1 - X0) * fx, Y0 + (Y1 - Y0) * fy
        rect(pen, x, y, x + r, y + r)


# Densities chosen so the shades read as even steps: a quarter, a half, three
# quarters, then solid. The checkers are all half ink and differ only in scale,
# which is what lets three levels in a row share a brightness and still look like
# three different places — the same wall going blockier as it comes apart.
BLOCKS = {
    0x2591: ("uni2591", stipple(lambda r, c: r % 2 == 0 and c % 2 == 0)),
    0x2592: ("uni2592", stipple(lambda r, c: (r + c) % 2 == 0)),
    0x2593: ("uni2593", stipple(lambda r, c: not (r % 2 and c % 2))),
    0x2588: ("uni2588", solid),
    0x2580: ("uni2580", half(0, 0.5, 1, 1)),
    0x2584: ("uni2584", half(0, 0, 1, 0.5)),
    0x258C: ("uni258C", half(0, 0, 0.5, 1)),
    0x2590: ("uni2590", half(0.5, 0, 1, 1)),
    0x259A: ("uni259A", checker(2)),   # QUADRANT UPPER LEFT AND LOWER RIGHT
    0x1FB95: ("u1FB95", checker(4)),   # CHECKER BOARD FILL
    # Unicode has no character for a brick wall or a riveted panel, so the
    # masonry lives in the private-use area. These are ours; nothing else will
    # ever claim these codepoints, and they stay in the BMP where the inherited
    # format 4 subtables can carry them.
    0xE000: ("wallBrick", brick),
    0xE001: ("wallAshlar", ashlar),
    0xE002: ("wallPlate", plate),
    0xE003: ("wallGrate", grate),
    # Only the cross is encoded. Its two halves are drawn separately because that
    # is how a diagonal has to be built, not because either is a wall on its own.
    0x2573: ("uni2573", crossed),  # BOX DRAWINGS LIGHT DIAGONAL CROSS
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

    # The source font's subtables address the BMP only, so they get the BMP part;
    # handing them a codepoint above U+FFFF overflows the format on compile. The
    # rest of the range needs a format 12 subtable, which is where the astral
    # codepoints live.
    bmp = {c: g for c, g in cmap.items() if c <= 0xFFFF}
    for table in src["cmap"].tables:
        table.cmap = bmp

    if len(bmp) < len(cmap):
        fmt12 = CmapSubtable.newSubtable(12)
        fmt12.platformID, fmt12.platEncID, fmt12.format = 3, 10, 12
        fmt12.reserved, fmt12.length, fmt12.language, fmt12.nGroups = 0, 0, 0, 0
        fmt12.cmap = cmap
        src["cmap"].tables.append(fmt12)

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
    # Private-use codepoints have no glyph in the terminal's own font, so name
    # them rather than printing a blank.
    added = (f"U+{c:04X} {name}" if 0xE000 <= c <= 0xF8FF else f"U+{c:04X} {chr(c)}"
             for c, (name, _) in BLOCKS.items())
    print("  added       : " + ", ".join(added))


if __name__ == "__main__":
    main()

// The character grid itself: one font, one size, one glyph centred per cell. Every
// pass that writes to the screen goes through here, because "the whole screen is one
// uniform character grid" is the game's load-bearing visual rule and it only holds if
// the placement arithmetic has one home. Shared by the main renderer and the overflow
// corruption pass, which is also why it is not inside either of them.

import { CHAR, FONT_STACK } from "../game/config.js";

// The one font, at the one size, centred in the cell — the whole text-mode contract in
// one call, so no pass can quietly draw at a different size or alignment.
export function setGridText(ctx, fill) {
  ctx.fillStyle = fill;
  ctx.font = `${CHAR.FONT}px ${FONT_STACK}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
}

export function drawGlyph(ctx, ch, gx, gy) {
  ctx.fillText(ch, gx * CHAR.W + CHAR.W / 2, gy * CHAR.H + CHAR.H / 2);
}

// Iterated by code point, not code unit: one wall glyph is a surrogate pair (U+1FB95),
// and indexing with str[i] would hand fillText half a character, which draws as tofu.
export function drawText(ctx, str, col, row) {
  [...str].forEach((ch, i) => drawGlyph(ctx, ch, col + i, row));
}

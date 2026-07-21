import test from "node:test";
import assert from "node:assert/strict";

import { titleHit, BTN_CONTINUE, BTN_NEW } from "../src/render/title.js";

const center = (b) => [b.x + b.w / 2, b.y + b.h / 2];

test("title buttons map taps to actions", () => {
  assert.equal(titleHit(...center(BTN_CONTINUE)), "continue");
  assert.equal(titleHit(...center(BTN_NEW)), "new");
});

test("taps outside the buttons return null", () => {
  assert.equal(titleHit(0, 0), null); // top-left corner
  assert.equal(titleHit(BTN_CONTINUE.x - 5, BTN_CONTINUE.y), null); // gap left of CONTINUE
  assert.equal(titleHit(...center({ x: BTN_CONTINUE.x + BTN_CONTINUE.w, y: BTN_NEW.y, w: BTN_NEW.x - (BTN_CONTINUE.x + BTN_CONTINUE.w), h: BTN_NEW.h })), null); // gap between buttons
});

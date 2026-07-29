import test from "node:test";
import assert from "node:assert/strict";

import { glitchPlan, protectedMask } from "../src/render/glitch.js";
import { corruptionAt, OVERFLOW_FROM, NAMED_LEVELS, WALL_RAMP } from "../src/game/levels.js";
import { createState, setLevel } from "../src/game/state.js";
import { GRID, GLYPH } from "../src/game/config.js";
import { DIRS, isFloor } from "../src/maze/cell.js";

const at = (state, level) => { setLevel(state, level); return state; };

test("nothing corrupts before the counter overflows", () => {
  for (let level = 1; level < OVERFLOW_FROM; level++) {
    assert.equal(corruptionAt(level), 0, `level ${level} is the game as designed`);
  }
  const s = at(createState(1234, 1), 16);
  const plan = glitchPlan(s, 5000);
  assert.deepEqual([plan.rot, plan.drop, plan.clash], [[], [], []]);
});

test("depth climbs from the overflow and pins past the last named level", () => {
  assert.ok(corruptionAt(OVERFLOW_FROM) > 0);
  assert.ok(corruptionAt(40) > corruptionAt(OVERFLOW_FROM));
  assert.ok(corruptionAt(NAMED_LEVELS) > corruptionAt(40));
  // The ramp tops out and stays there: the counter gives up before the rot does,
  // and how far it can count is a separate dial from how fast the picture goes.
  assert.equal(corruptionAt(1000), 1);
  assert.equal(corruptionAt(100000), 1);
  assert.ok(corruptionAt(NAMED_LEVELS) <= 1);
});

// The guarantee the whole feature rests on.
test("corruption never selects a cell the player can stand on", () => {
  for (const seed of [1, 4242, 99999]) {
    for (const level of [OVERFLOW_FROM, 24, 40, NAMED_LEVELS, NAMED_LEVELS * 3]) {
      const s = at(createState(seed, 1), level);
      for (const now of [0, 1300, 7777, 45000]) {
        const plan = glitchPlan(s, now);
        for (const c of [...plan.rot, ...plan.drop]) {
          assert.ok(!isFloor(s.cell, c.x, c.y),
            `seed ${seed} level ${level} t=${now}: corrupted floor at ${c.x},${c.y}`);
        }
      }
    }
  }
});

test("the corridor lip is guarded, so a dropout can never read as a door", () => {
  const s = at(createState(7, 1), 40);
  const plan = glitchPlan(s, 0);
  for (const c of plan.drop) {
    const touchesFloor = Object.values(DIRS)
      .some(({ dx, dy }) => isFloor(s.cell, c.x + dx, c.y + dy));
    assert.ok(!touchesFloor, `dropout at ${c.x},${c.y} sits on a corridor edge`);
  }
});

test("the mask covers every walkable cell whether or not the lip is guarded", () => {
  const s = at(createState(99, 1), 40);
  for (const guard of [true, false]) {
    const mask = protectedMask(s.cell, guard);
    for (let y = 0; y < GRID.H; y++) {
      for (let x = 0; x < GRID.W; x++) {
        if (isFloor(s.cell, x, y)) assert.ok(mask.has(`${x},${y}`), `floor ${x},${y} unprotected`);
      }
    }
  }
  assert.ok(protectedMask(s.cell, true).size > protectedMask(s.cell, false).size);
});

// Corruption must hold still while the player is standing in a room — a set that
// re-rolls every frame reads as television static rather than a broken machine —
// and it must be the same damage on the way back, since it is keyed to the same
// room identity the maze uses to fix that room's walls.
test("a room wears the same damage every time it is entered", () => {
  const key = (p) => JSON.stringify([p.rot, p.drop, p.clash]);
  const s = at(createState(31337, 1), 40);
  const first = key(glitchPlan(s, 0));

  for (const t of [1, 10, 400, 1299]) {
    assert.equal(key(glitchPlan(s, t)), first, `re-rolled mid-tick at t=${t}`);
  }

  setLevel(s, 12);
  setLevel(s, 40);
  assert.equal(key(glitchPlan(s, 0)), first, "rebuilt from the seed, not re-rolled");

  // A different room in the same level wears different damage, or the corruption
  // would be one pattern stamped on every room in the game.
  s.progress.depth = 4;
  assert.notEqual(key(glitchPlan(s, 0)), first);
});

test("the corrupt set re-rolls across churn ticks", () => {
  const s = at(createState(555, 1), 40);
  const key = (p) => JSON.stringify(p.rot);
  assert.notEqual(key(glitchPlan(s, 0)), key(glitchPlan(s, 60000)));
});

test("corrupt glyphs come from the game's own wall set, never invented", () => {
  const allowed = new Set([...WALL_RAMP, ..."0123456789"]);
  const s = at(createState(8, 1), NAMED_LEVELS);
  for (const now of [0, 2600, 13000]) {
    for (const c of glitchPlan(s, now).rot) {
      assert.ok(allowed.has(c.g), `${c.g} is not a glyph this game ships`);
    }
  }
});

test("the deepest levels corrupt more than the first overflow level", () => {
  const count = (level) => {
    const s = at(createState(2024, 1), level);
    const p = glitchPlan(s, 0);
    return p.rot.length + p.drop.length;
  };
  assert.ok(count(NAMED_LEVELS) > count(OVERFLOW_FROM),
    "the ramp has to be visible or the depth dial does nothing");
});

test("corruption stays out of the HUD band", () => {
  const s = at(createState(6161, 1), NAMED_LEVELS);
  const plan = glitchPlan(s, 0);
  for (const c of [...plan.rot, ...plan.drop, ...plan.clash]) {
    assert.ok(c.y < GRID.H, `corruption at row ${c.y} reaches the HUD`);
  }
  assert.equal(GLYPH.WALL, "#"); // the grid convention the mask reads
});

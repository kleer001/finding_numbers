// Builds a cell's static ASCII tableau from which of its 4 sides have doors.
// A cell is a char grid: '#' wall, ' ' floor. Corridors are 2*half+1 wide and
// meet at the center junction. Start cells get a 4x4 open room; the source
// cell gets a glyph marker at center.

import { GRID, GLYPH } from "../game/config.js";

const { W, H, CX, CY } = GRID;

// Directional unit vectors + the door-opening column/row each carves toward.
export const DIRS = {
  N: { dx: 0, dy: -1 },
  S: { dx: 0, dy: 1 },
  E: { dx: 1, dy: 0 },
  W: { dx: -1, dy: 0 },
};

export const OPPOSITE = { N: "S", S: "N", E: "W", W: "E" };

function blankGrid() {
  return Array.from({ length: H }, () => Array.from({ length: W }, () => GLYPH.WALL));
}

function carve(grid, x, y) {
  if (y >= 0 && y < H && x >= 0 && x < W) grid[y][x] = GLYPH.FLOOR;
}

function carveJunction(grid, half) {
  for (let y = CY - half; y <= CY + half; y++)
    for (let x = CX - half; x <= CX + half; x++) carve(grid, x, y);
}

function carveCorridor(grid, dir, half) {
  if (dir === "N") for (let y = 0; y <= CY; y++) for (let x = CX - half; x <= CX + half; x++) carve(grid, x, y);
  if (dir === "S") for (let y = CY; y < H; y++) for (let x = CX - half; x <= CX + half; x++) carve(grid, x, y);
  if (dir === "E") for (let x = CX; x < W; x++) for (let y = CY - half; y <= CY + half; y++) carve(grid, x, y);
  if (dir === "W") for (let x = 0; x <= CX; x++) for (let y = CY - half; y <= CY + half; y++) carve(grid, x, y);
}

// The floor tile just inside a door opening (where the player stands on entry).
export function doorEntryTile(dir) {
  if (dir === "N") return { x: CX, y: 0 };
  if (dir === "S") return { x: CX, y: H - 1 };
  if (dir === "E") return { x: W - 1, y: CY };
  if (dir === "W") return { x: 0, y: CY };
}

// True if (x,y) sits in a door opening of `cell` for `dir` (edge exits).
// Openings match the cell's corridor width.
export function atDoor(dir, x, y, cell) {
  if (!cell.doors[dir]) return false;
  const half = cell.half;
  if (dir === "N") return y === 0 && x >= CX - half && x <= CX + half;
  if (dir === "S") return y === H - 1 && x >= CX - half && x <= CX + half;
  if (dir === "E") return x === W - 1 && y >= CY - half && y <= CY + half;
  if (dir === "W") return x === 0 && y >= CY - half && y <= CY + half;
  return false;
}

// doors: {N,S,E,W: bool}. kind: 'interior' | 'start' | 'source' | 'corridor'.
export function buildCell(doors, kind = "interior", half = GRID.HALF) {
  const grid = blankGrid();
  carveJunction(grid, half);
  for (const dir of Object.keys(DIRS)) if (doors[dir]) carveCorridor(grid, dir, half);

  if (kind === "start") {
    // 4x4 open room around center.
    for (let y = CY - 2; y <= CY + 1; y++)
      for (let x = CX - 2; x <= CX + 1; x++) carve(grid, x, y);
  }
  if (kind === "source") {
    grid[CY][CX] = GLYPH.SOURCE;
  }
  return { grid, doors, kind, half };
}

export function isFloor(cell, x, y) {
  if (y < 0 || y >= H || x < 0 || x >= W) return false;
  return cell.grid[y][x] !== GLYPH.WALL;
}

const ALL_DIRS = ["N", "S", "E", "W"];

// Generate a fresh cell as the player transitions into it. The maze is faked:
// each cell is built on the fly from the door it was entered through.
//   entryDir     - side the player enters from (the "back" door); null for start.
//   kind         - 'start' | 'source' | 'interior' | 'corridor'.
//   frontier     - if true (and interior), one forward door is the correct one.
//   forwardDoors - forward choices per interior cell (2 or 3; 3 opens all sides).
//   theme        - zone look: {wall, half}; array values are picked per cell.
//                  Non-load-bearing: it never changes where the doors are.
export function makeCell(entryDir, kind, rng, frontier, forwardDoors = 2, theme = {}) {
  const half = pickThemed(theme.half, rng) ?? GRID.HALF;
  const wallGlyph = pickThemed(theme.wall, rng) ?? GLYPH.WALL;
  const dress = (cell) => {
    cell.wallGlyph = wallGlyph;
    return cell;
  };

  if (kind === "start") {
    const exit = entryDir ?? rng.pick(ALL_DIRS); // one door; advances you onward
    const cell = dress(buildCell({ [exit]: true }, "start", half));
    cell.entryDir = null;
    cell.backDir = null;
    cell.correctDir = exit;
    return cell;
  }

  if (kind === "source") {
    const cell = dress(buildCell({ [entryDir]: true }, "source", half));
    cell.entryDir = entryDir;
    cell.backDir = entryDir;
    cell.correctDir = null;
    return cell;
  }

  // corridor: an empty pass-through — one way in, one way onward (straight or a
  // bend), no decision to make. Pure scenery between real junctions.
  if (kind === "corridor") {
    const exit = rng.pick(ALL_DIRS.filter((d) => d !== entryDir));
    const cell = dress(buildCell({ [entryDir]: true, [exit]: true }, "corridor", half));
    cell.entryDir = entryDir;
    cell.backDir = entryDir;
    cell.correctDir = null;
    return cell;
  }

  // interior: back door + forward choices (no dead-ends).
  const forwards = shuffle(ALL_DIRS.filter((d) => d !== entryDir), rng).slice(0, forwardDoors);
  const doors = { [entryDir]: true };
  for (const f of forwards) doors[f] = true;
  const cell = dress(buildCell(doors, "interior", half));
  cell.entryDir = entryDir;
  cell.backDir = entryDir;
  cell.correctDir = frontier ? rng.pick(forwards) : null;
  return cell;
}

function pickThemed(value, rng) {
  return Array.isArray(value) ? rng.pick(value) : value;
}

function shuffle(arr, rng) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = rng.int(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Which role a door plays when the player leaves through it.
export function doorRole(cell, dir) {
  if (dir === cell.correctDir) return "correct";
  if (dir === cell.backDir) return "back";
  return "wrong";
}

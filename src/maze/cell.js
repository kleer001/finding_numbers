// Builds a cell's static ASCII tableau from which of its 4 sides have doors.
// A cell is a char grid: '#' wall, ' ' floor. Corridors are 3 wide and meet at
// the center junction. Start cells get a 4x4 open room; the source cell gets a
// glyph marker at center.

import { GRID, GLYPH } from "../game/config.js";

const { W, H, CX, CY, HALF } = GRID;

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

function carveJunction(grid) {
  for (let y = CY - HALF; y <= CY + HALF; y++)
    for (let x = CX - HALF; x <= CX + HALF; x++) carve(grid, x, y);
}

function carveCorridor(grid, dir) {
  if (dir === "N") for (let y = 0; y <= CY; y++) for (let x = CX - HALF; x <= CX + HALF; x++) carve(grid, x, y);
  if (dir === "S") for (let y = CY; y < H; y++) for (let x = CX - HALF; x <= CX + HALF; x++) carve(grid, x, y);
  if (dir === "E") for (let x = CX; x < W; x++) for (let y = CY - HALF; y <= CY + HALF; y++) carve(grid, x, y);
  if (dir === "W") for (let x = 0; x <= CX; x++) for (let y = CY - HALF; y <= CY + HALF; y++) carve(grid, x, y);
}

// The floor tile just inside a door opening (where the player stands on entry).
export function doorEntryTile(dir) {
  if (dir === "N") return { x: CX, y: 0 };
  if (dir === "S") return { x: CX, y: H - 1 };
  if (dir === "E") return { x: W - 1, y: CY };
  if (dir === "W") return { x: 0, y: CY };
}

// True if (x,y) sits in a door opening for `dir` (used to detect edge exits).
export function atDoor(dir, x, y, doors) {
  if (!doors[dir]) return false;
  if (dir === "N") return y === 0 && x >= CX - HALF && x <= CX + HALF;
  if (dir === "S") return y === H - 1 && x >= CX - HALF && x <= CX + HALF;
  if (dir === "E") return x === W - 1 && y >= CY - HALF && y <= CY + HALF;
  if (dir === "W") return x === 0 && y >= CY - HALF && y <= CY + HALF;
  return false;
}

// doors: {N,S,E,W: bool}. kind: 'interior' | 'start' | 'source'.
export function buildCell(doors, kind = "interior") {
  const grid = blankGrid();
  carveJunction(grid);
  for (const dir of Object.keys(DIRS)) if (doors[dir]) carveCorridor(grid, dir);

  if (kind === "start") {
    // 4x4 open room around center.
    for (let y = CY - 2; y <= CY + 1; y++)
      for (let x = CX - 2; x <= CX + 1; x++) carve(grid, x, y);
  }
  if (kind === "source") {
    grid[CY][CX] = GLYPH.SOURCE;
  }
  return { grid, doors, kind };
}

export function isFloor(cell, x, y) {
  if (y < 0 || y >= H || x < 0 || x >= W) return false;
  return cell.grid[y][x] !== GLYPH.WALL;
}

const ALL_DIRS = ["N", "S", "E", "W"];

// Generate a fresh cell as the player transitions into it. The maze is faked:
// each cell is built on the fly from the door it was entered through.
//   entryDir  - side the player enters from (the "back" door); null for start.
//   kind      - 'start' | 'source' | 'interior'.
//   frontier  - if true (and interior), one forward door is the correct one.
export function makeCell(entryDir, kind, rng, frontier) {
  if (kind === "start") {
    const exit = entryDir ?? rng.pick(ALL_DIRS); // one door; advances you onward
    const cell = buildCell({ [exit]: true }, "start");
    cell.entryDir = null;
    cell.backDir = null;
    cell.correctDir = exit;
    return cell;
  }

  if (kind === "source") {
    const cell = buildCell({ [entryDir]: true }, "source");
    cell.entryDir = entryDir;
    cell.backDir = entryDir;
    cell.correctDir = null;
    return cell;
  }

  // interior: back door + two forward choices (3 doors total, no dead-ends).
  const forwards = shuffle(ALL_DIRS.filter((d) => d !== entryDir), rng).slice(0, 2);
  const doors = { [entryDir]: true, [forwards[0]]: true, [forwards[1]]: true };
  const cell = buildCell(doors, "interior");
  cell.entryDir = entryDir;
  cell.backDir = entryDir;
  cell.correctDir = frontier ? rng.pick(forwards) : null;
  return cell;
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

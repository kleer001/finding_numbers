// CRT phosphor burn-in: the splash screen, left glowing too long, wears a faint
// ghost into the tube. Average many splash frames into a grayscale intensity map
// — static pixels reach full, scrolling/flickering ones smear to a dim band,
// just as real burn-in records a still image but not moving content — then tint
// it to the current phosphor and add it faintly over the game every frame.
// Built once and cached; opt-in via the BURN-IN preference.

import { CANVAS } from "../game/config.js";
import { renderTitle } from "./title.js";
import { resetIntroBanner } from "./render.js";

const SAMPLES = 200; // splash frames averaged into the burn map
const SAMPLE_DT = 90; // ms between sampled frames; spans ~18s of animation
// Overlay opacity of the ghost. The CRT shader (brightness, scanlines, contrast)
// crushes low-intensity content far more than the bright live glyphs, so the
// ghost is drawn harder when the CRT is on to land at the same faint read.
const STRENGTH_RAW = 0.14;
const STRENGTH_CRT = 0.32;

let burnMap = null; // grayscale intensity of the averaged splash
let ghost = null; // burnMap tinted to the current phosphor
let ghostKey = null;

function makeCanvas() {
  const c = document.createElement("canvas");
  c.width = CANVAS.W;
  c.height = CANVAS.H;
  return c;
}

// Additively accumulate SAMPLES splash renders at 1/SAMPLES opacity: fully
// static pixels sum to white, half-lit ones to mid-gray. Rendered in white so
// the map is a pure intensity, independent of the amber/green tint.
function buildBurnMap(level) {
  const c = makeCanvas();
  const g = c.getContext("2d");
  g.fillStyle = "#000000";
  g.fillRect(0, 0, CANVAS.W, CANVAS.H);
  g.globalCompositeOperation = "lighter";
  g.globalAlpha = 1 / SAMPLES;
  const white = { fg: "#ffffff", bg: "#000000", rgb: [255, 255, 255] };
  for (let i = 0; i < SAMPLES; i++) renderTitle(g, white, level, i * SAMPLE_DT);
  resetIntroBanner(); // the sampling advanced the shared banner state; clear it
  return c;
}

// Multiply the grayscale map by the phosphor so black stays black and lit areas
// carry the amber/green tint.
function buildGhost(rgb) {
  const c = makeCanvas();
  const g = c.getContext("2d");
  g.drawImage(burnMap, 0, 0);
  g.globalCompositeOperation = "multiply";
  g.fillStyle = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
  g.fillRect(0, 0, CANVAS.W, CANVAS.H);
  return c;
}

export function renderBurnIn(ctx, tint, level, crtOn) {
  if (!burnMap) burnMap = buildBurnMap(level);
  const key = tint.rgb.join(",");
  if (ghostKey !== key) {
    ghost = buildGhost(tint.rgb);
    ghostKey = key;
  }
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = crtOn ? STRENGTH_CRT : STRENGTH_RAW;
  ctx.drawImage(ghost, 0, 0);
  ctx.restore();
}

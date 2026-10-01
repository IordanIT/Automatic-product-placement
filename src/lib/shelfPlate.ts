import { BAYS, DETECTIONS, LEVELS, PLATE } from "@/lib/data";
import type { Detection, FacetStatus } from "@/lib/types";

/**
 * Deterministic procedural "photograph" of a shelf run.
 *
 * In production this layer is a JPEG straight off the ceiling camera. Here it is
 * synthesised on a canvas so the overlay can be exercised at full fidelity
 * (sub-pixel zoom, hundreds of boxes) without shipping binary assets.
 * Everything is drawn from a fixed seed, so the plate is byte-stable.
 */

const FRAME = { x: 0.055, y: 0.085, w: 0.89, h: 0.845 };

/* -- deterministic noise --------------------------------------------- */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* -- packaging tones: muted, printed-substrate range ------------------ */
const TONES: Array<[string, string, string]> = [
  ["#2C3E50", "#3D5266", "#1E2C39"], // slate
  ["#B34747", "#C25B5B", "#8B3434"], // brick
  ["#2A6F5C", "#37856F", "#1E5244"], // forest
  ["#C4A574", "#D2B58A", "#9C8053"], // brass
  ["#8B8880", "#9C998F", "#6F6C64"], // warm grey
  ["#6E6B64", "#807D75", "#565349"], // dark grey
  ["#B3B0A7", "#C2BFB6", "#918E86"], // light grey
  ["#7A6A57", "#8D7C67", "#5F5243"], // kraft
  ["#4E6155", "#607465", "#3B4B41"], // muted green
  ["#8A6E52", "#9C8064", "#6B553E"], // tan
];

function toneFor(key: string) {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return TONES[h % TONES.length]!;
}

function roundedPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.arcTo(x + w, y, x + w, y + rr, rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.arcTo(x + w, y + h, x + w - rr, y + h, rr);
  ctx.lineTo(x + rr, y + h);
  ctx.arcTo(x, y + h, x, y + h - rr, rr);
  ctx.lineTo(x, y + rr);
  ctx.arcTo(x, y, x + rr, y, rr);
  ctx.closePath();
}

/* -- grain tile ------------------------------------------------------- */
let grainTile: HTMLCanvasElement | null = null;
function getGrain(): HTMLCanvasElement {
  if (grainTile) return grainTile;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const img = g.createImageData(128, 128);
  const r = mulberry32(4711);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 128 + (r() - 0.5) * 90;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 26;
  }
  g.putImageData(img, 0, 0);
  grainTile = c;
  return c;
}

/* ------------------------------------------------------------------ *
 * Photo plate                                                         *
 * ------------------------------------------------------------------ */
export function renderPlate(ctx: CanvasRenderingContext2D, w = PLATE.w, h = PLATE.h) {
  const X = FRAME.x * w;
  const Y = FRAME.y * h;
  const W = FRAME.w * w;
  const H = FRAME.h * h;
  const levelH = H / LEVELS.length;
  const bayW = W / BAYS.length;

  ctx.save();
  ctx.clearRect(0, 0, w, h);

  /* back wall */
  const wall = ctx.createLinearGradient(0, 0, w * 0.6, h);
  wall.addColorStop(0, "#DEDAD2");
  wall.addColorStop(0.45, "#D2CEC5");
  wall.addColorStop(1, "#C2BDB2");
  ctx.fillStyle = wall;
  ctx.fillRect(0, 0, w, h);

  /* soft wall panelling seams */
  ctx.strokeStyle = "rgba(28,28,26,0.06)";
  ctx.lineWidth = 1;
  for (let i = 1; i < 9; i++) {
    const px = (w / 9) * i;
    ctx.beginPath();
    ctx.moveTo(px, 0);
    ctx.lineTo(px, h);
    ctx.stroke();
  }

  /* shelf carcass: uprights + back panel shadow */
  const carcass = ctx.createLinearGradient(X, 0, X + W, 0);
  carcass.addColorStop(0, "rgba(28,28,26,0.10)");
  carcass.addColorStop(0.12, "rgba(28,28,26,0.02)");
  carcass.addColorStop(0.88, "rgba(28,28,26,0.02)");
  carcass.addColorStop(1, "rgba(28,28,26,0.12)");
  ctx.fillStyle = carcass;
  ctx.fillRect(X, Y - levelH * 0.5, W, H + levelH);

  /* boards */
  LEVELS.forEach((_lvl, li) => {
    const by = Y + (li + 1) * levelH;
    ctx.fillStyle = "rgba(28,28,26,0.16)";
    ctx.fillRect(X, by, W, 3);
    ctx.fillStyle = "#E6E2DA";
    ctx.fillRect(X, by + 3, W, 9);
    ctx.fillStyle = "#B7B2A8";
    ctx.fillRect(X, by + 12, W, 3);
    // price rail under the board lip
    ctx.fillStyle = "rgba(247,246,243,0.75)";
    ctx.fillRect(X + 4, by + 15, W - 8, 13);
    ctx.strokeStyle = "rgba(28,28,26,0.10)";
    ctx.strokeRect(X + 4.5, by + 15.5, W - 9, 12);
  });

  /* base plinth */
  ctx.fillStyle = "#B0ABA1";
  ctx.fillRect(X, Y + H, W, h - (Y + H));
  ctx.fillStyle = "rgba(28,28,26,0.10)";
  ctx.fillRect(X, Y + H, W, 2);

  /* uprights */
  const posts = 9;
  for (let i = 0; i <= posts; i++) {
    const px = X + (W / posts) * i - 2;
    const grad = ctx.createLinearGradient(px, 0, px + 4, 0);
    grad.addColorStop(0, "#9B968C");
    grad.addColorStop(0.4, "#D6D2C9");
    grad.addColorStop(1, "#8E8980");
    ctx.fillStyle = grad;
    ctx.fillRect(px, Y - levelH * 0.5, 4, H + levelH);
  }

  /* bay tags clipped to the price rail */
  ctx.font = "600 11px ui-monospace, monospace";
  ctx.textBaseline = "middle";
  BAYS.forEach((bay, bi) => {
    const px = X + bayW * bi;
    ctx.fillStyle = "rgba(28,28,26,0.72)";
    ctx.fillText(`Р${bi + 1}·${bay}`, px + 6, Y + 0.5 * levelH + 21);
  });

  /* products */
  const byStatus = new Map<number, Detection[]>();
  DETECTIONS.forEach((d) => {
    const li = LEVELS.indexOf(d.level as (typeof LEVELS)[number]);
    const key = li * 100 + BAYS.indexOf(d.bay as (typeof BAYS)[number]);
    const arr = byStatus.get(key) ?? [];
    arr.push(d);
    byStatus.set(key, arr);
  });

  byStatus.forEach((list) => {
    // draw left → right so overlap reads correctly
    list.sort((a, b) => a.x - b.x).forEach((d) => {
      drawUnit(ctx, d);
    });
  });

  /* shelf-edge label strip */
  LEVELS.forEach((lvl, li) => {
    const px = X + 8;
    const py = Y + li * levelH + 6;
    ctx.fillStyle = "rgba(247,246,243,0.9)";
    ctx.fillRect(px, py, 62, 15);
    ctx.strokeStyle = "rgba(28,28,26,0.25)";
    ctx.lineWidth = 1;
    ctx.strokeRect(px + 0.5, py + 0.5, 61, 14);
    ctx.fillStyle = "#3A3936";
    ctx.font = "600 10px ui-monospace, monospace";
    ctx.fillText(`L${lvl} · 44502`, px + 5, py + 8);
  });

  /* lighting: warm key from upper-left + vignette */
  const key = ctx.createRadialGradient(w * 0.24, h * 0.1, 40, w * 0.4, h * 0.4, w * 0.95);
  key.addColorStop(0, "rgba(255,247,232,0.20)");
  key.addColorStop(0.55, "rgba(255,247,232,0.04)");
  key.addColorStop(1, "rgba(40,36,30,0.20)");
  ctx.fillStyle = key;
  ctx.fillRect(0, 0, w, h);

  /* film grain */
  const pat = ctx.createPattern(getGrain(), "repeat");
  if (pat) {
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = pat;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

function drawUnit(ctx: CanvasRenderingContext2D, d: Detection) {
  // d.x / d.y are already normalised to the whole plate
  const x = d.x * PLATE.w;
  const y = d.y * PLATE.h;
  const w = d.w * PLATE.w;
  const h = d.h * PLATE.h;
  if (w < 3 || h < 3) return;

  const [base, mid, dark] = toneFor(d.sku);
  const r = mulberry32(d.sku.charCodeAt(d.sku.length - 1) * 977 + d.name.length);
  const kind = r();
  const gap = d.status === "oos";

  if (gap) {
    // empty slot: exposed shelf liner + dust line
    ctx.fillStyle = "#C6C1B7";
    roundedPath(ctx, x, y, w, h, 1);
    ctx.fill();
    ctx.fillStyle = "rgba(28,28,26,0.10)";
    ctx.fillRect(x + 1, y + h - 3, w - 2, 2);
    return;
  }

  // body
  const g = ctx.createLinearGradient(x, y, x + w, y + h);
  g.addColorStop(0, mid);
  g.addColorStop(0.55, base);
  g.addColorStop(1, dark);
  ctx.fillStyle = g;
  roundedPath(ctx, x, y, w, h, 1.5);
  ctx.fill();

  // top face (light from above)
  ctx.fillStyle = "rgba(255,255,255,0.16)";
  ctx.fillRect(x, y, w, Math.max(1, h * 0.07));

  // side shading
  ctx.fillStyle = "rgba(28,28,26,0.16)";
  ctx.fillRect(x + w - Math.max(1, w * 0.06), y, Math.max(1, w * 0.06), h);

  // shoulder / neck for bottles
  if (kind > 0.62 && h > 40) {
    ctx.fillStyle = dark;
    const nw = w * 0.42;
    ctx.fillRect(x + (w - nw) / 2, y - h * 0.1, nw, h * 0.12);
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.fillRect(x + (w - nw) / 2, y - h * 0.1, nw, 1);
  }

  // label block
  if (w > 12 && h > 22) {
    const lw = w * (kind > 0.4 ? 0.74 : 0.88);
    const lx = x + (w - lw) / 2;
    const ly = y + h * 0.26;
    const lh = h * 0.42;
    ctx.fillStyle = "rgba(247,246,243,0.86)";
    ctx.fillRect(lx, ly, lw, lh);
    ctx.strokeStyle = "rgba(28,28,26,0.22)";
    ctx.lineWidth = 1;
    ctx.strokeRect(lx + 0.5, ly + 0.5, lw - 1, lh - 1);

    // faux type
    ctx.fillStyle = "rgba(28,28,26,0.55)";
    const lines = Math.max(1, Math.min(3, Math.floor(lh / 7)));
    for (let i = 0; i < lines; i++) {
      const lw2 = lw * (i === 0 ? 0.72 : 0.5 - i * 0.08);
      ctx.fillRect(lx + 4, ly + 4 + i * 7, Math.max(4, lw2), 2);
    }
    // barcode on some packs
    if (kind > 0.55) {
      ctx.fillStyle = "rgba(28,28,26,0.42)";
      const bx = lx + 4;
      const by = ly + lh - 8;
      for (let i = 0, x0 = bx; i < 14 && x0 < lx + lw - 4; i++) {
        const bw = r() > 0.5 ? 1 : 2;
        ctx.fillRect(x0, by, bw, 5);
        x0 += bw + 1;
      }
    }
  }

  // mis-facing: a sliver of the pack's back panel peeking through
  if (d.status === "facing") {
    ctx.fillStyle = "rgba(28,28,26,0.30)";
    ctx.fillRect(x + w * 0.42, y + h * 0.2, w * 0.5, h * 0.62);
    ctx.fillStyle = "rgba(247,246,243,0.28)";
    ctx.fillRect(x + w * 0.46, y + h * 0.28, w * 0.42, h * 0.16);
  }

  // contact shadow
  ctx.fillStyle = "rgba(28,28,26,0.22)";
  ctx.fillRect(x + 1, y + h, w - 2, 2);
}

/* ------------------------------------------------------------------ *
 * Schema plate — vector planogram, no photograph                     *
 * ------------------------------------------------------------------ */
export function renderSchema(
  ctx: CanvasRenderingContext2D,
  w = PLATE.w,
  h = PLATE.h,
  opts: { highlight?: string | null } = {},
) {
  const X = FRAME.x * w;
  const Y = FRAME.y * h;
  const W = FRAME.w * w;
  const H = FRAME.h * h;
  const levelH = H / LEVELS.length;
  const bayW = W / BAYS.length;

  ctx.save();
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#F7F6F3";
  ctx.fillRect(0, 0, w, h);

  // drafting grid
  ctx.strokeStyle = "rgba(214,212,207,0.55)";
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(w, y + 0.5);
    ctx.stroke();
  }

  // frame
  ctx.strokeStyle = "#1C1C1A";
  ctx.lineWidth = 2;
  ctx.strokeRect(X, Y - levelH * 0.42, W, H + levelH * 0.84);

  // bay dividers + level rules
  ctx.strokeStyle = "rgba(28,28,26,0.30)";
  ctx.lineWidth = 1;
  BAYS.forEach((_b, i) => {
    const px = Math.round(X + bayW * i) + 0.5;
    ctx.beginPath();
    ctx.moveTo(px, Y - levelH * 0.42);
    ctx.lineTo(px, Y + H + levelH * 0.42);
    ctx.stroke();
  });
  LEVELS.forEach((_l, li) => {
    const py = Math.round(Y + li * levelH) + 0.5;
    ctx.beginPath();
    ctx.moveTo(X, py);
    ctx.lineTo(X + W, py);
    ctx.stroke();
  });

  // cells — same geometry as the photo, so the bbox overlay lines up
  const cellOf = (d: Detection) => ({
    x: d.x * w,
    y: d.y * h,
    w: d.w * w,
    h: d.h * h,
  });

  DETECTIONS.forEach((d) => {
    paintCell(ctx, cellOf(d), d.status, opts.highlight === d.id, d);
  });

  // empty facing slots get hatched
  DETECTIONS.filter((d) => d.status === "oos").forEach((d) => {
    const cell = cellOf(d);
    ctx.save();
    ctx.beginPath();
    ctx.rect(cell.x, cell.y, cell.w, cell.h);
    ctx.clip();
    ctx.strokeStyle = "rgba(179,71,71,0.45)";
    ctx.lineWidth = 1;
    for (let i = -cell.h; i < cell.w; i += 7) {
      ctx.beginPath();
      ctx.moveTo(cell.x + i, cell.y + cell.h);
      ctx.lineTo(cell.x + i + cell.h, cell.y);
      ctx.stroke();
    }
    ctx.restore();
  });

  // labels
  ctx.font = "600 12px ui-monospace, monospace";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#1C1C1A";
  BAYS.forEach((bay, bi) => {
    ctx.fillText(bay, X + bayW * bi + 10, Y - levelH * 0.42 + 14);
  });
  LEVELS.forEach((lvl, li) => {
    ctx.fillText(`L${lvl}`, X - 34, Y + li * levelH + levelH * 0.5);
  });

  // dimension line along the bottom
  const dy = Y + H + levelH * 0.5;
  ctx.strokeStyle = "#C4A574";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(X, dy);
  ctx.lineTo(X + W, dy);
  ctx.stroke();
  [X, X + W / 2, X + W].forEach((px) => {
    ctx.beginPath();
    ctx.moveTo(px, dy - 5);
    ctx.lineTo(px, dy + 5);
    ctx.stroke();
  });
  ctx.fillStyle = "#F7F6F3";
  ctx.fillRect(X + W / 2 - 46, dy - 8, 92, 16);
  ctx.strokeStyle = "#C4A574";
  ctx.strokeRect(X + W / 2 - 46.5, dy - 8.5, 93, 17);
  ctx.fillStyle = "#1C1C1A";
  ctx.textAlign = "center";
  ctx.fillText("2400 мм", X + W / 2, dy);
  ctx.textAlign = "left";

  ctx.restore();
}

function paintCell(
  ctx: CanvasRenderingContext2D,
  c: { x: number; y: number; w: number; h: number },
  status: FacetStatus,
  hi: boolean,
  d: Detection,
) {
  ctx.save();
  if (status === "ok") {
    ctx.fillStyle = hi ? "rgba(42,111,92,0.30)" : "rgba(42,111,92,0.14)";
  } else if (status === "facing" || status === "phantom") {
    ctx.fillStyle = hi ? "rgba(196,165,116,0.34)" : "rgba(196,165,116,0.18)";
  } else {
    ctx.fillStyle = hi ? "rgba(179,71,71,0.26)" : "rgba(179,71,71,0.10)";
  }
  ctx.fillRect(c.x, c.y, c.w, c.h);

  if (hi) {
    ctx.strokeStyle = "#1C1C1A";
    ctx.lineWidth = 2;
    ctx.strokeRect(c.x - 1, c.y - 1, c.w + 2, c.h + 2);
  }

  ctx.strokeStyle =
    status === "ok" ? "rgba(42,111,92,0.55)" : status === "facing" ? "rgba(156,128,83,0.7)" : "rgba(179,71,71,0.65)";
  ctx.lineWidth = 1;
  ctx.strokeRect(c.x + 0.5, c.y + 0.5, c.w - 1, c.h - 1);

  if (c.w > 46 && c.h > 26) {
    ctx.fillStyle = "rgba(28,28,26,0.72)";
    ctx.font = "10px ui-monospace, monospace";
    ctx.fillText(d.sku, c.x + 5, c.y + 12);
    ctx.fillStyle = "rgba(28,28,26,0.42)";
    ctx.font = "9px ui-monospace, monospace";
    ctx.fillText(`${d.actual}/${d.expected}`, c.x + 5, c.y + 24);
  }
  ctx.restore();
}

/* ------------------------------------------------------------------ *
 * Offscreen cache                                                    *
 * ------------------------------------------------------------------ */
const cache = new Map<string, HTMLCanvasElement>();

export function getPlate(mode: "photo" | "schema", highlight?: string | null) {
  const key = `${mode}:${highlight ?? ""}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = PLATE.w;
  c.height = PLATE.h;
  const ctx = c.getContext("2d")!;
  if (mode === "photo") renderPlate(ctx);
  else renderSchema(ctx, PLATE.w, PLATE.h, { highlight });
  cache.set(key, c);
  return c;
}

export function clearPlateCache() {
  cache.clear();
}
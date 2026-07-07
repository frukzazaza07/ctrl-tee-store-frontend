// One-time asset generator for placeholder garment "photos".
//
// There is no image backend and no real product photography yet, so this
// script rasterizes the same body/neckline silhouettes that used to be drawn
// live as SVG (see the old GarmentMockup.tsx) into real PNG files, once, at
// build/maintenance time. Swapping in real photography later means replacing
// the files under public/garments/ and the URLs in data/garments.json — no
// component code changes.
//
// Zero new dependencies: PNG encoding uses only node:zlib (deflate) plus a
// hand-rolled CRC32/chunk writer, and rasterization is a plain scanline
// polygon fill.
//
// Usage: node scripts/generate-garment-photos.mjs

import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const WIDTH = 480;
const HEIGHT = 600;
const SCALE = 1.2; // WIDTH/HEIGHT is a 1.2x scale of the legacy 400x500 viewBox

const GARMENT_COLORS = [
  { id: "black", hex: "#08090b" },
  { id: "white", hex: "#f5f6f7" },
  { id: "red", hex: "#e4002b" },
  { id: "stone", hex: "#a89f91" },
  { id: "navy", hex: "#1b2a4a" },
  { id: "olive", hex: "#4a4f3a" },
];

// ---- geometry (scaled from the legacy 400x500 SVG path coordinates) ----

function scale(points) {
  return points.map(([x, y]) => [x * SCALE, y * SCALE]);
}

const SHORT_SLEEVE_BODY = scale([
  [140, 70], [120, 110], [60, 140], [85, 205], [135, 178], [135, 460],
  [265, 460], [265, 178], [315, 205], [340, 140], [280, 110], [260, 70],
]);

const LONG_SLEEVE_BODY = scale([
  [140, 70], [120, 110], [55, 140], [60, 340], [110, 335], [135, 200],
  [135, 460], [265, 460], [265, 200], [290, 335], [340, 340], [345, 140],
  [280, 110], [260, 70],
]);

function quadBezier(p0, pc, p1, segments = 12) {
  const pts = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const mt = 1 - t;
    pts.push([
      mt * mt * p0[0] + 2 * mt * t * pc[0] + t * t * p1[0],
      mt * mt * p0[1] + 2 * mt * t * pc[1] + t * t * p1[1],
    ]);
  }
  return pts;
}

const CREW_NECK = scale(quadBezier([165, 70], [200, 105], [235, 70]));
const V_NECK = scale([[170, 70], [200, 140], [230, 70]]);

const STYLE_SHAPES = {
  crew: { body: SHORT_SLEEVE_BODY, neckFront: CREW_NECK, neckBack: CREW_NECK },
  vneck: { body: SHORT_SLEEVE_BODY, neckFront: V_NECK, neckBack: CREW_NECK },
  "long-sleeve": { body: LONG_SLEEVE_BODY, neckFront: CREW_NECK, neckBack: CREW_NECK },
};

// Print-area rectangles, as % of image width/height — a safe torso zone that
// clears the sleeves and neckline for every style at this silhouette.
const PRINT_AREA = {
  front: { x: 20, y: 20, width: 60, height: 50 },
  back: { x: 20, y: 15, width: 60, height: 55 },
};

// ---- rasterization ----

function fillPolygonMask(mask, w, h, points) {
  const ys = points.map((p) => p[1]);
  const minY = Math.max(0, Math.floor(Math.min(...ys)));
  const maxY = Math.min(h - 1, Math.ceil(Math.max(...ys)));
  for (let y = minY; y <= maxY; y++) {
    const yc = y + 0.5;
    const xs = [];
    for (let i = 0; i < points.length; i++) {
      const [x1, y1] = points[i];
      const [x2, y2] = points[(i + 1) % points.length];
      if ((y1 <= yc && y2 > yc) || (y2 <= yc && y1 > yc)) {
        const t = (yc - y1) / (y2 - y1);
        xs.push(x1 + t * (x2 - x1));
      }
    }
    xs.sort((a, b) => a - b);
    for (let i = 0; i + 1 < xs.length; i += 2) {
      const xStart = Math.max(0, Math.round(xs[i]));
      const xEnd = Math.min(w - 1, Math.round(xs[i + 1]));
      for (let x = xStart; x <= xEnd; x++) mask[y * w + x] = 1;
    }
  }
}

function hexToRgb(hex) {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mixChannel(a, b, t) {
  return Math.round(a + (b - a) * t);
}

function isEdge(mask, w, h, x, y) {
  if (x === 0 || y === 0 || x === w - 1 || y === h - 1) return true;
  return !(mask[y * w + x - 1] && mask[y * w + x + 1] && mask[(y - 1) * w + x] && mask[(y + 1) * w + x]);
}

function renderGarment(style, view, colorHex) {
  const shape = STYLE_SHAPES[style];
  const bodyMask = new Uint8Array(WIDTH * HEIGHT);
  const neckMask = new Uint8Array(WIDTH * HEIGHT);
  fillPolygonMask(bodyMask, WIDTH, HEIGHT, shape.body);
  fillPolygonMask(neckMask, WIDTH, HEIGHT, view === "front" ? shape.neckFront : shape.neckBack);

  const bodyYs = shape.body.map((p) => p[1]);
  const minY = Math.min(...bodyYs);
  const maxY = Math.max(...bodyYs);
  const [r, g, b] = hexToRgb(colorHex);
  const seamX = Math.round(WIDTH / 2);

  const rgba = Buffer.alloc(WIDTH * HEIGHT * 4);
  for (let y = 0; y < HEIGHT; y++) {
    // Soft neutral studio backdrop with a gentle vertical gradient.
    const backdropT = y / HEIGHT;
    const back = mixChannel(232, 214, backdropT);
    for (let x = 0; x < WIDTH; x++) {
      const idx = (y * WIDTH + x) * 4;
      const i = y * WIDTH + x;

      if (!bodyMask[i]) {
        rgba[idx] = back;
        rgba[idx + 1] = back - 3;
        rgba[idx + 2] = back - 8;
        rgba[idx + 3] = 255;
        continue;
      }

      if (neckMask[i]) {
        // Shadowed interior of the neckline/collar.
        rgba[idx] = mixChannel(r, 10, 0.65);
        rgba[idx + 1] = mixChannel(g, 10, 0.65);
        rgba[idx + 2] = mixChannel(b, 10, 0.65);
        rgba[idx + 3] = 255;
        continue;
      }

      // Studio top-light: brighter near the shoulders, darker toward the hem,
      // plus a mild horizontal vignette for a rounded, photographed look.
      const vFrac = (y - minY) / Math.max(1, maxY - minY);
      const vShade = 1.08 - 0.28 * Math.min(1, Math.max(0, vFrac));
      const hFrac = Math.abs(x / WIDTH - 0.5) * 2;
      const hShade = 1 - 0.12 * hFrac;
      let shade = vShade * hShade;

      // Center-seam hint on the back view.
      if (view === "back" && Math.abs(x - seamX) <= 1) shade *= 0.9;

      // Subtle darkened silhouette edge, like a photographed garment outline.
      if (isEdge(bodyMask, WIDTH, HEIGHT, x, y)) shade *= 0.72;

      rgba[idx] = Math.min(255, Math.round(r * shade));
      rgba[idx + 1] = Math.min(255, Math.round(g * shade));
      rgba[idx + 2] = Math.min(255, Math.round(b * shade));
      rgba[idx + 3] = 255;
    }
  }
  return rgba;
}

// ---- minimal PNG encoder (signature + IHDR + IDAT + IEND) ----

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function encodePng(width, height, rgba) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type: truecolor + alpha
  const ihdr = chunk("IHDR", ihdrData);

  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // filter: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const idat = chunk("IDAT", deflateSync(raw, { level: 9 }));
  const iend = chunk("IEND", Buffer.alloc(0));
  return Buffer.concat([signature, ihdr, idat, iend]);
}

// ---- main ----

function main() {
  const garmentsPath = path.join(ROOT, "data", "garments.json");
  const garments = JSON.parse(readFileSync(garmentsPath, "utf8"));

  for (const garment of garments) {
    const style = garment.id;
    const outDirBase = path.join(ROOT, "public", "garments", style);
    const images = {};

    for (const { id: colorId, hex } of GARMENT_COLORS) {
      const colorDir = path.join(outDirBase, colorId);
      mkdirSync(colorDir, { recursive: true });
      const urls = {};
      for (const view of ["front", "back"]) {
        const rgba = renderGarment(style, view, hex);
        const png = encodePng(WIDTH, HEIGHT, rgba);
        const fileName = `${view}.png`;
        writeFileSync(path.join(colorDir, fileName), png);
        urls[view] = `/garments/${style}/${colorId}/${fileName}`;
      }
      images[colorId] = urls;
    }

    garment.images = images;
    garment.printArea = PRINT_AREA;
    console.log(`Generated photos for "${style}"`);
  }

  writeFileSync(garmentsPath, `${JSON.stringify(garments, null, 2)}\n`);
  console.log(`Updated ${path.relative(ROOT, garmentsPath)}`);
}

main();

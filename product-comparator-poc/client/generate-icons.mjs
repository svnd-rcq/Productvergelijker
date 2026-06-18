// Genereert app-iconen als PNG via jimp (pure JS, geen native bindings)
// Draai éénmalig met: node generate-icons.mjs
import { Jimp } from 'jimp';
import { mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Brand kleuren (RGBA hex) ──────────────────────────────────────────────────
const BG    = 0x033047ff; // brand-dark  – achtergrond
const TEAL  = 0x31B6C3ff; // brand-blue  – lens vulling
const GREEN = 0x3FD1B7ff; // brand-green – winnaar accent
const WHITE = 0xffffffff;
const LIGHT = 0xD3E4EFff; // brand-light – secundaire balk

// ── Teken-hulpfuncties ────────────────────────────────────────────────────────

function fillDisc(img, cx, cy, r, color) {
  const r2 = r * r;
  for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) {
    for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
      if ((x - cx) ** 2 + (y - cy) ** 2 <= r2) img.setPixelColor(color, x, y);
    }
  }
}

function fillRing(img, cx, cy, innerR, outerR, color) {
  const r0 = innerR * innerR, r1 = outerR * outerR;
  for (let y = Math.floor(cy - outerR); y <= Math.ceil(cy + outerR); y++) {
    for (let x = Math.floor(cx - outerR); x <= Math.ceil(cx + outerR); x++) {
      const d2 = (x - cx) ** 2 + (y - cy) ** 2;
      if (d2 >= r0 && d2 <= r1) img.setPixelColor(color, x, y);
    }
  }
}

function fillRect(img, x0, y0, w, h, color) {
  for (let y = y0; y < y0 + h; y++)
    for (let x = x0; x < x0 + w; x++)
      img.setPixelColor(color, x, y);
}

function fillRoundedRect(img, x0, y0, w, h, r, color) {
  for (let y = y0; y < y0 + h; y++) {
    for (let x = x0; x < x0 + w; x++) {
      const nx = Math.min(x - x0, x0 + w - 1 - x);
      const ny = Math.min(y - y0, y0 + h - 1 - y);
      if (nx >= r || ny >= r) { img.setPixelColor(color, x, y); continue; }
      const cornerX = (x - x0 < r) ? x0 + r : x0 + w - 1 - r;
      const cornerY = (y - y0 < r) ? y0 + r : y0 + h - 1 - r;
      if ((x - cornerX) ** 2 + (y - cornerY) ** 2 <= r * r) img.setPixelColor(color, x, y);
    }
  }
}

function drawThickLine(img, x1, y1, x2, y2, hw, color) {
  const dx = x2 - x1, dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  const hw2 = hw * hw;
  const bx = Math.floor(Math.min(x1, x2)) - Math.ceil(hw + 1);
  const ex = Math.ceil(Math.max(x1, x2))  + Math.ceil(hw + 1);
  const by = Math.floor(Math.min(y1, y2)) - Math.ceil(hw + 1);
  const ey = Math.ceil(Math.max(y1, y2))  + Math.ceil(hw + 1);
  for (let y = by; y <= ey; y++) {
    for (let x = bx; x <= ex; x++) {
      let d2;
      if (len2 === 0) {
        d2 = (x - x1) ** 2 + (y - y1) ** 2;
      } else {
        const t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / len2));
        d2 = (x - x1 - t * dx) ** 2 + (y - y1 - t * dy) ** 2;
      }
      if (d2 <= hw2) img.setPixelColor(color, x, y);
    }
  }
}

async function makeIcon(size, outputPath) {
  function px(v) { return Math.round(v * (size / 512)); }

  const img = new Jimp({ width: size, height: size, color: 0x00000000 });

  // 1. Afgeronde achtergrond in brand-dark
  fillRoundedRect(img, 0, 0, size, size, px(88), BG);

  // 2. Lens vulling (teal schijf)
  const lx = px(218), ly = px(208);
  const outerR = px(150), ringW = px(22);
  const innerR = outerR - ringW;
  fillDisc(img, lx, ly, innerR, TEAL);

  // 3. Subtiele binnenrand voor diepte (lichtere teal)
  fillRing(img, lx, ly, innerR - px(5), innerR, 0x5ECFD8ff);

  // 4. Vergelijkingsbalken in de lens
  const bw   = px(34);
  const gap  = px(20);
  const base = ly + px(60);

  // Linker/secundaire balk (lichtblauw, lager)
  const hA  = px(50);
  const bAx = lx - Math.round(gap / 2) - bw;
  fillRect(img, bAx, base - hA, bw, hA, LIGHT);

  // Rechter/winnaar balk (wit, hoger)
  const hB  = px(86);
  const bBx = lx + Math.round(gap / 2);
  fillRect(img, bBx, base - hB, bw, hB, WHITE);

  // Gedeelde basislijn
  fillRect(img, bAx - px(5), base, bw * 2 + gap + px(10), px(5), WHITE);

  // 5. Winnaar accent (groene stip boven rechter balk)
  fillDisc(img, bBx + Math.round(bw / 2), base - hB - px(17), px(12), GREEN);

  // 6. Witte lensring
  fillRing(img, lx, ly, innerR, outerR, WHITE);

  // 7. Handvat (Q-staart / vergrootglas greep) – 45° diagonaal rechtsonder
  const angle = Math.PI / 4;
  const hx1 = lx + Math.round(Math.cos(angle) * innerR);
  const hy1 = ly + Math.round(Math.sin(angle) * innerR);
  const hx2 = lx + px(198);
  const hy2 = ly + px(198);
  drawThickLine(img, hx1, hy1, hx2, hy2, Math.round(ringW / 2), WHITE);

  await img.write(outputPath);
  console.log(`Aangemaakt: ${outputPath}`);
}

const publicDir = join(__dirname, 'public');
const iconsDir = join(publicDir, 'icons');
mkdirSync(iconsDir, { recursive: true });

await makeIcon(192, join(iconsDir, 'icon-192.png'));
await makeIcon(512, join(iconsDir, 'icon-512.png'));
await makeIcon(180, join(publicDir, 'apple-touch-icon.png'));

console.log('Klaar!');

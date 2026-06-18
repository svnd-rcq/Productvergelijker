// Genereert app-iconen als PNG via jimp (pure JS, geen native bindings)
// Draai éénmalig met: node generate-icons.mjs
import { Jimp } from 'jimp';
import { mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function makeIcon(size, outputPath) {
  const img = new Jimp({ width: size, height: size, color: 0x6366f1ff });

  // Wit vierkant als camera-body (gesimplificeerd icoon)
  const margin = Math.round(size * 0.2);
  const bw = size - margin * 2;
  const bh = Math.round(bw * 0.65);
  const bx = margin;
  const by = Math.round((size - bh) / 2) + Math.round(size * 0.04);

  for (let y = by; y < by + bh; y++) {
    for (let x = bx; x < bx + bw; x++) {
      img.setPixelColor(0xffffffff, x, y);
    }
  }

  // Lens: gevulde cirkel in indigoblauw
  const cx = Math.round(size / 2);
  const cy = Math.round(size / 2) + Math.round(size * 0.04);
  const lr = Math.round(size * 0.14);
  for (let y = cy - lr; y <= cy + lr; y++) {
    for (let x = cx - lr; x <= cx + lr; x++) {
      if ((x - cx) ** 2 + (y - cy) ** 2 <= lr ** 2) {
        img.setPixelColor(0x6366f1ff, x, y);
      }
    }
  }

  // Lens ring: witte ring
  const rr = Math.round(size * 0.09);
  const rw = Math.max(2, Math.round(size * 0.02));
  for (let y = cy - lr; y <= cy + lr; y++) {
    for (let x = cx - lr; x <= cx + lr; x++) {
      const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      if (d >= rr - rw && d <= rr + rw) {
        img.setPixelColor(0xffffffff, x, y);
      }
    }
  }

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

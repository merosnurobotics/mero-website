import sharp from "sharp";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs/promises";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "public/brand/mechanical-engineering.png");
const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const light = Buffer.from(data);
const dark = Buffer.from(data);

for (let offset = 0; offset < data.length; offset += 4) {
  const [red, green, blue] = data.subarray(offset, offset + 3);
  if (red === 255 && green === 255 && blue === 255) {
    light.fill(0, offset, offset + 4);
    dark.fill(0, offset, offset + 4);
    continue;
  }
  const orange = red - blue > 6 && green - blue > 2;
  // The original has flat gray/orange inks with white-matted edge pixels.
  // Darker original ink stays opaque; only the white contribution is removed.
  const darkestInk = orange ? 38 : 127;
  const alpha = Math.min(255, Math.max(1, Math.round((255 - Math.min(red, green, blue)) * 255 / (255 - darkestInk))));
  const opacity = alpha / 255;
  for (let channel = 0; channel < 3; channel++) {
    light[offset + channel] = Math.max(0, Math.min(255, Math.round((data[offset + channel] - 255 * (1 - opacity)) / opacity)));
  }
  light[offset + 3] = alpha;
  light.copy(dark, offset, offset, offset + 4);
  // Keep the orange brand ink; lift neutral ink for a dark page background.
  if (!orange) {
    dark[offset] = Math.min(255, light[offset] + 67);
    dark[offset + 1] = Math.min(255, light[offset + 1] + 73);
    dark[offset + 2] = Math.min(255, light[offset + 2] + 83);
  }
}

for (const [name, pixels] of [["mechanical-engineering-transparent.png", light], ["mechanical-engineering-dark.png", dark]]) {
  const destination = path.join(root, "public/brand", name);
  await sharp(pixels, { raw: { width: info.width, height: info.height, channels: 4 } }).png({ compressionLevel: 9 }).toFile(destination);
  console.log(`Saved public/brand/${name} (${info.width}×${info.height}, ${(await fs.stat(destination)).size} bytes)`);
}

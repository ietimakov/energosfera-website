// Run with Node.js and sharp available in node_modules (or NODE_PATH).
// Originals remain untouched; output is used only by the home page.
import { createRequire } from 'node:module';
import { mkdir, stat, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join, parse } from 'node:path';

const sharp = createRequire(import.meta.url)('sharp');
const assets = fileURLToPath(new URL('../dist/assets/', import.meta.url));
const output = join(assets, 'optimized');
await mkdir(output, { recursive: true });

for (const width of [640, 960, 1280, 1440, 1800]) {
  for (const format of ['avif', 'webp']) {
    const image = sharp(join(assets, 'substation.jpg')).resize({ width, withoutEnlargement: true });
    if (format === 'avif') image.avif({ quality: 72, effort: 6, chromaSubsampling: '4:4:4' });
    else image.webp({ quality: 90, effort: 6 });
    const result = await image.toFile(join(output, `substation-hero-${width}.${format}`));
    console.log(`hero ${width} ${format}: ${result.size} bytes`);
  }
}

for (const filename of ['switchgear-review.jpg', 'substation.jpg', 'rza-review.png', 'transformer.jpg', 'breaker.jpg', 'cables.jpg', 'grounding.jpg', 'protection-review.jpg', 'oil-review.jpg']) {
  const input = join(assets, filename);
  const original = (await stat(input)).size;
  // Preserve the aspect ratio and cover a 136px card on a 3x display.
  const buffer = await sharp(input).resize({ width: 408, height: 408, fit: 'outside', withoutEnlargement: true }).webp({ quality: 90, effort: 6 }).toBuffer();
  if (buffer.length >= original) {
    console.log(`thumbnail ${filename}: original retained (${original} bytes)`);
    continue;
  }
  await writeFile(join(output, `${parse(filename).name}-card.webp`), buffer);
  console.log(`thumbnail ${filename}: ${original} -> ${buffer.length} bytes`);
}

// Keep every pixel and the alpha channel of the brand artwork.
const logo = await sharp(join(assets, 'logo-transparent.png')).webp({ lossless: true, effort: 6 }).toFile(join(output, 'logo-transparent.webp'));
console.log(`lossless logo: ${logo.size} bytes`);

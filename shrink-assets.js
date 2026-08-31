/**
 * Downscale bundled artwork.
 *
 * The generated PNGs come back at full resolution — 6-10 MB each — but the Way
 * nodes display them at 112pt and the login plate at screen width. Bundling the
 * originals would add ~120 MB to the app for no visible gain.
 *
 * Originals are moved to assets/_originals/ rather than overwritten, so nothing
 * is lost and the script can safely be re-run.
 *
 * Setup:  npm install --save-dev sharp
 * Run:    node shrink-assets.js
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ASSETS = path.join(__dirname, 'assets');
const BACKUP = path.join(ASSETS, '_originals');

/** Way node art — displayed at 112pt, so 512px covers 3x screens comfortably. */
const NODES = [
  'creation', 'the-fall', 'noah', 'abraham', 'joseph', 'moses', 'the-law',
  'david', 'isaiah', 'birth', 'ministry', 'miracles', 'cross', 'acts',
  'letters', 'revelation',
];

/** Full-width imagery needs more, but nowhere near the original. */
const WIDE = [{ name: 'hero-manna', width: 1400 }];

/** Screen-header plates — displayed inside a 96pt arch. */
const HEADERS = [
  'manna_today_active', 'manna_journey_inactive', 'manna_bible_inactive',
  'manna_the_way_inactive', 'manna_you_inactive',
];

async function shrink(file, width) {
  const src = path.join(ASSETS, file);
  if (!fs.existsSync(src)) {
    console.log(`  skip   ${file} (not found)`);
    return;
  }

  const backup = path.join(BACKUP, file);
  if (fs.existsSync(backup)) {
    console.log(`  done   ${file} (already processed)`);
    return;
  }

  const before = fs.statSync(src).size;

  const buf = await sharp(src)
    .resize({ width, withoutEnlargement: true })
    .png({ quality: 82, compressionLevel: 9 })
    .toBuffer();

  fs.renameSync(src, backup);          // keep the original
  fs.writeFileSync(src, buf);

  const after = fs.statSync(src).size;
  const pct = Math.round((1 - after / before) * 100);
  console.log(
    `  ok     ${file.padEnd(20)} ${(before / 1e6).toFixed(1)}MB -> ${(after / 1e6).toFixed(2)}MB  (-${pct}%)`,
  );
}

(async () => {
  fs.mkdirSync(BACKUP, { recursive: true });

  console.log('Way node art -> 512px');
  for (const n of NODES) await shrink(`${n}.png`, 512);

  console.log('\nFull-width art');
  for (const { name, width } of WIDE) await shrink(`${name}.png`, width);

  console.log('\nScreen headers -> 512px');
  for (const n of HEADERS) await shrink(`${n}.png`, 512);

  const total = fs.readdirSync(ASSETS)
    .filter((f) => /\.(png|jpg)$/i.test(f))
    .reduce((sum, f) => sum + fs.statSync(path.join(ASSETS, f)).size, 0);
  console.log(`\nassets/ images now ${(total / 1e6).toFixed(1)} MB`);
  console.log('Originals kept in assets/_originals/ — already gitignored.');
})();

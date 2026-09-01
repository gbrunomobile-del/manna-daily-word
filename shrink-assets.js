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
const FLAT_BACKUP = path.join(ASSETS, '_with-background');

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

/**
 * Strip the paper background from an engraving.
 *
 * These are circular vignettes printed on cream stock, so dropped into a card
 * they show as a circle inside a square of not-quite-matching cream. Flood
 * filling the paper away from the edges lets the engraving sit on whatever
 * colour the container is, which also means it works in dark mode.
 *
 * The centre is protected: without that, any gap in the vignette's edge lets
 * the fill leak inward and hollow out the illustration's own highlights, which
 * are the same cream as the paper.
 */
async function stripBackground(file) {
  const src = path.join(ASSETS, file);
  if (!fs.existsSync(src)) { console.log(`  skip   ${file} (not found)`); return; }

  const backup = path.join(FLAT_BACKUP, file);
  if (fs.existsSync(backup)) { console.log(`  done   ${file} (already transparent)`); return; }

  const { data, info } = await sharp(src)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width: w, height: h, channels: ch } = info;
  const cx = w / 2;
  const cy = h / 2;
  const protectedR2 = (Math.min(w, h) * 0.40) ** 2;   // squared, to avoid sqrt

  // The cream stock sits at roughly luminance 240, so the “definitely paper”
  // line has to sit below that or the background survives at low opacity
  // rather than disappearing. Everything between the two is feathered.
  const HARD = 236;   // at or above this, fully transparent
  const SOFT = 200;   // below this, ink — left alone

  const lum = (i) => 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];

  const seen = new Uint8Array(w * h);
  const stack = [];

  // Seed from every border pixel.
  for (let x = 0; x < w; x++) { stack.push(x, x + (h - 1) * w); }
  for (let y = 0; y < h; y++) { stack.push(y * w, w - 1 + y * w); }

  while (stack.length) {
    const p = stack.pop();
    if (seen[p]) continue;
    seen[p] = 1;

    const x = p % w;
    const y = (p - x) / w;

    // Never touch the middle of the illustration.
    if ((x - cx) ** 2 + (y - cy) ** 2 < protectedR2) continue;

    const i = p * ch;
    const l = lum(i);
    if (l < SOFT) continue;                    // ink: stop here, edge found

    // Feather across the soft band so edges are not jagged.
    data[i + 3] = l >= HARD ? 0 : Math.round(((HARD - l) / (HARD - SOFT)) * 255);

    if (x > 0) stack.push(p - 1);
    if (x < w - 1) stack.push(p + 1);
    if (y > 0) stack.push(p - w);
    if (y < h - 1) stack.push(p + w);
  }

  const before = fs.statSync(src).size;
  const out = await sharp(data, { raw: { width: w, height: h, channels: ch } })
    .png({ compressionLevel: 9 })
    .toBuffer();

  fs.renameSync(src, backup);
  fs.writeFileSync(src, out);

  const after = fs.statSync(src).size;
  console.log(`  ok     ${file.padEnd(28)} ${(before / 1e3).toFixed(0)}KB -> ${(after / 1e3).toFixed(0)}KB`);
}

(async () => {
  fs.mkdirSync(BACKUP, { recursive: true });
  fs.mkdirSync(FLAT_BACKUP, { recursive: true });

  console.log('Way node art -> 512px');
  for (const n of NODES) await shrink(`${n}.png`, 512);

  console.log('\nFull-width art');
  for (const { name, width } of WIDE) await shrink(`${name}.png`, width);

  console.log('\nScreen headers -> 512px');
  for (const n of HEADERS) await shrink(`${n}.png`, 512);

  console.log('\nRemoving paper backgrounds');
  for (const n of [...NODES, ...HEADERS]) await stripBackground(`${n}.png`);

  const total = fs.readdirSync(ASSETS)
    .filter((f) => /\.(png|jpg)$/i.test(f))
    .reduce((sum, f) => sum + fs.statSync(path.join(ASSETS, f)).size, 0);
  console.log(`\nassets/ images now ${(total / 1e6).toFixed(1)} MB`);
  console.log('Originals kept in assets/_originals/ — already gitignored.');
})();

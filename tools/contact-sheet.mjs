import { createRequire } from "node:module";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const CAND = path.join(ROOT, "public", "_candidates");
const require = createRequire(path.join(process.env.TEMP ?? "/tmp", "opencode", "imgtools", "x.js"));
const sharp = require("sharp");

const manifest = JSON.parse(await readFile(path.join(CAND, "manifest.json"), "utf8"));
const slugs = Object.keys(manifest);
const TILE_W = 300;
const TILE_H = 200;
const LABEL_H = 34;
const COLS = 4;
const ROWS_PER_SHEET = 6;
const PAD = 16;

const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);
const label = (a, b) =>
  Buffer.from(
    `<svg width="${TILE_W}" height="${LABEL_H}" xmlns="http://www.w3.org/2000/svg">
       <rect width="100%" height="100%" fill="#ffffff"/>
       <text x="4" y="13" font-family="monospace" font-size="10.5" fill="#0b0c0d">${esc(a)}</text>
       <text x="4" y="27" font-family="monospace" font-size="8.5" fill="#74767a">${esc(b)}</text>
     </svg>`,
  );

// download + normalise every candidate thumb once
for (const slug of slugs) {
  for (const item of manifest[slug]) {
    const res = await fetch(item.thumb, { headers: { "user-agent": "KelvinStoreDemo/1.0" } });
    const raw = Buffer.from(await res.arrayBuffer());
    item._buf = await sharp(raw)
      .resize(TILE_W - 8, TILE_H - 8, { fit: "contain", background: "#fbfaf7" })
      .toBuffer();
  }
}

for (let s = 0; s * ROWS_PER_SHEET < slugs.length; s++) {
  const rows = slugs.slice(s * ROWS_PER_SHEET, (s + 1) * ROWS_PER_SHEET);
  const W = COLS * TILE_W + PAD * (COLS + 1);
  const H = PAD + rows.length * (TILE_H + LABEL_H + PAD);
  const layers = [];

  rows.forEach((slug, r) => {
    const rowTop = PAD + r * (TILE_H + LABEL_H + PAD);
    layers.push({
      input: Buffer.from(
        `<svg width="${W - PAD * 2}" height="${TILE_H + LABEL_H}"><rect width="100%" height="100%" fill="#ffffff" rx="4"/></svg>`,
      ),
      top: rowTop,
      left: PAD,
    });
    (manifest[slug] ?? []).slice(0, COLS).forEach((item, c) => {
      const left = PAD + c * (TILE_W + PAD);
      layers.push({ input: item._buf, top: rowTop + 4, left: left + 4 });
      layers.push({ input: label(`${slug} · ${c + 1}`, item.title.replace("File:", "").slice(0, 50)), top: rowTop + TILE_H, left });
    });
  });

  const out = await sharp({ create: { width: W, height: H, channels: 3, background: "#f2f1ec" } })
    .composite(layers)
    .png()
    .toBuffer();
  const file = path.join(CAND, `sheet-${s + 1}.png`);
  await writeFile(file, out);
  console.log(`${file} ${W}x${H}`);
}

import { createRequire } from "node:module";
import { readdir } from "node:fs/promises";
import path from "node:path";

const require = createRequire(path.join(process.env.TEMP ?? "/tmp", "opencode", "imgtools", "x.js"));
const sharp = require("sharp");

const DIR = path.resolve(import.meta.dirname, "..", "public", "products");
const files = (await readdir(DIR)).filter((f) => f.endsWith(".jpg")).sort();
const W = 300, H = 300, LABEL = 26, COLS = 5, PAD = 12;
const rows = Math.ceil(files.length / COLS);
const layers = [];

for (let i = 0; i < files.length; i++) {
  const buf = await sharp(path.join(DIR, files[i])).resize(W - 8, H - 8, { fit: "contain", background: "#fff" }).toBuffer();
  const x = PAD + (i % COLS) * (W + PAD);
  const y = PAD + Math.floor(i / COLS) * (H + LABEL + PAD);
  layers.push({ input: buf, left: x + 4, top: y + 4 });
  layers.push({
    input: Buffer.from(
      `<svg width="${W}" height="${LABEL}"><rect width="100%" height="100%" fill="#fff"/><text x="2" y="17" font-family="monospace" font-size="11">${files[i]}</text></svg>`,
    ),
    left: x,
    top: y + H,
  });
}

const w = COLS * (W + PAD) + PAD;
const h = rows * (H + LABEL + PAD) + PAD;
await sharp({ create: { width: w, height: h, channels: 3, background: "#eee" } })
  .composite(layers)
  .png()
  .toFile(path.join(DIR, "..", "_candidates", "final.png"));
console.log("ok", w, h);

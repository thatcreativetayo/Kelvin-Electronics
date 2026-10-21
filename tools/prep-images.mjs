// Normalises product photography: trims white margins, then places every
// product on the same square white stage so the grid reads as one system.
import { createRequire } from "node:module";
import { readdir, writeFile, unlink, readFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const DIR = path.join(ROOT, "public", "products");
const require = createRequire(path.join(process.env.TEMP ?? "/tmp", "opencode", "imgtools", "x.js"));
const sharp = require("sharp");

const STAGE = 1400;
const PAD = 0.06; // breathing room inside the stage

const files = (await readdir(DIR)).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));

async function cornersAreWhite(source) {
  const { data, info } = await sharp(source)
    .resize(40, 40, { fit: "fill" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const px = (x, y) => {
    const i = (y * info.width + x) * info.channels;
    return 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
  };
  let sum = 0;
  let n = 0;
  for (let x = 0; x < info.width; x++) {
    sum += px(x, 0) + px(x, info.height - 1);
    n += 2;
  }
  for (let y = 0; y < info.height; y++) {
    sum += px(0, y) + px(info.width - 1, y);
    n += 2;
  }
  return sum / n > 238;
}

for (const file of files) {
  const full = path.join(DIR, file);
  const source = await readFile(full); // read fully first — Windows holds a share lock otherwise
  const isWhiteStage = await cornersAreWhite(source);

  let pipeline = sharp(source).rotate();
  if (isWhiteStage) pipeline = pipeline.trim({ threshold: 10 });

  const inner = Math.round(STAGE * (1 - PAD * 2));
  const body = await pipeline
    .resize(inner, inner, { fit: "contain", background: "#ffffff", withoutEnlargement: false })
    .toBuffer();

  const out = await sharp({
    create: { width: STAGE, height: STAGE, channels: 3, background: "#ffffff" },
  })
    .composite([{ input: body, gravity: "centre" }])
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer();

  await writeFile(path.join(DIR, `${path.parse(file).name}.jpg`), out);
  if (path.extname(file).toLowerCase() !== ".jpg") await unlink(full);
  console.log(`✓ ${file} → ${path.parse(file).name}.jpg (${Math.round(out.length / 1024)} kB, stage=${isWhiteStage ? "white" : "photo"})`);
}

import { createRequire } from "node:module";
import { writeFile, readFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const DIR = path.join(ROOT, "public", "products");
const require = createRequire(path.join(process.env.TEMP ?? "/tmp", "opencode", "imgtools", "x.js"));
const sharp = require("sharp");
const UA = "KelvinStoreDemo/1.0 (design prototype)";

const [slug, title] = process.argv.slice(2);
if (!slug || !title) {
  console.error("usage: node tools/fetch-one.mjs <slug> <File:Title.jpg>");
  process.exit(1);
}

const url = `https://commons.wikimedia.org/w/api.php?${new URLSearchParams({
  format: "json",
  action: "query",
  titles: title,
  prop: "imageinfo",
  iiprop: "url|extmetadata|size",
  iiurlwidth: "1600",
})}`;
const json = await (await fetch(url, { headers: { "user-agent": UA } })).json();
const page = Object.values(json.query.pages)[0];
const info = page?.imageinfo?.[0];
if (!info) {
  console.error(`No image found for ${title}`);
  process.exit(1);
}

const raw = Buffer.from(await (await fetch(info.thumburl, { headers: { "user-agent": UA } })).arrayBuffer());
await writeFile(
  path.join(DIR, `${slug}.jpg`),
  await sharp(raw).flatten({ background: "#ffffff" }).jpeg({ quality: 94 }).toBuffer(),
);

const creditsPath = path.join(ROOT, "src", "data", "image-credits.json");
const credits = JSON.parse(await readFile(creditsPath, "utf8"));
const strip = (h = "") => h.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim().slice(0, 80);
const entry = {
  slug,
  title: page.title,
  page: info.descriptionurl,
  artist: strip(info.extmetadata?.Artist?.value),
  license: strip(info.extmetadata?.LicenseShortName?.value),
  width: info.thumbwidth,
  height: info.thumbheight,
};
const i = credits.findIndex((c) => c.slug === slug);
if (i >= 0) credits[i] = entry;
else credits.push(entry);
await writeFile(creditsPath, JSON.stringify(credits, null, 2));

console.log(`✓ ${slug} ← ${page.title}`);

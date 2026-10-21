import { createRequire } from "node:module";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const CAND = path.join(ROOT, "public", "_candidates2");
const require = createRequire(path.join(process.env.TEMP ?? "/tmp", "opencode", "imgtools", "x.js"));
const sharp = require("sharp");
const UA = "KelvinStoreDemo/1.0 (design prototype)";

const GROUPS = [
  { slug: "earbuds", queries: ["AirPods 3", "Sennheiser Momentum True Wireless", "Sony WF-1000XM4"] },
  { slug: "speaker", queries: ["HomePod mini", "Apple HomePod"] },
  { slug: "laptop", queries: ["MacBook Air M1", "MacBook Pro 13 2017", "Dell XPS 13"] },
  { slug: "sonos-era-100", queries: ["Sonos One SL", "Sonos speaker white background"] },
];

const api = async (params) => {
  const res = await fetch(`https://commons.wikimedia.org/w/api.php?${new URLSearchParams({ format: "json", origin: "*", ...params })}`, {
    headers: { "user-agent": UA },
  });
  return res.json();
};

const strip = (h = "") => h.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim().slice(0, 80);

await mkdir(CAND, { recursive: true });
const manifest = {};

for (const group of GROUPS) {
  const found = [];
  for (const term of group.queries) {
    if (found.length >= 4) break;
    const json = await api({
      action: "query",
      generator: "search",
      gsrsearch: `${term} filetype:bitmap`,
      gsrnamespace: "6",
      gsrlimit: "4",
      prop: "imageinfo",
      iiprop: "url|extmetadata|size",
      iiurlwidth: "420",
    }).catch(() => ({}));
    for (const p of Object.values(json?.query?.pages ?? {})) {
      if (found.length < 4 && !found.some((f) => f.title === p.title)) {
        found.push({ title: p.title, thumb: p.imageinfo?.[0]?.thumburl, page: p.imageinfo?.[0]?.descriptionurl });
      }
    }
  }
  manifest[group.slug] = found;
  console.log(group.slug, found.map((f) => f.title).join(" | "));
}

const TILE = 300, IMG = 200, LABEL = 30, PAD = 14;
const W = 4 * TILE + PAD * 5;
const H = PAD + Object.keys(manifest).length * (IMG + LABEL + PAD);
const layers = [];
let row = 0;
for (const [slug, items] of Object.entries(manifest)) {
  const rowTop = PAD + row * (IMG + LABEL + PAD);
  layers.push({
    input: Buffer.from(`<svg width="${W - PAD * 2}" height="${IMG + LABEL}"><rect width="100%" height="100%" fill="#fff" rx="4"/></svg>`),
    left: PAD,
    top: rowTop,
  });
  for (let c = 0; c < items.length; c++) {
    const item = items[c];
    const raw = Buffer.from(await (await fetch(item.thumb, { headers: { "user-agent": UA } })).arrayBuffer());
    const buf = await sharp(raw).resize(TILE - 10, IMG - 10, { fit: "contain", background: "#fbfaf7" }).toBuffer();
    const left = PAD + c * (TILE + PAD);
    layers.push({ input: buf, left: left + 5, top: rowTop + 5 });
    layers.push({
      input: Buffer.from(
        `<svg width="${TILE}" height="${LABEL}"><rect width="100%" height="100%" fill="#fff"/><text x="3" y="13" font-family="monospace" font-size="10.5">${slug} · ${c + 1}</text><text x="3" y="26" font-family="monospace" font-size="8.5" fill="#74767a">${strip(item.title).slice(0, 44)}</text></svg>`,
      ),
      left,
      top: rowTop + IMG,
    });
  }
  row++;
}

await writeFile(path.join(CAND, "manifest.json"), JSON.stringify(manifest, null, 2));
await sharp({ create: { width: W, height: H, channels: 3, background: "#f2f1ec" } })
  .composite(layers)
  .png()
  .toFile(path.join(CAND, "sheet.png"));
console.log("sheet written");

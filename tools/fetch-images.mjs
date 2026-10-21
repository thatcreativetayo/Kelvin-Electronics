// Sources product photography from Wikimedia Commons (freely licensed),
// builds a contact sheet for art-direction review, then downloads the
// selected frames into /public/products.
//
//   node tools/fetch-images.mjs candidates
//   node tools/fetch-images.mjs download
//
import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const CAND_DIR = path.join(ROOT, "public", "_candidates");
const OUT_DIR = path.join(ROOT, "public", "products");
const API = "https://commons.wikimedia.org/w/api.php";
const UA = "KelvinStoreDemo/1.0 (design prototype; contact: demo@example.com)";

export const PRODUCTS = [
  { slug: "sony-wh-1000xm5", queries: ["Sony WH-1000XM5", "Sony WH-1000XM4", "Sony WH-1000XM3"] },
  { slug: "airpods-pro", queries: ["AirPods Pro", "Apple AirPods Pro"] },
  { slug: "sonos-era-100", queries: ["Sonos One white speaker", "Sonos One speaker"] },
  { slug: "macbook-pro-14", queries: ["MacBook Pro 14 inch", "MacBook Pro M3"] },
  { slug: "keychron-k8", queries: ["Keychron K8", "Keychron keyboard"] },
  { slug: "logitech-mx-master-3s", queries: ["Logitech MX Master 3S", "Logitech MX Master 3"] },
  { slug: "iphone-15-pro", queries: ["iPhone 15 Pro", "iPhone 15"] },
  { slug: "ipad-pro", queries: ["iPad Pro 11", "iPad Pro"] },
  { slug: "galaxy-s24-ultra", queries: ["Samsung Galaxy S24 Ultra", "Samsung Galaxy S24"] },
  { slug: "sony-a7r-iv", queries: ["Sony Alpha 7R IV", "Sony A7R IV"] },
  { slug: "fujifilm-x-t5", queries: ["Fujifilm X-T5", "Fujifilm X-T4"] },
  { slug: "xbox-series-x", queries: ["Xbox Series X", "Xbox Series X console"] },
  { slug: "nintendo-switch-oled", queries: ["Nintendo Switch OLED", "Nintendo Switch console"] },
  { slug: "airpods-max", queries: ["AirPods Max", "Apple AirPods Max"] },
  { slug: "dualsense", queries: ["DualSense controller", "PlayStation 5 DualSense"] },
  { slug: "steam-deck", queries: ["Steam Deck", "Valve Steam Deck"] },
  { slug: "kindle-paperwhite", queries: ["Kindle Paperwhite", "Amazon Kindle"] },
];

const api = async (params) => {
  const url = `${API}?${new URLSearchParams({ format: "json", origin: "*", ...params })}`;
  const res = await fetch(url, { headers: { "user-agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
};

const search = async (term, limit = 4) => {
  const json = await api({
    action: "query",
    generator: "search",
    gsrsearch: `${term} filetype:bitmap`,
    gsrnamespace: "6",
    gsrlimit: String(limit),
    prop: "imageinfo",
    iiprop: "url|extmetadata|size",
    iiurlwidth: "420",
  });
  const pages = Object.values(json?.query?.pages ?? {});
  return pages.map((p) => {
    const info = p.imageinfo?.[0] ?? {};
    const meta = info.extmetadata ?? {};
    return {
      title: p.title,
      page: info.descriptionurl,
      width: info.width,
      height: info.height,
      thumb: info.thumburl,
      artist: strip(meta.Artist?.value),
      license: strip(meta.LicenseShortName?.value),
    };
  });
};

const strip = (html = "") =>
  html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim().slice(0, 80);

async function candidates() {
  await mkdir(CAND_DIR, { recursive: true });
  const manifest = {};
  for (const product of PRODUCTS) {
    const found = [];
    for (const term of product.queries) {
      if (found.length >= 4) break;
      const results = await search(term, 4).catch(() => []);
      for (const r of results) {
        if (found.length < 4 && !found.some((f) => f.title === r.title)) found.push(r);
      }
    }
    manifest[product.slug] = found;
    console.log(product.slug, found.map((f) => f.title).join(" | "));
    await new Promise((r) => setTimeout(r, 120));
  }
  await writeFile(path.join(CAND_DIR, "manifest.json"), JSON.stringify(manifest, null, 2));

  const rows = PRODUCTS.map((p) => {
    const cells = (manifest[p.slug] ?? [])
      .map(
        (c, i) => `<figure class="cell">
          <img src="${c.thumb}" alt="">
          <figcaption><b>${i + 1}</b> ${escapeHtml(c.title.replace("File:", ""))}<br><span>${c.width}×${c.height} · ${escapeHtml(c.license ?? "")}</span></figcaption>
        </figure>`,
      )
      .join("");
    return `<section class="row"><h2>${p.slug}</h2><div class="cells">${cells || "<em>no results</em>"}</div></section>`;
  }).join("\n");

  await writeFile(
    path.join(CAND_DIR, "index.html"),
    `<!doctype html><meta charset="utf-8"><title>KELVIN — image candidates</title>
    <style>
      body{margin:0;padding:24px;background:#f2f1ec;color:#0b0c0d;font:13px/1.4 ui-monospace,monospace}
      h1{font:600 26px/1 ui-sans-serif;letter-spacing:-.03em;margin:0 0 18px}
      .row{display:grid;grid-template-columns:190px 1fr;gap:16px;padding:14px 0;border-top:1px solid #dedcd4}
      h2{font:600 13px/1.3 ui-sans-serif;margin:4px 0 0;word-break:break-word}
      .cells{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
      figure{margin:0;background:#fff;border-radius:4px;overflow:hidden;display:flex;flex-direction:column}
      img{width:100%;height:150px;object-fit:contain;background:#fbfaf7;mix-blend-mode:multiply}
      figcaption{padding:6px 8px;font-size:10px;line-height:1.35;background:#fff}
      figcaption span{color:#74767a}
      b{display:inline-block;background:#1e3aff;color:#fff;border-radius:2px;padding:0 4px;margin-right:4px}
    </style><h1>KELVIN — product image candidates</h1>${rows}`,
  );
  console.log(`\nContact sheet: ${path.join(CAND_DIR, "index.html")}`);
}

async function download() {
  // selections map a product slug to the 1-based option number from the contact sheet
  const selections = JSON.parse(await readFile(path.join(ROOT, "tools", "selections.json"), "utf8"));
  const manifest = JSON.parse(await readFile(path.join(CAND_DIR, "manifest.json"), "utf8"));
  const credits = [];
  await mkdir(OUT_DIR, { recursive: true });
  for (const [slug, option] of Object.entries(selections)) {
    const candidate = manifest[slug]?.[Number(option) - 1];
    if (!candidate) {
      console.warn(`! ${slug}: option ${option} not found`);
      continue;
    }
    const json = await api({
      action: "query",
      titles: candidate.title,
      prop: "imageinfo",
      iiprop: "url|extmetadata|size",
      iiurlwidth: "1600",
    });
    const page = Object.values(json?.query?.pages ?? {})[0];
    const info = page?.imageinfo?.[0];
    if (!info?.thumburl) {
      console.warn(`! ${slug}: no image for ${title}`);
      continue;
    }
    const res = await fetch(info.thumburl, { headers: { "user-agent": UA } });
    const buf = Buffer.from(await res.arrayBuffer());
    await writeFile(path.join(OUT_DIR, `${slug}.jpg`), buf);
    credits.push({
      slug,
      title: page.title,
      page: info.descriptionurl,
      artist: strip(info.extmetadata?.Artist?.value),
      license: strip(info.extmetadata?.LicenseShortName?.value),
      width: info.thumbwidth,
      height: info.thumbheight,
    });
    console.log(`✓ ${slug} ← ${page.title} (${Math.round(buf.length / 1024)} kB)`);
  }
  await writeFile(path.join(ROOT, "src", "data", "image-credits.json"), JSON.stringify(credits, null, 2));
}

const escapeHtml = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);
const mode = process.argv[2];
if (mode === "candidates") await candidates();
else if (mode === "download") await download();
else console.log("usage: node tools/fetch-images.mjs candidates|download");

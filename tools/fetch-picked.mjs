import { createRequire } from "node:module";
import { writeFile, readFile, unlink } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const DIR = path.join(ROOT, "public", "products");
const require = createRequire(path.join(process.env.TEMP ?? "/tmp", "opencode", "imgtools", "x.js"));
const sharp = require("sharp");
const UA = "KelvinStoreDemo/1.0 (design prototype)";

const PICKS = {
  "airpods-pro": "File:AirPods Pro 3 with case.jpg",
  "homepod-mini": "File:Apple HomePod mini.jpg",
  "macbook-air": "File:Macbook Air M1 Silver PNG.png",
  "magic-keyboard": "File:Apple Magic Keyboard - US remix transparent.png",
};

const credits = JSON.parse(await readFile(path.join(ROOT, "src", "data", "image-credits.json"), "utf8"));
const strip = (h = "") => h.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim().slice(0, 80);

async function resolve(title) {
  const url = `https://commons.wikimedia.org/w/api.php?${new URLSearchParams({
    format: "json",
    action: "query",
    titles: title,
    prop: "imageinfo",
    iiprop: "url|extmetadata|size",
    iiurlwidth: "1600",
  })}`;
  const json = await (await fetch(url, { headers: { "user-agent": UA } })).json();
  let page = Object.values(json.query.pages)[0];
  if (!page?.imageinfo) {
    const s = await (
      await fetch(
        `https://commons.wikimedia.org/w/api.php?${new URLSearchParams({
          format: "json",
          action: "query",
          generator: "search",
          gsrsearch: `intitle:"${title.replace(/^File:|\.(png|jpe?g)$/gi, "")}" filetype:bitmap`,
          gsrnamespace: "6",
          gsrlimit: "1",
          prop: "imageinfo",
          iiprop: "url|extmetadata|size",
          iiurlwidth: "1600",
        })}`,
        { headers: { "user-agent": UA } },
      )
    ).json();
    page = Object.values(s?.query?.pages ?? {})[0];
  }
  return page;
}

for (const [slug, title] of Object.entries(PICKS)) {
  try {
    const page = await resolve(title);
    const info = page?.imageinfo?.[0];
    if (!info) throw new Error(`no image for ${title}`);
    const raw = Buffer.from(await (await fetch(info.thumburl, { headers: { "user-agent": UA } })).arrayBuffer());
    await writeFile(
      path.join(DIR, `${slug}.jpg`),
      await sharp(raw).flatten({ background: "#ffffff" }).jpeg({ quality: 92 }).toBuffer(),
    );
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
    console.log(`✓ ${slug} ← ${page.title}`);
  } catch (err) {
    console.warn(`! ${slug}: ${err.message}`);
  }
}

await writeFile(path.join(ROOT, "src", "data", "image-credits.json"), JSON.stringify(credits, null, 2));
for (const stale of ["sonos-era-100.jpg", "keychron-k8.jpg", "macbook-pro-14.jpg"]) {
  try {
    await unlink(path.join(DIR, stale));
    console.log(`– removed ${stale}`);
  } catch {}
}

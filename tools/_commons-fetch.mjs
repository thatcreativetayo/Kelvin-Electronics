import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const out = path.join(os.tmpdir(), "cloud-commons");
fs.mkdirSync(out, { recursive: true });

const terms = {
  "halo-smart-bulb": "LED light bulb",
  "arc-floor-lamp": "arc floor lamp",
  "line-light-strip": "LED strip light",
  "plug-mini": "smart plug",
  "current-4-way-strip": "power strip",
  "orbit-power-cube": "power adapter",
  "kettle-one": "electric kettle",
  "air-four": "air fryer",
  "blend-mini": "kitchen blender",
  "everyday-tee": "t-shirt",
  "cloud-hoodie": "hoodie",
  "day-tote": "tote bag",
};

const manifest = {};

for (const [slug, term] of Object.entries(terms)) {
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  url.search = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: `${term} filetype:bitmap`,
    gsrnamespace: "6",
    gsrlimit: "10",
    prop: "imageinfo",
    iiprop: "url|size|extmetadata",
    iiurlwidth: "700",
    format: "json",
  }).toString();

  let pages = [];
  try {
    const response = await fetch(url, { headers: { "User-Agent": "CloudStorefront/1.0" } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    pages = Object.values(data.query?.pages ?? {}).sort((a, b) => a.index - b.index);
  } catch (error) {
    console.error(slug, error.message);
    manifest[slug] = [];
    continue;
  }

  const saved = [];
  let i = 0;
  for (const page of pages) {
    if (saved.length >= 6) break;
    const info = page.imageinfo?.[0];
    if (!info?.thumburl || info.width < 500 || info.height < 500) continue;
    if (!/\.(jpe?g|png)$/i.test(page.title)) continue;
    const ext = page.title.toLowerCase().endsWith(".png") ? "png" : "jpg";
    const file = path.join(out, `${slug}-${i}.${ext}`);
    try {
      const response = await fetch(info.thumburl, { headers: { "User-Agent": "CloudStorefront/1.0" } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const buffer = Buffer.from(await response.arrayBuffer());
      fs.writeFileSync(file, buffer);
      const meta = info.extmetadata ?? {};
      saved.push({
        index: saved.length,
        file,
        title: page.title,
        artist: meta.Artist?.value?.replace(/<[^>]+>/g, "") ?? "",
        license: meta.LicenseShortName?.value ?? "",
        licenseUrl: meta.LicenseUrl?.value ?? "",
        source: `https://commons.wikimedia.org/?curid=${page.pageid}`,
        original: info.url,
        width: info.width,
        height: info.height,
      });
    } catch (error) {
      console.error(slug, i, error.message);
    }
    i += 1;
  }
  manifest[slug] = saved;
  console.log(slug, saved.length);
}

fs.writeFileSync(path.join(out, "manifest.json"), JSON.stringify(manifest, null, 2));
console.log("saved to", out);

import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const out = path.join(os.tmpdir(), "cloud-commons");
fs.mkdirSync(out, { recursive: true });

const queries = {
  "led-strip": "led strip light",
  "power-strip": "power strip white",
  "usb-charger": "usb charger",
  "power-adapter": "power adapter",
};
const manifest = {};
for (const [slug, q] of Object.entries(queries)) {
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  url.search = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: `${q} filetype:bitmap`,
    gsrnamespace: "6",
    gsrlimit: "24",
    prop: "imageinfo",
    iiprop: "url|mime|size|extmetadata",
    iiurlwidth: "700",
    format: "json",
    origin: "*",
  }).toString();
  try {
    const res = await fetch(url, { headers: { "User-Agent": "CloudStorefront/1.0 (contact@example.com)" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const pages = Object.values(data.query?.pages ?? {});
    manifest[slug] = [];
    let index = 0;
    for (const page of pages) {
      const info = page.imageinfo?.[0];
      if (!info || !info.thumburl) continue;
      const ext = info.mime === "image/png" ? "png" : info.mime === "image/webp" ? "webp" : "jpg";
      const file = path.join(out, `${slug}-${index}.${ext}`);
      try {
        const img = await fetch(info.thumburl, {
          headers: { "User-Agent": "CloudStorefront/1.0 (contact@example.com)" },
          signal: AbortSignal.timeout(30000),
        });
        if (!img.ok) throw new Error(`HTTP ${img.status}`);
        const buffer = Buffer.from(await img.arrayBuffer());
        fs.writeFileSync(file, buffer);
        manifest[slug].push({
          index,
          file,
          title: page.title,
          source: info.descriptionurl,
          width: info.width,
          height: info.height,
        });
        index += 1;
      } catch (e) {
        console.error(slug, page.title, e.message);
      }
    }
    console.log(slug, manifest[slug].length);
  } catch (e) {
    console.error(slug, e.message);
  }
}
fs.writeFileSync(path.join(out, "manifest.json"), JSON.stringify(manifest, null, 2));
console.log("saved", out);

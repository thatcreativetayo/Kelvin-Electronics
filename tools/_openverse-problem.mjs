import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const out = path.join(os.tmpdir(), "cloud-openverse");
fs.mkdirSync(out, { recursive: true });

const queries = {
  "line-strip": "led strip light product white background",
  "power-strip": "power strip isolated white background",
  "wall-charger": "usb wall charger isolated",
  "power-cube": "power adapter isolated white",
};

const manifest = {};
for (const [slug, q] of Object.entries(queries)) {
  const url = new URL("https://api.openverse.org/v1/images/");
  url.search = new URLSearchParams({
    q,
    page_size: "16",
    license_type: "commercial",
    mature: "false",
  }).toString();
  try {
    const res = await fetch(url, { headers: { "User-Agent": "CloudStorefront/1.0" } });
    const data = await res.json();
    const items = (data.results ?? []).filter((item) => item.url && item.width >= 600 && item.height >= 600);
    manifest[slug] = [];
    let index = 0;
    for (const item of items) {
      const ext = (item.filetype || "jpg").toLowerCase().replace("jpeg", "jpg");
      const file = path.join(out, `${slug}-${index}.${ext}`);
      try {
        const img = await fetch(item.url, {
          headers: { "User-Agent": "CloudStorefront/1.0" },
          signal: AbortSignal.timeout(30000),
        });
        if (!img.ok) throw new Error(`HTTP ${img.status}`);
        const buffer = Buffer.from(await img.arrayBuffer());
        fs.writeFileSync(file, buffer);
        manifest[slug].push({
          index,
          file,
          title: item.title,
          creator: item.creator,
          license: item.license,
          source: item.foreign_landing_url,
          provider: item.provider,
          width: item.width,
          height: item.height,
        });
        index += 1;
      } catch (e) {
        console.error(slug, item.title, e.message);
      }
    }
    console.log(slug, manifest[slug].length);
  } catch (e) {
    console.error(slug, e.message);
  }
}
fs.writeFileSync(path.join(out, "manifest.json"), JSON.stringify(manifest, null, 2));
console.log("saved", out);

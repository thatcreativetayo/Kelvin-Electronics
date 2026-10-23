import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const out = path.join(os.tmpdir(), "cloud-photos");
fs.mkdirSync(out, { recursive: true });

const terms = {
  "halo-smart-bulb": "led light bulb product",
  "arc-floor-lamp": "arc floor lamp",
  "line-light-strip": "led strip light",
  "plug-mini": "smart plug",
  "current-4-way-strip": "power strip",
  "orbit-power-cube": "power adapter",
  "kettle-one": "electric kettle",
  "air-four": "air fryer",
  "blend-mini": "kitchen blender",
  "everyday-tee": "white t shirt",
  "cloud-hoodie": "hoodie",
  "day-tote": "tote bag",
};

const manifest = {};

for (const [slug, term] of Object.entries(terms)) {
  const url = new URL("https://api.openverse.org/v1/images/");
  url.search = new URLSearchParams({
    q: term,
    page_size: "12",
    license_type: "commercial",
    mature: "false",
  }).toString();
  let results = [];
  try {
    const response = await fetch(url, { headers: { "User-Agent": "CloudStorefront/1.0" } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    results = data.results ?? [];
  } catch (error) {
    console.error(slug, error.message);
    manifest[slug] = [];
    continue;
  }

  const candidates = results
    .filter((item) => item.url && item.width >= 700 && item.height >= 700)
    .slice(0, 8);
  const saved = [];
  for (let i = 0; i < candidates.length; i += 1) {
    const item = candidates[i];
    const ext = (item.filetype || "jpg").toLowerCase().replace("jpeg", "jpg");
    const file = path.join(out, `${slug}-${i}.${ext}`);
    try {
      const response = await fetch(item.url, {
        headers: { "User-Agent": "CloudStorefront/1.0" },
        signal: AbortSignal.timeout(30000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const buffer = Buffer.from(await response.arrayBuffer());
      fs.writeFileSync(file, buffer);
      saved.push({
        index: i,
        file,
        title: item.title,
        creator: item.creator,
        license: item.license,
        licenseVersion: item.license_version,
        licenseUrl: item.license_url,
        source: item.foreign_landing_url,
        provider: item.provider,
        width: item.width,
        height: item.height,
        bytes: buffer.length,
      });
    } catch (error) {
      console.error(slug, i, error.message);
    }
  }
  manifest[slug] = saved;
  console.log(slug, saved.length);
}

fs.writeFileSync(path.join(out, "manifest.json"), JSON.stringify(manifest, null, 2));
console.log("saved to", out);

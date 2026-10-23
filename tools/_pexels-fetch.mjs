import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const out = path.join(os.tmpdir(), "cloud-pexels");
fs.mkdirSync(out, { recursive: true });

const picks = {
  "halo-smart-bulb": ["1025410", "20713462", "3946159", "3946155", "36290332", "7425358"],
  "arc-floor-lamp": ["5561129", "35392792", "7722146", "12024171", "15082877"],
  "line-light-strip": ["34195903", "15082877", "30673703", "34592708", "15166489", "1070603"],
  "plug-mini": ["4148576", "27934787", "22307556", "30170004", "28117696", "5563414"],
  "current-4-way-strip": ["39234197", "1028674", "6296911", "3921632"],
  "orbit-power-cube": ["3921632", "1028674", "35921904", "11032801", "28190457", "32463116"],
  "kettle-one": ["30319670", "12974474", "15841781", "6000679", "6000682", "3847410", "327136"],
  "air-four": ["35285814", "35041643", "7614540", "18071814", "5374414"],
  "blend-mini": ["27009438", "7936983", "16096610", "31276290", "12119029"],
  "everyday-tee": ["11735074", "9285919", "8532616", "13915356", "9775889", "12975963"],
  "cloud-hoodie": ["6995877", "6551385", "5618175", "5604023", "35145903", "1183266", "713070"],
  "day-tote": ["5926443", "6633602", "7735446", "4440791", "4068320", "1214212", "28358816", "9575448"],
};

const manifest = {};
for (const [slug, ids] of Object.entries(picks)) {
  manifest[slug] = [];
  for (const id of ids) {
    const ext = id === "390426" ? "png" : "jpeg";
    const url = `https://images.pexels.com/photos/${id}/pexels-photo-${id}.${ext}?auto=compress&cs=tinysrgb&w=1200`;
    const file = path.join(out, `${slug}-${id}.jpg`);
    try {
      const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buffer = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(file, buffer);
      manifest[slug].push({ id, file, url: `https://www.pexels.com/photo/${id}/` });
      console.log(slug, id, buffer.length);
    } catch (e) {
      console.error(slug, id, e.message);
    }
  }
}
fs.writeFileSync(path.join(out, "manifest.json"), JSON.stringify(manifest, null, 2));
console.log("saved", out);

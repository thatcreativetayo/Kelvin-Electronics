import { readdir, mkdir, rm } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ROOT = path.resolve(".");
const PRODUCTS = path.join(ROOT, "public", "products");
const files = (await readdir(PRODUCTS)).filter((file) => file.endsWith(".svg") && !file.startsWith("_"));
await mkdir(PRODUCTS, { recursive: true });

for (const [index, file] of files.entries()) {
  const slug = file.replace(/\.svg$/, "");
  const profile = path.join(tmpdir(), `cloud-render-${Date.now()}-${index}`);
  const source = `file:///${path.join(PRODUCTS, file).replace(/\\/g, "/").replace(/ /g, "%20")}`;
  const target = path.join(PRODUCTS, `${slug}.png`);
  const result = spawnSync(
    CHROME,
    [
      "--headless=new",
      "--disable-gpu",
      "--hide-scrollbars",
      "--no-sandbox",
      "--no-first-run",
      `--user-data-dir=${profile}`,
      "--screenshot=" + target,
      "--window-size=1200,1200",
      "--default-background-color=00000000",
      source,
    ],
    { stdio: "ignore", timeout: 60000 },
  );
  await rm(profile, { recursive: true, force: true });
  if (result.status !== 0) {
    console.error(`failed ${slug} (${result.status})`);
  } else {
    console.log(`rendered ${slug}.png`);
  }
}

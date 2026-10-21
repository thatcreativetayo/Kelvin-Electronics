import { spawn } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9333;
const OUT = process.argv[2] ?? ".shots";
const profile = mkdtempSync(join(tmpdir(), "kelvin-cdp-"));

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--remote-allow-origins=*",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    "--no-first-run",
    "about:blank",
  ],
  { stdio: "ignore" },
);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForEndpoint() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      if (response.ok) return response.json();
    } catch {
      /* not up yet */
    }
    await sleep(200);
  }
  throw new Error("Chrome did not expose a debugging endpoint.");
}

const targets = await waitForEndpoint();
const page = targets.find((target) => target.type === "page");
if (!page) throw new Error("No page target.");

const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  ws.addEventListener("open", resolve, { once: true });
  ws.addEventListener("error", reject, { once: true });
});

let nextId = 0;
const pending = new Map();
ws.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message));
    else resolve(message.result);
  }
});

const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const id = ++nextId;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });

await send("Page.enable");
await send("Runtime.enable");

async function evaluate(expression) {
  const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  return result.result?.value;
}

async function waitUntil(expression, timeoutMs = 12000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (await evaluate(expression)) return true;
    await sleep(200);
  }
  return false;
}

const DIAGNOSTIC = `(() => {
  const vw = window.innerWidth;
  const offenders = [...document.querySelectorAll("body *")]
    .map((el) => {
      const r = el.getBoundingClientRect();
      return {
        tag: el.tagName.toLowerCase(),
        cls: String(el.className ?? "").slice(0, 90),
        left: Math.round(r.left),
        right: Math.round(r.right),
        width: Math.round(r.width),
      };
    })
    .filter((o) => o.right > vw + 1 || o.left < -1)
    .sort((a, b) => b.right - a.right)
    .slice(0, 14);
  const img = document.querySelector(".product-media img");
  return {
    url: location.pathname,
    vw,
    scrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
    offenders,
    cards: [...document.querySelectorAll("article")].slice(0, 6).map((card) => {
      const media = card.querySelector(".product-media");
      const title = card.querySelector("h3");
      const brand = card.querySelector("p.type-micro");
      return {
        media: media ? { top: Math.round(media.getBoundingClientRect().top), height: Math.round(media.getBoundingClientRect().height), width: Math.round(media.getBoundingClientRect().width), marginTop: getComputedStyle(media).marginTop, transform: getComputedStyle(media).transform } : null,
        brandTop: brand ? Math.round(brand.getBoundingClientRect().top) : null,
        titleTop: title ? Math.round(title.getBoundingClientRect().top) : null,
        contentMargin: card.querySelector(".mt-3") ? getComputedStyle(card.querySelector(".mt-3")).marginTop : null,
        cardTop: Math.round(card.getBoundingClientRect().top),
        cardHeight: Math.round(card.getBoundingClientRect().height),
        cardStyle: {
          alignSelf: getComputedStyle(card).alignSelf,
          justifyContent: getComputedStyle(card).justifyContent,
          transform: getComputedStyle(card).transform,
          marginTop: getComputedStyle(card).marginTop,
          paddingTop: getComputedStyle(card).paddingTop,
        },
      };
    }),
    heroImage: img
      ? {
          complete: img.complete,
          naturalWidth: img.naturalWidth,
          currentSrc: img.currentSrc,
          rect: img.getBoundingClientRect().toJSON(),
          opacity: getComputedStyle(img).opacity,
          blend: getComputedStyle(img).mixBlendMode,
        }
      : null,
  };
})()`;

const jobs = [
  { url: "http://localhost:3000/", width: 390, height: 900, name: "mobile-home" },
  { url: "http://localhost:3000/collections/audio", width: 390, height: 900, name: "mobile-collection" },
  { url: "http://localhost:3000/products/airpods-max", width: 390, height: 900, name: "mobile-pdp" },
  { url: "http://localhost:3000/", width: 1440, height: 1000, name: "desktop-home" },
  { url: "http://localhost:3000/collections/audio", width: 1440, height: 1000, name: "desktop-collection" },
  { url: "http://localhost:3000/products/airpods-max", width: 1440, height: 1000, name: "desktop-pdp" },
  { url: "http://localhost:3000/cart", width: 1440, height: 1000, name: "desktop-cart", cart: true },
  { url: "http://localhost:3000/checkout", width: 1440, height: 1000, name: "desktop-checkout", cart: true },
  { url: "http://localhost:3000/cart", width: 390, height: 900, name: "mobile-cart", cart: true },
  { url: "http://localhost:3000/checkout", width: 390, height: 900, name: "mobile-checkout", cart: true },
  { url: "http://localhost:3000/search?q=airpods", width: 1440, height: 1000, name: "desktop-search" },
  { url: "http://localhost:3000/search?q=zzzz", width: 1440, height: 1000, name: "desktop-search-empty" },
  { url: "http://localhost:3000/credits", width: 1440, height: 1000, name: "desktop-credits" },
  { url: "http://localhost:3000/credits", width: 390, height: 900, name: "mobile-credits" },
];

for (const job of jobs) {
  if (process.env.ONLY && !job.name.includes(process.env.ONLY)) continue;
  await send("Emulation.setDeviceMetricsOverride", {
    width: job.width,
    height: job.height,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await send("Page.navigate", { url: job.url });
  await waitUntil("document.readyState === 'complete'");
  await waitUntil("[...document.images].every((img) => img.complete)");
  await evaluate("document.fonts.ready.then(() => true)");

  if (job.cart) {
    await evaluate(`localStorage.setItem("kelvin.cart.v1", JSON.stringify([
      { variantId: "airpods-max--silver", productSlug: "airpods-max", quantity: 1 },
      { variantId: "kindle-paperwhite--16", productSlug: "kindle-paperwhite", quantity: 2 },
      { variantId: "dualsense--white", productSlug: "dualsense", quantity: 1 }
    ]))`);
    await send("Page.reload");
    await waitUntil("document.readyState === 'complete'");
    await waitUntil("document.body.innerText.includes('AirPods Max')");
    await waitUntil("[...document.images].every((img) => img.complete)");
    await evaluate("document.fonts.ready.then(() => true)");
  }

  await sleep(1200);

  // A full-page screenshot does not scroll, so lazy images below the fold never
  // enter the viewport. Promote them to eager and walk the page once.
  await evaluate(`[...document.images].forEach((img) => { img.loading = "eager"; })`);

  await evaluate(`new Promise((resolve) => {
    let y = 0;
    const step = () => {
      y += 600;
      window.scrollTo(0, y);
      if (y < document.body.scrollHeight) {
        setTimeout(step, 60);
      } else {
        window.scrollTo(0, 0);
        setTimeout(resolve, 250);
      }
    };
    step();
  })`);

  await waitUntil("[...document.images].every((img) => img.complete)");

  if (process.env.INJECT_CSS) {
    await evaluate(
      `document.head.insertAdjacentHTML("beforeend", ${JSON.stringify(`<style>${process.env.INJECT_CSS}</style>`)})`,
    );
    await sleep(300);
  }

  const diagnostics = await evaluate(DIAGNOSTIC);
  const metrics = await send("Page.getLayoutMetrics");
  const fullHeight = Math.min(Math.ceil(metrics.cssContentSize.height), 5200);
  const shot = await send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: true,
    clip: { x: 0, y: 0, width: job.width, height: fullHeight, scale: 1 },
  });
  writeFileSync(join(OUT, `${job.name}.png`), Buffer.from(shot.data, "base64"));
  console.log(JSON.stringify({ name: job.name, height: fullHeight, ...diagnostics }, null, 2));
}

ws.close();
chrome.kill();
process.exit(0);

/**
 * Viewport screenshots at fixed scroll positions. Used for mobile visual QA,
 * where a single very tall emulated viewport can show paint artifacts.
 *
 * Usage:
 *   node tools/capture-scroll.mjs / 390 844
 */
import { spawn } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const CHROME =
  process.env.CHROME_PATH ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const OUT = process.env.SHOT_DIR ?? path.join(os.tmpdir(), "cloud-shots");
const route = process.argv[2] ?? "/";
const width = Number(process.argv[3] ?? 390);
const height = Number(process.argv[4] ?? 844);
const maxChunks = Number(process.env.MAX_CHUNKS ?? 12);

const port = 9800 + Math.floor(Math.random() * 300);
const profile = await mkdtemp(path.join(os.tmpdir(), "cloud-chrome-"));
const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--no-first-run",
    "--no-default-browser-check",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    "about:blank",
  ],
  { stdio: "ignore" },
);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function endpoint() {
  for (let i = 0; i < 60; i += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/list`);
      if (response.ok) return response.json();
    } catch {
      // Chrome is still starting.
    }
    await sleep(150);
  }
  throw new Error("Chrome did not expose a DevTools endpoint.");
}

const targets = await endpoint();
const page = targets.find((target) => target.type === "page");
if (!page) throw new Error("No Chrome page target found.");

const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

let nextId = 1;
const pending = new Map();
const events = new Map();

socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (message.id) {
    const waiter = pending.get(message.id);
    if (!waiter) return;
    pending.delete(message.id);
    if (message.error) waiter.reject(new Error(message.error.message));
    else waiter.resolve(message.result);
    return;
  }
  const waiters = events.get(message.method);
  if (!waiters) return;
  events.delete(message.method);
  for (const waiter of waiters) waiter(message.params);
});

function send(method, params = {}) {
  const id = nextId;
  nextId += 1;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
}

function once(method) {
  return new Promise((resolve) => {
    const waiters = events.get(method) ?? [];
    waiters.push(resolve);
    events.set(method, waiters);
  });
}

await send("Page.enable");
await send("Runtime.enable");
await mkdir(OUT, { recursive: true });

if (process.env.SEED_CART === "1") {
  await send("Page.addScriptToEvaluateOnNewDocument", {
    source: `try { localStorage.setItem("cloud.cart.v1", JSON.stringify([
      { variantId: "halo-smart-bulb--single", productSlug: "halo-smart-bulb", quantity: 1 },
      { variantId: "kettle-one--cream", productSlug: "kettle-one", quantity: 1 }
    ])); } catch {}`,
  });
}

await send("Emulation.setDeviceMetricsOverride", {
  width,
  height,
  deviceScaleFactor: 1,
  mobile: width < 600,
  screenWidth: width,
  screenHeight: height,
});

const loaded = once("Page.loadEventFired");
await send("Page.navigate", { url: new URL(route, BASE).toString() });
await loaded;
await sleep(500);

// Walk the page so lazy images load. Disable smooth scrolling so screenshot
// chunks are not captured mid-animation.
await send("Runtime.evaluate", {
  expression: `(async () => {
    document.documentElement.style.scrollBehavior = "auto";
    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const step = Math.max(innerHeight * 0.8, 400);
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo({ top: y, behavior: "instant" });
      await wait(80);
    }
    window.scrollTo({ top: 0, behavior: "instant" });
    await wait(300);
  })()`,
  awaitPromise: true,
});

// Let lazy images finish decoding before capturing.
await send("Runtime.evaluate", {
  expression: `Promise.all(Array.from(document.images).map((image) => image.decode().catch(() => {})))`,
  awaitPromise: true,
});
await sleep(300);

const clickSelector = process.env.CLICK_SELECTOR;
if (clickSelector) {
  await send("Runtime.evaluate", {
    expression: `document.querySelector(${JSON.stringify(clickSelector)})?.click()`,
  });
  await sleep(500);
}

const { result } = await send("Runtime.evaluate", {
  expression: `({ scrollHeight: document.documentElement.scrollHeight, scrollWidth: document.documentElement.scrollWidth, innerWidth, clientWidth: document.documentElement.clientWidth })`,
  returnByValue: true,
});
const total = result.value.scrollHeight;
const slug = route === "/" ? "home" : route.replace(/^\//, "").replace(/[/?=&]+/g, "-");

for (let index = 0, y = 0; index < maxChunks && y < total; index += 1, y += height) {
  await send("Runtime.evaluate", {
    expression: `window.scrollTo({ top: ${y}, behavior: "instant" });`,
  });
  await sleep(300);
  const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  const file = path.join(OUT, `${slug}-${width}-scroll-${index}.png`);
  await writeFile(file, Buffer.from(shot.data, "base64"));
  console.log(`${file} (y=${y})`);
}

socket.close();
chrome.kill();
await sleep(400);
await rm(profile, { recursive: true, force: true }).catch(() => {});
console.log(`${route} ${width}x${height} total=${total} width=${result.value.scrollWidth}/${result.value.clientWidth}`);
process.exit(0);

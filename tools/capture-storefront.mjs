/**
 * Full-page screenshots for Cloud visual QA.
 *
 * Usage:
 *   node tools/capture-storefront.mjs [route ...]
 *
 * Chrome is driven over the DevTools protocol so mobile widths below Chrome's
 * minimum window size are emulated properly. Override CHROME_PATH if Chrome is
 * installed somewhere other than the default Windows location.
 */
import { spawn } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const CHROME =
  process.env.CHROME_PATH ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const OUT = process.env.SHOT_DIR ?? path.join(os.tmpdir(), "cloud-shots");
const widths = [1440, 390];
const routes = process.argv.slice(2);
if (routes.length === 0) routes.push("/");

const port = 9300 + Math.floor(Math.random() * 500);
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

// Optionally seed a bag so cart and checkout captures show their populated
// states. The key is only set on the storefront origin.
if (process.env.SEED_CART) {
  const loaded = once("Page.loadEventFired");
  await send("Page.navigate", { url: BASE });
  await loaded;
  await send("Runtime.evaluate", {
    expression: `localStorage.setItem('cloud.cart.v1', JSON.stringify([
      { variantId: 'halo-smart-bulb--single', productSlug: 'halo-smart-bulb', quantity: 1 },
      { variantId: 'kettle-one--cream', productSlug: 'kettle-one', quantity: 1 }
    ]))`,
  });
}

const reports = [];

for (const width of widths) {
  await send("Emulation.setDeviceMetricsOverride", {
    width,
    height: width < 600 ? 844 : 1000,
    deviceScaleFactor: 1,
    mobile: width < 600,
    screenWidth: width,
    screenHeight: width < 600 ? 844 : 1000,
  });

  for (const route of routes) {
    const url = new URL(route, BASE).toString();
    const loaded = once("Page.loadEventFired");
    await send("Page.navigate", { url });
    await loaded;
    await sleep(400);

    // Native lazy-loading only fetches images near the viewport. Walk the page
    // once so a beyond-viewport capture includes every product render.
    await send("Runtime.evaluate", {
      expression: `(async () => {
        const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        const step = Math.max(innerHeight * 0.8, 400);
        for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await wait(90);
        }
        window.scrollTo(0, 0);
        await wait(350);
      })()`,
      awaitPromise: true,
    });
    await sleep(500);

    const { result } = await send("Runtime.evaluate", {
      expression: `(() => {
        const all = [...document.querySelectorAll("*")];
        const overflowing = all
          .filter((node) => {
            const rect = node.getBoundingClientRect();
            return rect.width > 0 && (rect.right > innerWidth + 1 || rect.left < -1);
          })
          .slice(0, 12)
          .map((node) => {
            const rect = node.getBoundingClientRect();
            return {
              tag: node.tagName.toLowerCase(),
              class: String(node.className || "").slice(0, 90),
              left: Math.round(rect.left),
              right: Math.round(rect.right),
              width: Math.round(rect.width),
            };
          });
        return {
          innerWidth,
          clientWidth: document.documentElement.clientWidth,
          scrollWidth: document.documentElement.scrollWidth,
          scrollHeight: document.documentElement.scrollHeight,
          overflowing,
        };
      })()`,
      returnByValue: true,
    });

    // Chrome's captureBeyondViewport path can stitch animated/sticky content
    // incorrectly on long pages. Grow the emulated viewport instead and take a
    // normal viewport capture, then restore the real viewport for the next URL.
    const fullHeight = Math.min(Math.ceil(result.value.scrollHeight), 16000);
    await send("Emulation.setDeviceMetricsOverride", {
      width,
      height: fullHeight,
      deviceScaleFactor: 1,
      mobile: width < 600,
      screenWidth: width,
      screenHeight: width < 600 ? 844 : 1000,
    });
    await sleep(350);
    const screenshot = await send("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: false,
    });
    await send("Emulation.setDeviceMetricsOverride", {
      width,
      height: width < 600 ? 844 : 1000,
      deviceScaleFactor: 1,
      mobile: width < 600,
      screenWidth: width,
      screenHeight: width < 600 ? 844 : 1000,
    });

    const slug =
      route === "/"
        ? "home"
        : route.replace(/^\//, "").replace(/[/?=&]+/g, "-").replace(/-+$/, "");
    const file = path.join(OUT, `${slug}-${width}.png`);
    await writeFile(file, Buffer.from(screenshot.data, "base64"));
    reports.push({ route, width, file, ...result.value });
  }
}

socket.close();
chrome.kill();
await sleep(400);
// Windows can briefly hold Chromium profile files open after the process exits.
await rm(profile, { recursive: true, force: true }).catch(() => {});

for (const report of reports) {
  console.log(
    `${report.width}px ${report.route} -> ${report.file} (${report.scrollWidth}×${report.scrollHeight})`,
  );
  if (report.scrollWidth > report.clientWidth) {
    console.log(`  overflow: ${report.scrollWidth - report.clientWidth}px`);
    for (const node of report.overflowing) {
      console.log(
        `  ${node.tag}.${node.class} left=${node.left} right=${node.right} width=${node.width}`,
      );
    }
  }
}

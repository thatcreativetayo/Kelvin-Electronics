import { spawn } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const CHROME =
  process.env.CHROME_PATH ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const input = process.argv[2];
const output = process.argv[3];
const port = 9100 + Math.floor(Math.random() * 300);
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
    } catch {}
    await sleep(150);
  }
  throw new Error("Chrome did not expose a DevTools endpoint.");
}
const targets = await endpoint();
const page = targets.find((target) => target.type === "page");
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
await send("Emulation.setDeviceMetricsOverride", {
  width: 1200,
  height: 1200,
  deviceScaleFactor: 1,
  mobile: false,
});
const loaded = once("Page.loadEventFired");
await send("Page.navigate", { url: pathToFileURL(path.resolve(input)).toString() });
await loaded;
await sleep(500);
const shot = await send("Page.captureScreenshot", {
  format: "png",
  captureBeyondViewport: false,
  omitBackground: true,
});
await writeFile(output, Buffer.from(shot.data, "base64"));
socket.close();
chrome.kill();
await sleep(300);
await rm(profile, { recursive: true, force: true }).catch(() => {});
console.log(output);

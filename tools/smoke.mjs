import { spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Click-through smoke test for the local-first cart. This intentionally uses
// the same CDP plumbing as tools/shot.mjs instead of adding a browser test
// dependency to the storefront.

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9334;
const BASE = "http://localhost:3000";
const profile = mkdtempSync(join(tmpdir(), "kelvin-smoke-"));

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

async function endpoint() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      if (response.ok) return (await response.json()).find((target) => target.type === "page");
    } catch {
      /* not ready */
    }
    await sleep(200);
  }
  throw new Error("Chrome did not start.");
}

const page = await endpoint();
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

const evaluate = async (expression) => {
  const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result?.value;
};

async function waitFor(expression, timeoutMs = 10000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (await evaluate(expression)) return;
    await sleep(150);
  }
  throw new Error(`Timed out waiting for: ${expression}`);
}

async function navigate(path) {
  await send("Page.navigate", { url: `${BASE}${path}` });
  await waitFor("document.readyState === 'complete'");
  await sleep(900);
}

function assert(name, condition, actual) {
  if (!condition) throw new Error(`${name} failed: ${JSON.stringify(actual)}`);
  return { name, actual };
}

const checks = [];

await send("Page.enable");
await send("Runtime.enable");

// 1. Add to bag from a PDP.
await navigate("/products/airpods-pro");
await waitFor("[...document.querySelectorAll('button')].some((button) => button.textContent.includes('Add to bag'))");
await evaluate(
  `[...document.querySelectorAll('button')].find((button) => button.textContent.includes('Add to bag')).click()`,
);
await waitFor("JSON.parse(localStorage.getItem('kelvin.cart.v1') || '[]').length === 1");
const afterAdd = await evaluate(`JSON.parse(localStorage.getItem('kelvin.cart.v1'))`);
checks.push(assert("add to bag stores a line", afterAdd.length === 1 && afterAdd[0].variantId === "airpods-pro--white", afterAdd));

// 2. Quantity stepper on the cart page.
await navigate("/cart");
await waitFor("document.querySelector('button[aria-label^=\"Increase quantity for\"]') !== null");
await evaluate(`document.querySelector('button[aria-label^="Increase quantity for"]').click()`);
await sleep(400);
const afterIncrease = await evaluate(`JSON.parse(localStorage.getItem('kelvin.cart.v1'))`);
const subtotalAfterIncrease = await evaluate(
  `document.querySelector('[aria-label="Order total"] dd')?.textContent.trim()`,
);
checks.push(assert("quantity increment persists", afterIncrease[0].quantity === 2, afterIncrease));
checks.push(assert("subtotal follows quantity", subtotalAfterIncrease === "$498", subtotalAfterIncrease));

// 3. Remove the line.
await evaluate(
  `[...document.querySelectorAll('button')].find((button) => button.textContent.trim() === 'Remove').click()`,
);
await waitFor("JSON.parse(localStorage.getItem('kelvin.cart.v1') || '[]').length === 0");
const emptyCopy = await evaluate(`document.body.innerText.includes('There is nothing here yet.')`);
checks.push(assert("remove clears the bag", emptyCopy === true, emptyCopy));

// 4. Checkout is an honest boundary when no integrations are configured.
await evaluate(
  `localStorage.setItem('kelvin.cart.v1', JSON.stringify([{ variantId: 'airpods-max--silver', productSlug: 'airpods-max', quantity: 1 }]))`,
);
await navigate("/checkout");
await waitFor("document.querySelector('button[type=submit]') !== null");
const submit = await evaluate(`(() => {
  const button = document.querySelector('button[type=submit]');
  return { disabled: button.disabled, text: button.textContent.trim() };
})()`);
checks.push(
  assert(
    "unconfigured checkout is disabled",
    submit.disabled === true && submit.text === "Payment not connected",
    submit,
  ),
);

console.log(JSON.stringify({ ok: true, checks }, null, 2));
ws.close();
chrome.kill();

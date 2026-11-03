import { spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Click-through smoke test for the local-first cart. This intentionally uses
// raw CDP instead of adding a browser test dependency to the storefront.

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9334;
const BASE = "http://localhost:3000";
const profile = mkdtempSync(join(tmpdir(), "cloud-smoke-"));

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

// 1. Add to cart from a PDP.
await navigate("/products/halo-smart-bulb");
await waitFor("[...document.querySelectorAll('button')].some((button) => button.textContent.includes('Add to cart'))");
await evaluate(
  `[...document.querySelectorAll('button')].find((button) => button.textContent.includes('Add to cart')).click()`,
);
await waitFor("JSON.parse(localStorage.getItem('cloud.cart.v1') || '[]').length === 1");
const afterAdd = await evaluate(`JSON.parse(localStorage.getItem('cloud.cart.v1'))`);
checks.push(
  assert(
    "add to cart stores a line",
    afterAdd.length === 1 && afterAdd[0].variantId === "halo-smart-bulb--single",
    afterAdd,
  ),
);

// 2. Quantity stepper on the cart page.
await navigate("/cart");
await waitFor("document.querySelector('button[aria-label^=\"Increase quantity for\"]') !== null");
await evaluate(`document.querySelector('button[aria-label^="Increase quantity for"]').click()`);
await sleep(400);
const afterIncrease = await evaluate(`JSON.parse(localStorage.getItem('cloud.cart.v1'))`);
const subtotalAfterIncrease = await evaluate(
  `document.querySelector('[aria-label="Order total"] dd')?.textContent.trim()`,
);
checks.push(assert("quantity increment persists", afterIncrease[0].quantity === 2, afterIncrease));
checks.push(
  assert(
    "subtotal follows quantity in Naira",
    subtotalAfterIncrease?.includes("37,000") === true,
    subtotalAfterIncrease,
  ),
);

// 3. Remove the line.
await evaluate(
  `[...document.querySelectorAll('button')].find((button) => button.textContent.trim() === 'Remove').click()`,
);
await waitFor("JSON.parse(localStorage.getItem('cloud.cart.v1') || '[]').length === 0");
const emptyCopy = await evaluate(`document.body.innerText.includes('Your bag is empty.')`);
checks.push(assert("remove clears the bag", emptyCopy === true, emptyCopy));

// 4. Checkout is an honest boundary when no integrations are configured.
await evaluate(
  `localStorage.setItem('cloud.cart.v1', JSON.stringify([{ variantId: 'halo-smart-bulb--single', productSlug: 'halo-smart-bulb', quantity: 1 }]))`,
);
await navigate("/checkout");
await waitFor(
  "[...document.querySelectorAll('button')].some((button) => button.textContent.includes('Payment not connected'))",
);
const submit = await evaluate(`(() => {
  const button = [...document.querySelectorAll('button')].find((candidate) =>
    candidate.textContent.includes('Payment not connected'),
  );
  return { disabled: button.disabled, text: button.textContent.trim() };
})()`);
checks.push(
  assert(
    "unconfigured checkout is disabled",
    submit.disabled === true && submit.text === "Payment not connected",
    submit,
  ),
);

// 5. The server boundary is explicit too, and rejects non-Nigerian delivery
// addresses before it looks at integration configuration.
const order = {
  items: [{ variantId: "halo-smart-bulb--single", quantity: 1 }],
  customer: { email: "qa@cloud.ng", firstName: "QA", lastName: "Cloud" },
  address: { line1: "1 Test Street", city: "Lagos", country: "Nigeria" },
};
const boundary = await fetch(`${BASE}/api/checkout`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(order),
});
const boundaryBody = await boundary.json();
checks.push(
  assert(
    "unconfigured API returns 501",
    boundary.status === 501 && boundaryBody.error === "integration_not_configured",
    { status: boundary.status, body: boundaryBody },
  ),
);

const abroad = await fetch(`${BASE}/api/checkout`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ ...order, address: { ...order.address, country: "Ghana" } }),
});
const abroadBody = await abroad.json();
checks.push(
  assert(
    "non-Nigerian delivery is rejected",
    abroad.status === 400 && /Nigeria only/.test(abroadBody.message ?? ""),
    { status: abroad.status, body: abroadBody },
  ),
);

console.log(JSON.stringify({ ok: true, checks }, null, 2));
ws.close();
chrome.kill();

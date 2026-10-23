# QA runbook

Last pass: **22 October 2026**, Windows 11, Node 24.10.0, pnpm 11.8.0, Chrome headless.

This records what was actually exercised. The storefront has a browser smoke test and a seed check, but no unit, integration, or hosted-service tests. The hosted integrations have not been connected.

## Automated checks

| Check | Command | Result |
| --- | --- | --- |
| Storefront TypeScript | `pnpm typecheck` | Pass |
| Storefront production build | `pnpm build` | Pass — 31 pages generated, 12 product paths prerendered |
| Seed ↔ catalogue comparison | `pnpm seed:check` | Pass — 27 variants, 27 seed rows, IDs, SKUs and stock match |
| Browser commerce smoke test | `node tools/smoke.mjs` | Pass — 7 checks |
| Studio TypeScript | `cd studio && pnpm typecheck` | Pass |
| Studio production build | `cd studio && pnpm build` | Pass |
| Visual capture and overflow scan | `node tools/capture-storefront.mjs …` | Pass — 10 routes at 1440 and 390, no horizontal overflow |

Build route summary:

```text
/                         static, revalidated
/_not-found               static
/api/checkout             dynamic
/api/cloudinary/sign      dynamic
/api/stock                dynamic
/apple-icon.png           static
/cart                     static
/checkout                 static
/collections/[slug]       dynamic
/credits                  static
/how-it-works             static
/icon.svg                 static
/products/[slug]          12 prerendered paths
/search                   dynamic
/studio                   static
```

## Commerce smoke test

`node tools/smoke.mjs` drives Chromium over the DevTools protocol against `http://localhost:3000`.

| Check | Observed |
| --- | --- |
| Add to bag on `/products/halo-smart-bulb` | `halo-smart-bulb--single`, quantity 1, persisted under `cloud.cart.v1` |
| Increase quantity on `/cart` | Quantity 2 persisted |
| Subtotal follows quantity | `₦37,000` |
| Remove the line | Bag cleared and empty-bag state rendered |
| Unconfigured checkout | Primary button disabled, label `Payment not connected` |
| `POST /api/checkout` unconfigured | `501 integration_not_configured`; lists Supabase and payment variables |
| Non-Nigerian delivery address | `400 invalid_order`, “Cloud currently delivers within Nigeria only.” |

The API tests run against the same unconfigured process. No order row was written and no charge was attempted.

## Visual and responsive checks

Captured with `tools/capture-storefront.mjs` at **1440 px** and **390 px**:

| Surface | 1440 | 390 | Notes |
| --- | --- | --- | --- |
| Home | Pass | Pass | Hero, category blocks, new-in row, Cloud Home edit, Cloud Wear, import story |
| All products | Pass | Pass | Full catalogue grid, filters and sort toolbar |
| Lighting collection | Pass | Pass | Three products, desktop filters, mobile filter sheet |
| Wear collection | Pass | Pass | Three products, fit filters |
| Halo bulb product | Pass | Pass | Gallery, variant picker, price range, stock, specs, related products |
| Search `light` | Pass | Pass | Query echo and matching products |
| Cart with two lines | Pass | Pass | Thumbnail, quantity controls, delivery progress, summary |
| Checkout with two lines | Pass | Pass | Contact, delivery, payment boundary, order review |
| How Cloud works | Pass | Pass | Sourcing, customs, delivery, returns, warranty commitments |
| Credits | Pass | Pass | Original renders and font licences; stacked mobile layout |

`document.documentElement.scrollWidth` equalled the viewport width on every route at both breakpoints. No overflow offenders were reported. The capture script grows the emulated viewport instead of using Chrome's `captureBeyondViewport` stitching, which previously produced repeated-content artifacts on long pages.

The seeded cart used for populated cart/checkout captures is `halo-smart-bulb--single` × 1 and `kettle-one--cream` × 1, for a `₦60,500` subtotal. Shipping is `₦4,500`, because the bag is below the `₦150,000` free-delivery threshold. The drawer and cart confirm the same total.

The review covered the hero, catalogue tiles, product cards, PDP purchase area, cart drawer, cart page, checkout form and footer at both widths. Empty bag, empty checkout and no-result search states were also inspected.

### Not visually verified

- Safari and Firefox. The browser pass used Chromium only.
- Real iOS or Android devices, touch scrolling, and virtual-keyboard behaviour.
- Hover, focus-visible, and reduced-motion states beyond code review.
- Very large or very small text settings and third-party browser translation.

## Seed and image checks

`pnpm seed:check` parses `src/data/products.ts` and `supabase/seed.sql` and checks:

- Exactly 27 variants in both places.
- Every variant ID is present in the seed.
- SKUs match.
- Seed stock matches.
- No extra seed rows.

All 12 product illustrations are committed as local PNG and SVG files under `public/products/`. The browser captures loaded the hero bulb, Arc floor lamp, category images and related-product images with non-zero natural dimensions. The `next/image` loader is configured for local paths without query strings.

## Integration status

| Integration | Status | What was verified |
| --- | --- | --- |
| Sanity | Not connected | Schemas, Studio structure and custom components typecheck; Studio production build passes. No real project or dataset was queried. |
| Cloudinary | Not connected | Signing route and Studio image field typecheck. No upload was performed; no credentials exist in the repository. |
| Supabase | Not applied | SQL migrations and seed were reviewed. They could not be executed because Docker, the Supabase CLI and `psql` are unavailable here. |
| Payments | Not implemented | No provider adapter, card fields, charge, webhook, or confirmation email. Intentional. |

The storefront therefore runs on the seed catalogue. No environment variables are required for the build, local cart, search, filters, or the disabled checkout boundary.

## Reproduce

```powershell
pnpm install
pnpm typecheck
pnpm seed:check
pnpm build
pnpm dev
node tools/smoke.mjs
$env:SEED_CART="1"; node tools/capture-storefront.mjs / /collections/all /collections/lighting /collections/wear /products/halo-smart-bulb /search?q=light /cart /checkout /how-it-works /credits
```

On macOS/Linux, use `SEED_CART=1 node tools/capture-storefront.mjs …`. Screenshots go to `%TEMP%\cloud-shots` on Windows or `SHOT_DIR`. The smoke test expects the dev server on port 3000; it does not start one itself.

Studio:

```bash
cd studio
pnpm install
pnpm typecheck
pnpm build
```

## Before release

- [ ] Implement and test a Nigerian payment adapter, webhook verification, idempotency, and confirmation email.
- [ ] Apply the migrations and seed to a disposable Supabase project; run `supabase db reset` from empty.
- [ ] Exercise `create_order` for success, insufficient stock, duplicate variant, unknown variant, and rollback.
- [ ] Verify the order number and kobo totals in the database after a real test checkout.
- [ ] Add reservation expiry and a release job for abandoned payments.
- [ ] Replace placeholder contact details and final domain.
- [ ] Confirm delivery, returns, warranty, and customs language with the operating team.
- [ ] Connect Sanity and Cloudinary; publish at least one product through each and verify the storefront mapping.
- [ ] Run a privacy, security, and rate-limit review of `/api/checkout` and `/api/cloudinary/sign`.
- [ ] Re-run this document on the target Node version and against the production URL.

Do not treat this document as evidence that the Supabase SQL runs or that payment is safe to enable. Both require a fresh environment and a real provider test.

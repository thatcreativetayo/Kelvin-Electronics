# QA

Last pass: 21 October 2026, Windows 11, Node 24.10.0, pnpm 11.8.0, Chrome headless.

This document records what was exercised in this build. It is deliberately narrower than a test plan: there is no automated test suite yet, and the hosted integrations have not been connected.

## Automated checks

| Check | Command | Result |
| --- | --- | --- |
| Storefront production build | `pnpm build` | Pass — 31 routes generated |
| Storefront TypeScript | `pnpm typecheck` | Pass |
| Studio install | `cd studio && pnpm install` | Pass |
| Studio TypeScript | `pnpm --dir studio typecheck` | Pass |
| Studio production build | `pnpm --dir studio build` | Pass |

The route table from the final build:

```text
○ /                    5m
○ /_not-found
ƒ /api/checkout
ƒ /api/cloudinary/sign
ƒ /api/stock
○ /cart
○ /checkout
ƒ /collections/[slug]
○ /credits
● /products/[slug]     (14 prerendered paths)
ƒ /search
○ /studio
```

There are no unit, integration or end-to-end tests. `pnpm typecheck` covers the storefront; the Studio has its own typecheck because it is a separate package.

## Browser and visual checks

The site was served with `pnpm start` and captured at **1440 × 1000** and **390 × 900** using `tools/shot.mjs` (Chrome DevTools Protocol). Every capture waited for fonts, images and the route's main content, then checked document width and image decode state.

| Surface | 1440 | 390 | Notes |
| --- | --- | --- | --- |
| Home | Pass | Pass | Hero, departments, new arrivals, editorial, shortlist, service, footer |
| Collection (`/collections/audio`) | Pass | Pass | Three products, desktop filter rail, mobile filter sheet, sort toolbar |
| Product (`/products/airpods-max`) | Pass | Pass | Gallery, variant picker, sticky purchase area, specs, related products |
| Bag with three lines / four units | Pass | Pass | Thumbnails, quantity steppers, removal, subtotal, shipping, summary |
| Checkout with the same bag | Pass | Pass | Contact, address, payment boundary, order summary, disabled submit |
| Search (`/search?q=airpods`) | Pass | — | Two results, query echo, empty-query state covered by route code |
| Empty search (`/search?q=zzzz`) | Pass | — | Honest no-results state |
| Credits | Pass | Pass | Responsive list on mobile; table on desktop |

`document.documentElement.scrollWidth` equalled the viewport width on every captured route at both breakpoints. No horizontal overflow offenders were reported. Images reported `complete: true` and non-zero natural dimensions after the lazy-load priming pass.

The visual review caught and fixed three real layout defects:

- Product cards were using a flex-column article, which let the image container and text row drift out of alignment in three-column grids. They are now normal block articles; card metadata aligns across a row.
- The cart's mobile footer note was cramped into one row. It now stacks below the "Continue shopping" link on narrow screens.
- The credits table forced a 760 px horizontal scroll on a 390 px screen. Mobile now uses a stacked attribution list; the table remains at desktop widths.

Product photography was also normalised during this pass. All 14 catalog images are transparent PNG cutouts on the bone canvas; `mix-blend-mode` and photo plates were removed. The iPad, Kindle, iPhone and Switch required manual crops because rembg either merged a group shot or erased light devices. The AirPods Pro source was replaced with an open-case studio shot and its credit was updated.

### Not visually verified

- Safari and Firefox. The headless pass used Chromium only.
- Real iOS/Android devices, touch scrolling and virtual-keyboard behaviour.
- The full footer below 5200 px on mobile; the screenshot tool caps capture height. The footer was inspected at desktop and partially at mobile.
- Hover, focus-visible and reduced-motion states beyond code review.

## Commerce behaviour

`node tools/smoke.mjs` drives a real Chromium session against the production server and passed these checks on the final build:

| Check | Observed |
| --- | --- |
| Add to bag on `/products/airpods-pro` | One line persisted: `airpods-pro--white` × 1 |
| Increase quantity in `/cart` | Quantity persisted as 2; subtotal followed to `$498` |
| Remove the line | `localStorage` emptied and the empty-bag state rendered |
| Checkout with no integrations | Submit disabled, labelled `Payment not connected` |
| `POST /api/checkout` with no variables | `501 integration_not_configured`, listing the missing variables |

The larger screenshot bag of `airpods-max--silver` (1), `kindle-paperwhite--16` (2) and `dualsense--white` (1) rendered four units and a **$921** subtotal; shipping is complimentary above $150. The cart is local-first and persists to `localStorage` under `kelvin.cart.v1`.

Checkout validates required contact/address fields client-side and re-validates and re-prices on the server. The `/studio` status board reports payment as unavailable by construction, even when the order-capture gate is set.

## Integration status

| Integration | Status | What was verified |
| --- | --- | --- |
| Sanity content | Not connected | Schemas, Studio structure and custom components typecheck; Studio builds. No real project/dataset was queried. |
| Cloudinary | Not connected | Signing route and Studio field typecheck. No asset was uploaded; no credentials exist in the repo. |
| Supabase | Not applied | SQL migrations and seed were reviewed; they could not be executed because Docker, the Supabase CLI and `psql` are unavailable in this environment. |
| Payments | Not implemented | No provider adapter, no card fields, no charge. This is intentional. |

The storefront therefore runs on the seed catalog, which is the intended demo state. The build does not require any environment variable.

## Reproduce

```bash
pnpm install
pnpm build
pnpm start
node tools/shot.mjs .shots
node tools/smoke.mjs
```

`tools/shot.mjs` writes desktop and mobile PNGs plus a JSON diagnostic block per route to `.shots/`. The directory is ignored by git. To exercise the bag without clicking through the UI, the script seeds the same three-line cart in `localStorage` before capturing `/cart` and `/checkout`.

For Studio checks:

```bash
cd studio
pnpm install
pnpm typecheck
pnpm build
```

Do not treat this document as evidence that the Supabase migrations run. They need a disposable Postgres/Supabase environment and a fresh `supabase db reset` before order capture is enabled.

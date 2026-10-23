# cloud.

**The good stuff, brought home.**

Cloud is a Nigerian importer and retailer. We buy home electronics abroad, handle customs, and deliver them across Nigeria in Naira. Cloud Wear is the first clothing capsule, with more apparel to follow.

This repository is the Cloud storefront: a Next.js 16 App Router application with a local-first cart, an honest checkout boundary, optional Sanity content, optional Supabase commerce, and optional Cloudinary media.

## At a glance

| | |
| --- | --- |
| Storefront | Next.js 16.4.2, React 19.3.1, TypeScript 5.9.3 |
| Styling | Tailwind CSS 4.3.3 with semantic tokens in `src/app/globals.css` |
| Package manager | pnpm 11.8.0 |
| Type | Self-hosted DM Sans (commerce) and Instrument Serif (display) |
| Catalogue | 12 products, 27 variants: Lighting, Power, Kitchen, Wear |
| Currency | NGN, integer kobo everywhere in code and data |
| Delivery | Free over ₦150,000, otherwise ₦4,500; Nigeria only |
| Cart storage | `localStorage` key `cloud.cart.v1` |
| Commerce source | Local catalogue seed by default; Sanity for published content |
| Order capture | Supabase Postgres function, closed until server credentials exist |

## Run it

Requires Node 22 or newer.

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000. No environment variables are required for the storefront, the seeded catalogue, the local cart, or the checkout boundary.

Other commands:

```bash
pnpm typecheck      # TypeScript, storefront
pnpm build          # production build
pnpm start          # serve the production build on :3000
pnpm seed:check     # compare supabase/seed.sql with src/data/products.ts
pnpm products:build # regenerate the original product PNG renders
```

The Sanity Studio is a separate package:

```bash
cd studio
pnpm install
pnpm dev            # http://localhost:3333
pnpm typecheck
pnpm build
```

## What is in the storefront

- A warm editorial homepage with a prominent product search, colour-blocked collections, the Cloud Home edit, the Cloud Wear capsule, and the import promise.
- Collection pages for `/collections/all`, `lighting`, `power`, `kitchen`, and `wear`, including price bands, type, room or fit filters, and sorting.
- Product pages with variant selection, quantity, stock state, specifications, delivery, returns, and a one-year electronics warranty.
- A search page at `/search?q=...` over the current catalogue.
- A local-first bag, cart drawer, and cart page. Adding to the bag never calls a server.
- A checkout form that accepts Nigerian delivery addresses only. Totals are recalculated on the server from the catalogue; the client cannot choose a price.
- `/how-it-works` for sourcing, delivery, returns, warranty, and the honest-commerce boundaries.
- `/credits` for the original Cloud product renders and self-hosted typeface licences.
- `/studio` as a read-only integration status board. The editable Sanity Studio lives in `studio/`.

## Prices, stock, and delivery

All money is stored as **integer kobo**. For example, ₦18,500 is `1850000`. The single formatter is `src/lib/format.ts`; it uses `en-NG` and the narrow Naira symbol.

Shipping rules live in `src/lib/shipping.ts`:

- Free at a ₦150,000 subtotal or above (`15_000_000` kobo).
- Otherwise ₦4,500 (`450_000` kobo).
- The cart preview, checkout summary, and server validator use the same rule.

The catalogue in `src/data/products.ts` is the source of truth for the seeded build. Product stock is seeded there and mirrored in `supabase/seed.sql`. Once Supabase is live, inventory lives in `inventory_items`; the storefront reads current stock from `/api/stock` and falls back to seed stock when Supabase is not configured.

## Checkout boundary

The UI does not simulate a successful payment. When Supabase or the payment environment is missing:

- The checkout button is disabled and reads “Payment not connected”.
- `POST /api/checkout` returns `501 integration_not_configured` with the missing variable names.
- No order is written and no payment is taken.

When the server variables are present, the route validates the Nigerian address, rebuilds every line total from the catalogue, and calls the Supabase `create_order` function. That function reserves stock transactionally and writes the order with a `CLD-` number.

The payment adapter is **not implemented**. `PAYMENT_PROVIDER_SECRET_KEY` is part of the readiness gate so a deploy cannot accidentally pretend to be live, but the route currently stops after recording the order. See `docs/CHECKOUT.md` before launch.

## Content and integrations

The storefront runs entirely on seed data when integrations are absent.

| Integration | What it enables | Required variables |
| --- | --- | --- |
| Sanity | Published products and collections replace the seed catalogue | `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET` |
| Supabase | Server-side inventory reads and order capture | `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |
| Cloudinary | Signed uploads from the Studio, CDN product images | `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_UPLOAD_TOKEN` |
| Payment provider | The remaining checkout gate; adapter still to be built | `PAYMENT_PROVIDER_SECRET_KEY` |

Copy `.env.example` to `.env.local`. Studio variables live in `studio/.env.local`; see `studio/.env.example`.

Sanity currently owns **products and collections**. The homepage composition, navigation, and editorial copy are code-driven in this build; their schemas exist in `studio/` for the next content pass but are not yet read by the storefront. The header navigation also comes from the seed collection list.

## Original product imagery

The 12 product renders are original Cloud illustrations, not manufacturer photography. They are generated from `tools/cloud-products.mjs` and rendered with `tools/render-cloud-products.mjs`. The PNG and SVG files are committed so the storefront does not need the generation tools at runtime.

The fonts are self-hosted under the SIL Open Font License 1.1. Licence copies are in `public/licenses/` and `src/app/fonts/`.

## Quality checks

```bash
pnpm typecheck
pnpm build
pnpm seed:check
node tools/smoke.mjs
```

`tools/smoke.mjs` drives Chrome through the PDP → bag → cart → checkout boundary and asserts Naira totals, the disabled payment state, the 501 API response, and rejection of non-Nigerian addresses. It expects the dev server on `http://localhost:3000`.

For full-page screenshots at 1440 px and 390 px:

```bash
node tools/capture-storefront.mjs / /collections/lighting /products/halo-smart-bulb /cart /checkout
```

Screenshots are written to `%TEMP%\cloud-shots` on Windows, or `SHOT_DIR` if set. The script also reports horizontal overflow.

## Before launch

- Replace the placeholder contact details in `src/data/site.ts`: `hello@cloud.ng` and `+234 700 000 0000` are not live support channels.
- Set the final domain in `NEXT_PUBLIC_SITE_URL` and update metadata/share assets.
- Create the Sanity project, add CORS origins, and seed or migrate content.
- Apply the Supabase migrations, run `supabase/seed.sql`, and verify the `create_order` function in a real Postgres instance. The SQL in this repository has not been executed in this environment because Docker, the Supabase CLI, and `psql` are unavailable.
- Implement and test the payment adapter before accepting orders.
- Confirm delivery, returns, warranty, and customs language with the operating team.

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Checkout and order capture](docs/CHECKOUT.md)
- [Content model](docs/CONTENT-MODEL.md)
- [Brand and interface notes](docs/BRAND.md)
- [QA runbook](docs/QA.md)
- [Supabase setup](supabase/README.md)

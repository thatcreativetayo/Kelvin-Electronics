# KELVIN

An independent electronics storefront. Audio, computing, mobile, imaging and gaming, chosen for how they hold up after the unboxing.

The visual language is warm bone paper, near-black ink and a single ultramarine accent. Product photography floats directly on the canvas — no cards, no gradients, no invented reviews or countdowns.

**Current state:** the storefront is complete and deployable on the local seed catalog. Sanity Studio, the Supabase commerce schema and Cloudinary uploads are implemented and documented, but are **not connected** until you provide credentials. Checkout is an honest boundary: it never simulates a payment. See [Boundaries](#boundaries).

---

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16.4 (App Router, Turbopack) |
| UI | React 19.3, Tailwind CSS 4.3, TypeScript 5.9 |
| Type | Geist Sans / Geist Mono |
| Content | Sanity Studio 4 (separate package in `studio/`) |
| Commerce | Supabase Postgres + RLS + `create_order` transaction |
| Media | Cloudinary signed uploads + responsive delivery |
| Icons | Lucide |
| Package manager | pnpm 11 |

There is no component library and no UI kit. Every surface is hand-built against a small token system in `src/app/globals.css`.

---

## Quick start

```bash
pnpm install
pnpm dev
```

Open <http://localhost:3000>. No environment variables are required for the storefront to run: it reads the 14-product seed catalog in `src/data/` and checkout stays closed.

```bash
pnpm build     # production build
pnpm start     # serve the production build
pnpm typecheck # TypeScript, storefront only
```

The Studio is a separate install. Run these from the repository root:

```bash
cd studio
pnpm install
pnpm dev     # http://localhost:3333
```

It needs a Sanity project ID first — see [Sanity](#sanity-content).

---

## What is here

| Surface | Route | State |
| --- | --- | --- |
| Homepage | `/` | Complete — hero, departments, new arrivals, point of view, shortlist, service |
| Collection | `/collections/[slug]` | Complete — filters, facets, sort, URL state, pagination, mobile sheet |
| Product | `/products/[slug]` | Complete — gallery, variants, price range, specs, related |
| Search | `/search` | Complete — server-rendered over the catalog |
| Bag | `/cart` | Complete — quantity, removal, subtotal, local persistence |
| Checkout | `/checkout` | **Boundary** — form validates, API returns 501 until configured |
| Order API | `POST /api/checkout` | Validated, server-priced, stock-reserving, 501 by default |
| Stock API | `GET /api/stock` | Live stock from Supabase when configured |
| Upload signing | `POST /api/cloudinary/sign` | Signed Cloudinary uploads for the Studio |
| Studio status | `/studio` | Status board for Sanity, Supabase, Cloudinary and payments |
| Credits | `/credits` | Product photography attribution |
| Not found | `/_not-found` | Custom 404 |

Department slugs: `audio`, `computing`, `mobile`, `imaging`, `gaming`. `all` is a virtual collection.

### Design system

- Canvas `#f2f1ec`, paper `#f8f7f3`, ink `#111110`, accent `#1e3aff`.
- Radii 2 / 4 / 6 / 10 / 16 px; one easing curve, `cubic-bezier(0.16, 1, 0.3, 1)`.
- `.type-display`, `.type-h1`…`.type-micro` carry the editorial scale.
- Product photography is delivered as transparent 1200 × 1200 PNG cutouts, so devices sit directly on the canvas without plates, frames or blend modes.
- Motion is restrained: 180–420 ms transitions, no scroll hijacking, `prefers-reduced-motion` respected.

---

## Content adapter

`src/lib/content.ts` is the only place the storefront reads content.

1. If `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET` are set, it queries published products and collections from Sanity.
2. The Sanity shapes are mapped to the same `Product` / `Collection` types as the seed.
3. If Sanity is not configured, returns no products, or fails, it falls back to the seed catalog and logs one warning.
4. Home, collection, product and search pages all use the adapter. React `cache` deduplicates the read per request.

This means the site never depends on a CMS being reachable to render, and the fallback is obvious rather than a blank page. Sanity products must contain at least one variant and are filtered out otherwise.

The cart, checkout validator and `/api/stock` still index the **seed** variants. Before switching the storefront to live Sanity content, mirror the Sanity variant IDs into `src/data/products.ts` or extend those modules to read the adapter — see [Known gaps](#known-gaps).

---

## Sanity content

Schemas live in `studio/schemas/`. The Studio customises its navigation into ten sections:

1. **Overview** — live counts from the dataset and a pre-publish checklist.
2. **Products** — variants, Cloudinary photography, electronics specs, filters, SEO.
3. **Collections** — the five departments and their position in navigation.
4. **Homepage sections** — ordered hero / product rail / editorial / service blocks.
5. **Navigation** — announcement, header links, footer columns.
6. **Promotions** — scheduled announcement or homepage messages.
7. **Pages** — editorial pages with portable text.
8. **Brand & settings** — name, currency, contact, policies.
9. **SEO** — default title template, description, social image.
10. **Help** — an editor's operating manual.

Notable rules encoded in the schema:

- A product cannot publish without at least one image, one variant, a summary, price and stock.
- Variant IDs (`product-slug--option`) are required and treated as permanent: Supabase inventory and order lines key off them.
- Prices are integers in cents.
- Filter facets come from a controlled list so the collection filters do not fragment.
- Homepage, navigation, settings and SEO are singletons; their creation is filtered out of the global “new document” menu.

### Connect a Sanity project

```bash
# 1. Create a project + production dataset at https://sanity.io/manage
# 2. Add CORS origins for http://localhost:3000 and your production domain
# 3. Copy studio/.env.example to studio/.env.local and fill in the project ID
# 4. Install and run the Studio
cd studio
pnpm install
pnpm dev
# 5. Add the same project ID/dataset to .env.local for the storefront
```

No credentials ship in this repository. The Studio will start against a placeholder project ID but cannot read or write until a real one is supplied.

### Deploy the Studio

```bash
pnpm --dir studio deploy
```

Choose a hostname (`kelvin` → `kelvin.sanity.studio`) and set `NEXT_PUBLIC_SANITY_STUDIO_URL` to that origin so the storefront's admin link points at it.

### Cloudinary uploads

The product image field uploads directly to Cloudinary:

1. The Studio calls `POST /api/cloudinary/sign` with `x-upload-token`.
2. The route verifies `CLOUDINARY_UPLOAD_TOKEN`, then signs `folder` + `timestamp` with the API secret.
3. The browser uploads to Cloudinary and stores the returned `public_id` on the document.
4. The storefront delivers `f_auto,q_auto,w_1400` variants; the Studio previews the same asset.

Open **Upload settings** in the image field and paste the upload token once per browser. The token is stored in `localStorage` — it authorises uploads only and never reaches a bundle. For a multi-editor production setup, replace the shared token with a serverless function that verifies the editor's Sanity session.

### Content model

See [docs/CONTENT-MODEL.md](docs/CONTENT-MODEL.md) for every field, the variant contract and the editorial workflow.

---

## Supabase commerce

The SQL lives in `supabase/migrations/` and seeds 30 variant rows in `supabase/seed.sql`.

| Table | Purpose |
| --- | --- |
| `inventory_items` | One row per variant: `on_hand`, `reserved`, `safety_stock`. |
| `stock_movements` | Append-only audit trail: reservation, release, restock, correction, return. |
| `orders` | Immutable header: customer snapshot, address, totals, status. |
| `order_items` | Price/name/variant snapshots at the time of order. |
| `customers`, `addresses` | Profiles linked to `auth.users`. |
| `carts`, `cart_items` | Signed-in carts. Guests use the local cart. |

`public.create_order(...)` locks the requested inventory rows in variant order, rejects the entire order if any line is short, writes the header and line snapshots, reserves stock and appends movements — in one transaction. Only the service role may execute it.

RLS: inventory is publicly readable; customers, addresses, carts and orders are owner-scoped; orders and order items are read-only to authenticated users and cannot be inserted or mutated from the client. `stock_movements` is service-role only.

### Apply

```bash
# Local Supabase (Docker required)
supabase start
supabase db reset          # migrations + seed

# Linked project
supabase link --project-ref <ref>
supabase db push
# then run supabase/seed.sql once in the SQL editor
```

Full runbook: [supabase/README.md](supabase/README.md).

### Enable order capture

Set on the server:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
PAYMENT_PROVIDER_SECRET_KEY=
```

`checkoutConfigured` requires all four. When present, the checkout form writes a real order and reserves stock. **It still does not charge a card** — payment capture has no provider adapter in this build. The UI says so on the button and in the confirmation.

---

## Environment

Copy `.env.example` to `.env.local`. Every integration is optional; each switches on only when its variables are complete.

| Variable | Unlocks |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical metadata and share URLs |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` / `_DATASET` | Reading published content instead of the seed |
| `SANITY_API_READ_TOKEN` | Private datasets only |
| `NEXT_PUBLIC_SANITY_STUDIO_URL` | Footer/admin link to the deployed Studio |
| `NEXT_PUBLIC_SUPABASE_URL` / `_ANON_KEY` | Public Supabase client (signed-in carts, future account area) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side stock and order capture |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `_API_SECRET` | Signed media uploads |
| `CLOUDINARY_UPLOAD_TOKEN` | Authorises the Studio's signing request |
| `PAYMENT_PROVIDER_SECRET_KEY` | Checkout gate — presence enables order recording, not charging |

Never prefix the service-role key, API secret or upload token with `NEXT_PUBLIC_`.

---

## Deploy

### Storefront (Vercel)

1. Import the repository. Framework preset: **Next.js**, root directory `.`.
2. Install command `pnpm install`, build command `pnpm build`.
3. Add the environment variables for the integrations you have.
4. Set `NEXT_PUBLIC_SITE_URL` to the production origin and redeploy.

The site builds with zero variables. Without them it serves the seed catalog and the checkout boundary.

### Supabase

Run the migrations before enabling order capture. Add the production origin to the Supabase auth redirect allow-list when you add sign-in.

### Cloudinary

Set the three credentials + upload token on the storefront deployment. The sign endpoint must be reachable from the Studio origin; add the storefront production URL to the Studio's upload settings.

### Sanity

Deploy the Studio separately (above) and add both localhost and production origins to the project's CORS list.

---

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Next dev server on port 3000 |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build |
| `pnpm typecheck` | Storefront TypeScript |
| `node tools/shot.mjs .shots` | Desktop/mobile screenshots and overflow checks |
| `node tools/smoke.mjs` | Cart and checkout click-through smoke test |
| `cd studio && pnpm install` | Install the separate Studio package |
| `pnpm --dir studio dev` | Sanity Studio on port 3333 |
| `pnpm --dir studio build` | Production build of the Studio |
| `pnpm --dir studio deploy` | Deploy the Studio |
| `pnpm --dir studio typecheck` | Studio TypeScript (after installing studio deps) |
| `pnpm images:download` | Re-download the Commons source photography |
| `python tools/cutout.py` | Regenerate background-removed product cutouts with rembg |
| `python tools/cutout-manual.py` | Rebuild the planar iPad, Kindle, iPhone and Switch cutouts |

`tools/fetch-one.mjs` fetches a single Commons file by title. None of these tools run during a build.

---

## Product photography

All 14 product images come from Wikimedia Commons and are attributed on `/credits` (data in `src/data/image-credits.json`). Licences are a mix of CC0, CC BY 2.0/3.0/4.0 and public domain; the credits page links to each source file and names the licence.

The source photographs are converted to transparent 1200 × 1200 PNG cutouts with rembg and small device-specific crops. The original source photography remains in `public/products/` so the derivatives can be traced back to their credited sources. They are product shots of real devices, not manufacturer press renders, and they are not presented as KELVIN's own photography.

---

## Boundaries

Honest limits of this build:

- **No payment capture.** Checkout validates input, reprices server-side, records an order and reserves stock, but never collects card data or charges. Without Supabase + the payment gate it returns HTTP 501 with the exact missing variables.
- **No authentication UI.** The schema and RLS support signed-in carts and order history, but there is no sign-in screen yet. Guest carts live in `localStorage`.
- **No order confirmation email.** That belongs with the payment/provider work.
- **No idempotency key on `create_order`.** The form disables double submits, but a network-level retry could create a second pending order. Add an idempotency key before enabling a payment provider.
- **Sanity is unseeded.** The schemas and Studio are complete; creating a project and entering the first products is a manual step. The storefront therefore serves the seed catalog until then.
- **Studio uploads need a token.** There is no magic link between Sanity auth and the storefront sign endpoint; the shared token is a deliberate, documented stopgap.
- **No automated test suite.** The build, typecheck, route checks and visual passes are documented in [docs/QA.md](docs/QA.md). There are no unit or e2e tests yet.
- **Seed and Sanity variants must agree.** See [Known gaps](#known-gaps).

---

## Known gaps

1. **Cart/checkout still read the seed catalog.** `src/components/cart-provider.tsx`, `src/lib/checkout.ts` and `src/app/api/stock/route.ts` use `src/data/products.ts`. If you publish a different catalog in Sanity, mirror the variant IDs and prices into the seed, or refactor those modules to await `getCatalog()`. This is the next backend task.
2. **Header/footer navigation is static.** `src/components/site-header.tsx` and `site-footer.tsx` use the seed collections rather than the `navigation` document. The Studio schema for it is ready.
3. **No promotion rendering.** The `promotion` schema exists; the storefront does not yet read it.
4. **No account screens.** Supabase auth, carts and order history are schema-ready but unbuilt.

None of these affect the demo catalog: it is the seed, and it is complete.

---

## Structure

```
src/
  app/                 routes, API handlers, global CSS
  components/          header, footer, cart, product, collection controls
  data/                seed catalog, collections, image credits
  lib/                 catalog query, content adapter, checkout validation,
                       env status, Supabase/Cloudinary helpers, formatting
studio/                separate Sanity Studio package
  schemas/             document + object schemas
  components/          Overview, Help, logo, signed Cloudinary input
  structure.ts         ten-section Studio navigation
supabase/
  migrations/          schema, create_order, RLS
  seed.sql             30 inventory rows
docs/                  architecture, content model, checkout, QA
tools/                 image staging scripts
public/products/       14 transparent cutouts plus credited source photography
```

---

## Documentation

- [Architecture](docs/ARCHITECTURE.md) — data ownership, request paths, trust boundaries.
- [Content model](docs/CONTENT-MODEL.md) — schema fields, variant contract, editorial workflow.
- [Checkout](docs/CHECKOUT.md) — validation, SQL transaction, payment integration plan.
- [QA](docs/QA.md) — what was tested and how to repeat it.

---

## Licence

The storefront code is original work. Product names and marks belong to their manufacturers. Product photography is credited on `/credits` under the licences listed there.

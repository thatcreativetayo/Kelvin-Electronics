# Architecture

Cloud is a single Next.js application with optional external services. The storefront must remain useful when every integration is absent, so each external plane is an enhancement rather than a hard dependency.

```text
Browser
  |
  v
Next.js 16 App Router
  |-- React Server Components: catalogue, collection, product, search, editorial pages
  |-- Client components: cart provider, cart drawer, quick add, gallery, checkout form
  |-- Route handlers (Node runtime)
        |-- POST /api/checkout  -> Supabase create_order (when configured)
        |-- GET  /api/stock     -> Supabase inventory (falls back to seed stock)
        |-- POST /api/cloudinary/sign (when Cloudinary is configured)

Content plane                         Commerce plane
  Sanity (published products,           Supabase (inventory, customers,
  collections)                          orders, stock movements)
  or src/data seed catalogue
                                        Payment provider: not implemented
Media plane
  Cloudinary URLs, or committed local
  product renders under /public/products
```

## Runtime boundaries

### Server components

Pages read data through `getCatalog()` in `src/lib/content.ts`. It is wrapped in React `cache`, so a single request maps the catalogue once even when several page sections use it.

- When Sanity is configured, published products and collections are fetched with the CDN client.
- When Sanity is absent, returns no published products, or fails, the local seed catalogue is used unchanged.
- The fallback never blocks a page or throws into the UI. A warning is logged server-side.

`src/data/products.ts` and `src/data/collections.ts` are therefore both the seeded build and the reference shape expected from Sanity.

### Client components

The bag is local-first. `src/components/cart-provider.tsx` owns the state and persists `{ variantId, productSlug, quantity }[]` under `cloud.cart.v1`. It resolves variant details against the local catalogue, enforces a maximum of 10 per line, and never mutates a price.

The header, cart drawer, product controls, gallery, filters, and checkout form are client components. Server pages pass only serialisable catalog data into them.

### Route handlers

All privileged operations run on the server:

- `POST /api/checkout` validates the payload and rebuilds every line total from the catalogue. It does not trust client prices, names, or stock.
- `GET /api/stock?variantIds=...` reads current availability from Supabase. If the admin client is unavailable it returns seed stock and labels the response `source: "seed"`.
- `POST /api/cloudinary/sign` signs Studio uploads with a shared upload token and the Cloudinary secret.

The service-role Supabase client is created only in route handlers. It is never imported by a client component.

## Routes

| Route | Rendering | Purpose |
| --- | --- | --- |
| `/` | Static, revalidated | Editorial homepage, category grid, new-in, Cloud Home edit, Cloud Wear, import story |
| `/collections/[slug]` | Dynamic | Filtered and sorted catalogue; `lighting`, `power`, `kitchen`, `wear`, `all` |
| `/products/[slug]` | SSG per seed product | Product details, variant picker, specification table, related products |
| `/search` | Dynamic | Local catalogue search with query parameters |
| `/cart` | Static shell | Local bag, quantities, delivery estimate, checkout link |
| `/checkout` | Static shell | Nigerian delivery form and order review |
| `/how-it-works` | Static | Sourcing, delivery, returns, warranty, honest-commerce commitments |
| `/credits` | Static | Product illustration and typeface credits |
| `/studio` | Static status board | Reads the process environment and reports integration readiness |
| `/api/checkout` | Node route handler | Server-side validation and order boundary |
| `/api/stock` | Node route handler | Current stock adapter |
| `/api/cloudinary/sign` | Node route handler | Signed Cloudinary uploads |

`/studio` is not the Sanity Studio. The editable Studio is the separate package in `studio/` and runs on port 3333.

## Catalogue model

A product has one collection, one or more variants, images, editorial copy, specifications, filter facets, and merchandising flags.

```ts
Product {
  id, slug, name, brand, collection,
  summary, description[], highlights[], specs[],
  images[], variants[], filters,
  featured, newArrival, bestseller, releasedAt
}

Variant {
  id, sku, options: Record<string, string>, price /* kobo */, stock
}
```

Variant IDs are stable commerce keys in the form `product-slug--option-slug`. SKUs are uppercase and unique across the catalogue. Supabase inventory is keyed by the same variant ID. Do not change either after an order exists.

Current catalogue: 12 products and 27 variants across four collections.

## Money and delivery

- All amounts are integers in kobo. There are no floating-point prices.
- `src/lib/format.ts` is the only display formatter. It uses `en-NG` and displays the narrow Naira symbol.
- `src/lib/shipping.ts` is the shared delivery rule: free at ₦150,000, otherwise ₦4,500.
- The checkout validator recalculates subtotal and delivery on the server before calling Postgres.
- Checkout accepts Nigerian delivery addresses only. This is enforced in the client for helpful errors and again in the route handler.

## Styling and brand

Brand tokens and the small type scale live in `src/app/globals.css`.

- Canvas `#f6f3eb`, paper `#fffdf8`, ink `#101214`.
- Cobalt `#1f3bff` is the single accent.
- Colour blocks: sky `#dbe7f6`, butter `#f0e3b5`, clay `#f0dbcd`, sage `#dde6d6`.
- Instrument Serif for display and editorial statements; DM Sans for commerce and controls.
- Sentence case, no uppercase micro-labels, no gradients, no glass surfaces, no invented social proof.

The design direction is a warm department store rather than a boutique electronics brand. Large serif statements, strong category blocks, and plain-spoken product copy carry the identity.

## Failure modes

| Missing or failed service | Storefront behaviour |
| --- | --- |
| Sanity absent or request fails | Seed catalogue; no broken page |
| Supabase absent | Seed stock; checkout disabled |
| Payment absent | Checkout button disabled; API returns 501 |
| Cloudinary absent | Local `/products/*.png` images; uploaded media falls back to local paths |
| Unknown product slug | `notFound()` and the custom 404 page |
| Unknown or unavailable variant | Validation error; no order and no payment |

## Files worth knowing

| Path | Responsibility |
| --- | --- |
| `src/app/page.tsx` | Homepage composition and editorial merchandising |
| `src/data/products.ts` | Seed catalogue, prices, stock, facets, copy |
| `src/data/collections.ts` | Collections, tones, images, descriptions |
| `src/data/site.ts` | Placeholder legal and contact details |
| `src/lib/content.ts` | Sanity adapter, seed fallback, image mapping |
| `src/lib/catalog.ts` | Filtering, sorting, facets, related products |
| `src/lib/checkout.ts` | Server-side order validation and totals |
| `src/lib/shipping.ts` | Shared Naira delivery rule |
| `src/components/cart-provider.tsx` | Local bag state and persistence |
| `src/components/checkout-form.tsx` | Checkout UI and honest unconfigured state |
| `src/app/globals.css` | Brand tokens, type scale, controls, motion |
| `supabase/migrations/` | Commerce schema and `create_order` |
| `studio/` | Sanity Studio schemas and structure |
| `tools/` | Seed check, browser smoke test, screenshots, product render pipeline |

## Current boundaries

- Sanity owns products and collections only. Homepage composition, navigation, and footer content are code-driven in this build even though schemas exist for them.
- The header navigation reads the seed collection list, not Sanity.
- Payment capture is not implemented. The order boundary is real; the charge is not.
- The Supabase SQL has not been executed in this environment. It needs a real Postgres instance or the Supabase CLI before launch.

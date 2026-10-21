# Architecture

KELVIN separates three planes so that a failure in one does not take down the storefront.

```
┌──────────────────────────────┐
│ Next.js storefront           │
│  RSC pages · client cart     │
│  API routes (Node runtime)   │
└──────┬───────────┬───────────┘
       │           │
       │ read      │ read/write (server only)
       ▼           ▼
┌────────────┐  ┌────────────────┐
│  Sanity    │  │    Supabase    │
│  content   │  │ inventory      │
│  (CDN)     │  │ orders · carts │
└────────────┘  └────────────────┘
       │
       │ public IDs
       ▼
┌────────────────────────────┐
│ Cloudinary — media delivery │
│ signed uploads from Studio  │
└────────────────────────────┘
```

- **Sanity owns content:** products, collections, homepage composition, navigation, promotions, pages, brand settings and SEO defaults.
- **Supabase owns commerce state:** inventory, stock movements, customers, addresses, carts, orders and order lines.
- **Cloudinary owns media:** the source image lives there; Sanity stores a public ID, not a binary.
- **The seed catalog** in `src/data/` is a complete local copy of the demo content. It is the fallback and the thing you see without credentials.

## Request paths

### Home, collection, product, search

1. The server component calls `getCatalog()` in `src/lib/content.ts`.
2. If Sanity is unconfigured, it returns the seed immediately — no network request.
3. If configured, it runs the product and collection GROQ queries in parallel, maps documents to the shared `Product` / `Collection` types, and returns `source: "sanity"`.
4. If the query fails or returns no published products, it logs one warning and returns the seed.
5. Collection filtering, faceting, sorting and pagination happen in memory in `src/lib/catalog.ts`. With a catalog this size that is faster and simpler than round-tripping a search service.
6. Pages revalidate every 300 seconds; product pages are generated at build time from the seed slugs and revalidated.

`getCatalog()` is wrapped in React `cache`, so a page that calls it in both `generateMetadata` and the component reads once per request.

### Cart

`src/components/cart-provider.tsx` is a client context.

- Stored in `localStorage` under `kelvin.cart.v1` as `{ variantId, productSlug, quantity }[]`.
- On hydration, unknown variants are dropped and quantities clamped to 1–10 and to seed stock.
- Product name, options and price are resolved from the catalog at render time — the stored cart never freezes a price.
- The drawer traps the page scroll, closes on Escape, and restores focus to the trigger.
- Guest-only. Supabase cart tables and RLS exist for signed-in carts, but no auth UI is shipped.

### Stock API

`GET /api/stock?variantIds=a,b,c`

- Uses the service-role client when Supabase is configured, computes `on_hand - reserved - safety_stock`, and labels the response `source: "supabase"`.
- Otherwise returns seed stock labelled `source: "seed"`.
- Always `cache-control: no-store`.
- The cart currently does not call this on every render; it is the hook for live availability when the catalog moves into Supabase.

### Checkout

`POST /api/checkout` → [CHECKOUT.md](CHECKOUT.md).

### Uploads

`POST /api/cloudinary/sign` → [CONTENT-MODEL.md](CONTENT-MODEL.md#cloudinary).

## Trust boundaries

| Boundary | Rule |
| --- | --- |
| Browser → content | Sanity is queried server-side with the public dataset by default. The read token stays on the server. |
| Browser → orders | Prices, names and stock are recomputed from the catalog in the route. The client sends only `variantId` + `quantity`, customer and address. |
| Browser → Supabase | Anon key only. RLS permits reading inventory and the caller's own records. There is no insert/update policy on orders or order items. |
| Route → Supabase | Service-role key, server only. `create_order` is revoked from `anon` and `authenticated`. |
| Studio → Cloudinary | The shared upload token authorises signing only. The API secret never leaves the route. Uploads are folder-scoped. |
| Client → prices | Never trusted. `validateOrder` recomputes every line from the server catalog. |

No secret is referenced from a `NEXT_PUBLIC_` variable except the Supabase URL/anon key, the Sanity project ID/dataset and the Cloudinary cloud name, all of which are public by design.

## Data contracts

The most important contract is the **variant ID**: `product-slug--option`.

- Sanity stores it on the variant object.
- `src/data/products.ts` mirrors it.
- `supabase/seed.sql` inserts inventory keyed by it.
- `order_items.variant_id` records it permanently.
- The cart and checkout validator look it up by it.

Renaming a published variant ID breaks the stock link. Add a new variant and archive the old one instead.

Prices are integers in minor units everywhere: catalog, cart, checkout validation, SQL, emails. There is no float currency arithmetic.

## Caching and performance

- Product images are local transparent 1200 × 1200 PNG cutouts served through `next/image`, which emits responsive `srcset`s and AVIF/WebP.
- Cloudinary URLs request `f_auto,q_auto,w_1400`; the Studio preview requests a 640 px variant.
- The homepage and collection/product pages carry `revalidate = 300`.
- The header and cart badge are client components; everything else is a server component.
- Fonts are loaded through `geist/font`, self-hosted by Next.
- No third-party analytics, chat widgets or font CDNs are loaded.

## Failure behaviour

| Failure | Result |
| --- | --- |
| Sanity unset / empty / down | Seed catalog, one server warning, no broken layout |
| Supabase unset | Checkout 501 with missing variables; stock falls back to seed |
| Supabase down during order | 500, no order number, no payment taken |
| Cloudinary unset | Sign endpoint 501; existing local images still render |
| Client offline during checkout | Catch shows a connection error; nothing is cleared |
| `localStorage` blocked | Cart works in memory for the session |

## Deliberate omissions

- No auth UI, account pages or order lookup.
- No payment adapter or webhook.
- No transactional email.
- No search index; search is an in-memory scan.
- No CMS webhook to trigger revalidation — the 300-second ISR window covers it for now.
- No navigation/promotion rendering from Sanity yet; the schemas are ready.

These are boundaries, not hidden stubs. Nothing in the UI claims they exist.

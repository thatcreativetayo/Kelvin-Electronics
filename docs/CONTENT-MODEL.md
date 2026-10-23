# Content model

Cloud content has two layers:

1. **The seed catalogue** in `src/data/products.ts` and `src/data/collections.ts`. It is the reliable fallback and the reference shape for the site.
2. **Sanity**, in `studio/`. When configured, published products and collections replace the seed catalogue.

The storefront currently reads **products and collections** from Sanity. Other schemas in the Studio are prepared for a later content pass and are not read by the storefront yet. That distinction matters: editing an unwired document will not change the live site.

## What is live

| Schema | Read by storefront | Purpose |
| --- | --- | --- |
| `product` | Yes, when `status == "published"` | Catalogue details, variants, media, filters, SEO |
| `collection` | Yes | Lighting, Power, Kitchen, Wear; tone and order |
| `homepage` | No | Prepared homepage section stack |
| `navigation` | No | Prepared announcement, header, footer links |
| `settings` | No | Prepared brand and contact settings |
| `promotion` | No | Prepared campaign records |
| `page` | No | Prepared standalone pages |
| `seoDefaults` | No | Prepared global SEO defaults |

The header, footer, homepage composition, delivery copy, and legal copy are code-driven in this build. Product and collection pages use Sanity when it is available.

## Product

A product belongs to exactly one collection.

| Field | Rules |
| --- | --- |
| `name` | Required, max 70 characters, sentence case |
| `slug` | Required, generated from the name, max 80 |
| `brand` | Required, max 40; `Cloud Home` or `Cloud Wear` in the current catalogue |
| `collection` | Required reference to a collection |
| `status` | `draft`, `published`, or `archived`; only published products reach the storefront |
| `summary` | Required, max 180; one sentence for cards and search |
| `releasedAt` | Required; controls “new in” ordering |
| `flags` | `featured`, `newArrival`, `bestseller` |
| `images` | One to six Cloudinary images; alt text required |
| `variants` | One or more variants; IDs unique within the product |
| `filters` | Controlled `type`, `room`, and `fit` facets |
| `highlights` | 2–6 factual lines |
| `description` | One to four paragraphs |
| `specs` | 3–14 label/value rows for electronics |
| `seo` | Optional title, description, social image, no-index |

Product copy is plain-spoken and factual. No invented reviews, scarcity, countdowns, or “best ever” claims.

### Variants

```text
id:      product-slug--option-slug   (e.g. halo-smart-bulb--single)
sku:     CLD-HALO-1
options: { pack: "Single" }
price:   1850000                     (kobo)
stock:   24                          (seed stock only)
```

Rules:

- The ID is permanent once orders or inventory exist.
- SKUs are uppercase, unique, and max 32 characters.
- Prices are integers in kobo. ₦18,500 is `1850000`.
- `stock` seeds `inventory_items`. After launch, Supabase is the live stock source.
- The storefront displays the variant option values, not internal names.

The current catalogue has 27 variants across 12 products. `pnpm seed:check` compares every variant ID, SKU, and seed stock value against `supabase/seed.sql`.

### Filters

Filters come from controlled lists in the Studio:

- **Type:** Bulb, Floor lamp, Light strip, Smart plug, Extension, Power cube, Kettle, Air fryer, Blender, T-shirt, Hoodie, Tote.
- **Room:** Every room, Living room, Bedroom, Home office, Kitchen.
- **Fit:** Relaxed, Boxy, One size.

Use the exact spelling. A new spelling creates a new, near-empty facet. Filtering runs over the catalogue on the collection page.

### Imagery

- Upload through the Cloudinary image field.
- Each image has a public ID or fallback URL, alt text, and optional dimensions.
- If a product has no usable image, the adapter falls back to `/products/{slug}.png`.
- The current 12 products have original Cloud renders under `public/products/`. They are illustrated brand objects, not photographs of the exact shipping units.
- Product renders are regenerated with `pnpm products:build`. The SVG source and PNG render are both committed.

## Collection

| Field | Rules |
| --- | --- |
| `name` | Required, max 40 |
| `slug` | Required; current values are `lighting`, `power`, `kitchen`, `wear` |
| `eyebrow` | Optional, e.g. `01 / Lighting` |
| `tagline` | Required, max 60 |
| `description` | Required, max 240 |
| `image` | Required Cloudinary image or fallback |
| `tone` | Sky, Butter, Clay, or Sage |
| `position` | Integer; sorts collections for the homepage grid |
| `showInNavigation` | Prepared for a future navigation adapter; not read today |

The storefront also supports the virtual `/collections/all` route, which is not a Sanity document.

## Path from content to storefront

```text
Sanity dataset
  productQuery       -> published products, newest release first
  collectionQuery    -> collections, position ascending
        |
        v
src/lib/content.ts maps documents into the Product / Collection types
        |
        +-- if Sanity is missing, empty, or fails -> src/data seed
        |
        v
server pages -> catalogue helpers -> client controls
```

Mappings to watch:

- Sanity variant options are `{ name, value }[]`; the storefront expects `Record<string, string>`.
- Sanity prices and stock are numbers; the adapter rounds them and clamps stock at zero.
- A missing collection slug or product variant drops that document rather than rendering a broken page.
- Sanity images use `imageUrl(publicId, fallbackUrl)`.

## Editorial workflow

1. Create or confirm the collection, position, tone, and image.
2. Create the product and fill the summary, release date, and collection reference.
3. Add one to six images with useful alt text.
4. Add variants with permanent IDs, SKUs, kobo prices, and seed stock.
5. Choose filter facets from the controlled lists.
6. Add 2–6 highlights, 1–4 paragraphs, and at least three specs for electronics.
7. Preview the product page; check the price, option labels, and image on mobile.
8. Set `status` to `published` only when photography, copy, price, and stock are correct.
9. Mirror new variants into Supabase inventory before publishing. Use the seed as the initial stock, then let Supabase own it.

## Copy rules

- Sentence case. No decorative uppercase micro-labels.
- Write like a careful retailer: specific, useful, calm.
- Naira prices and inclusive customs language.
- State what is not included. No invented reviews, ratings, badges, or urgency.
- Use “bag” for the customer's cart in the storefront UI.
- Keep product names descriptive rather than model-number soup.

## SEO

`src/app/layout.tsx` sets the default title, description, Open Graph image, and theme colour. Product and collection pages add their own metadata. Published Sanity documents have an optional SEO object; the current code uses the document name/summary and does not yet read per-document SEO fields.

## Connecting the Studio

See the root README and `studio/.env.example`.

```bash
cd studio
pnpm install
pnpm dev
```

The Studio runs on http://localhost:3333. Add `http://localhost:3000` and the production origin to the Sanity project's CORS origins. Storefront variables:

```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2025-01-01
```

A read token is only needed for a private dataset. Never put a write token in the storefront.

## Fallback behaviour

- Sanity not configured: seed catalogue.
- Sanity returns zero published products: seed catalogue and a server warning.
- Sanity request fails: seed catalogue and a server warning.
- A product has no variants: it is dropped by the adapter.
- An image is missing: the adapter falls back to the local product render.
- A collection is missing: seed collections fill the navigation and homepage grid.

The fallback is a feature, not an error state. It keeps the storefront usable while content operations are being set up.

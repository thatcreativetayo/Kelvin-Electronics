# Content model

The Studio schema is the editorial contract. This document explains what each type is for and the rules an editor cannot see in the UI.

The storefront adapts Sanity documents into the same types as `src/data/`; the adapter lives in `src/lib/content.ts`.

## Documents

### `product`

| Field | Rule |
| --- | --- |
| `name` | Required, ≤ 70 characters. |
| `slug` | Required, generated from the name. The storefront URL is `/products/{slug}`. |
| `brand` | Required, ≤ 40. |
| `collection` | Required reference to one department. |
| `status` | `published` / `draft` / `archived`. Only `published` is read by the storefront. |
| `summary` | Required, ≤ 180. Used on cards, search and the PDP lead. |
| `releasedAt` | Required date. Drives “newest” sort. |
| `flags.featured` | Shows in the featured sort and the shortlist candidates. |
| `flags.newArrival` | Shows under “New this week”. |
| `flags.bestseller` | Additional merchandising flag. |
| `images` | 1–6 Cloudinary images. Each has required alt text. |
| `variants` | At least one. Unique IDs. |
| `filters.type` | Required controlled value. |
| `filters.connectivity` | Optional `Wireless` / `Wired`. |
| `highlights` | 2–6 short factual lines. |
| `description` | 1–4 paragraphs, each a text block. |
| `specs` | 3–14 label/value rows. |
| `seo` | Optional override of title, description and share image. |

### `collection`

The five departments: Audio, Computing, Mobile, Imaging, Gaming.

- `slug` is the route segment and the value stored on `product.collection`.
- `eyebrow` follows `NN / Name` (`01 / Audio`). The homepage shows the number.
- `position` controls navigation and rail order; 1–5.
- `showInNavigation` hides a department from the header without deleting it.
- `image` is the department plate. It must be a Cloudinary image.
- `description` is the collection-page lead.

Do not create a sixth department without also extending the seed and the product filter vocabulary.

### `homepage` (singleton)

`sections[]` is an ordered stack of:

- **Hero** — eyebrow, headline, supporting copy, optional product reference, CTA label/href.
- **Product rail** — title, optional eyebrow, product references, “view all” link.
- **Editorial** — image, caption, headline, body, optional link.
- **Service strip** — two to four icon/label/body items.

The storefront renders sections in order and skips empty ones. The current storefront homepage is hand-built from the seed and does **not** yet consume this document — the schema is ready for the next pass.

### `navigation` (singleton)

Announcement bar, header links, footer columns, contact details and legal line. The present header/footer are seed-built; this document is not read yet.

### `promotion`

Scheduled announcement or homepage banner. `startsAt` / `endsAt` are validated so the end is after the start. `active` is a manual switch on top of the schedule. Not rendered yet.

### `page`

Editorial pages with portable text (headings, paragraphs, quote, strong/emphasis, links, images), slug, intro, publish date and SEO. Not rendered by a catch-all route yet.

### `settings` (singleton)

Brand name, tagline, description, currency, contact details, social links and delivery/returns/warranty policy copy. Not read by the storefront yet.

### `seoDefaults` (singleton)

Default title, `%s` title template, default description, share image, Twitter handle and organisation name. The storefront currently uses metadata in `src/app/layout.tsx`; wiring this document is part of the CMS pass.

## Objects

### `cloudinaryImage`

```ts
{
  publicId: string;   // Cloudinary public ID, required
  alt: string;        // required, describes the image for screen readers
  width?: number;     // intrinsic width, default 1400
  height?: number;    // intrinsic height, default 1400
  fallbackUrl?: string;
}
```

The custom input uploads through `/api/cloudinary/sign`. Images are delivered as `f_auto,q_auto,w_1400`.

### `variant`

```ts
{
  id: string;       // product-slug--option, permanent
  sku: string;      // unique
  options: { name: string; value: string }[];
  price: number;    // integer minor units
  stock: number;    // seed hint only; Supabase is authoritative
}
```

The `id` is written into Supabase inventory and order lines. Examples:

- `airpods-max--silver`
- `macbook-air--16-512`
- `iphone-15-pro--256-blue`

`options` is displayed on the PDP and in the cart (`Silver`, `16 GB / 512 GB`). Option names should be human-readable and stable.

### `spec`

`{ label, value }`. Labels are sentence case (`Battery life`, not `BATTERY LIFE`). Keep the same label for the same measurement across a department.

### `seo`

`title`, `description`, `image` (Cloudinary). Max title 60, description 160. The layout template appends ` · KELVIN` unless the title already contains the brand.

### `link`

`label`, `href` (relative or http/https/mailto), `external` boolean. External links open in a new tab with `rel="noreferrer"`.

## Filter vocabulary

The collection sidebar is generated from the products in that collection, so any value becomes a facet. Use the controlled list:

| `type` | Used by |
| --- | --- |
| `Over-ear` | AirPods Max |
| `In-ear` | AirPods Pro |
| `Smart speaker` | HomePod mini |
| `Laptop` | MacBook Air |
| `Keyboard` | Magic Keyboard |
| `Mouse` | MX Master 3S |
| `Phone` | iPhone 15 Pro |
| `Tablet` | iPad Pro |
| `E-reader` | Kindle Paperwhite |
| `Mirrorless` | Sony α7R IV, Fujifilm X-T5 |
| `Console` | Switch OLED |
| `Handheld` | Steam Deck |
| `Controller` | DualSense |

`connectivity` is `Wireless` or `Wired`, and is only set for audio in the seed. Adding it elsewhere is allowed; it simply creates a new facet for that department.

Spelling matters: `Over-ear` and `Over-Ear` would become two facets.

## Photography

- Source: one product, centred on a transparent 1200 × 1200 canvas (Cloudinary originals may be larger; delivery is capped at 1400 px wide).
- The storefront places the cutout directly on the bone canvas. Do not bake in drop shadows, lifestyle backgrounds or white plates; keep the product edge clean and the frame transparent.
- Alt text describes the product and angle, not the marketing (“AirPods Max in silver, three-quarter view”).
- Keep the product filling roughly 80% of the frame. The collection and PDP plates add their own padding.
- Upload originals through the image field; do not paste external URLs. Cloudinary handles format and quality at delivery.

## Editorial workflow

1. Create or confirm the **collection** first. Set position and eyebrow.
2. Create the **product** as a draft. Add name, brand, collection, summary, release date.
3. Upload photographs, write alt text.
4. Add variants. Copy the ID format exactly. Prices are integers in cents.
5. Add 3+ specs, 2–4 paragraphs, 2–6 highlights.
6. Set `filters.type` from the controlled list.
7. Add the matching row to Supabase inventory (see `supabase/seed.sql` for the shape) before publishing.
8. Set `status` to `published` and publish.
9. Spot-check `/collections/{slug}` and `/products/{slug}` on the storefront.

## Publishing checklist

- One image minimum, alt text on every image.
- One variant minimum, unique IDs, integer prices.
- Stock row exists in Supabase for every variant.
- Filter values copied from the controlled list.
- Three or more specs.
- Summary is one sentence, not a paragraph.
- Status is `published` and the document itself is published (not just saved).
- Revalidation takes up to five minutes on the storefront.

## Cloudinary

The Studio image field:

1. Sends `POST /api/cloudinary/sign` with `x-upload-token`.
2. Receives `{ cloudName, apiKey, timestamp, signature, folder }`.
3. Uploads the file to `https://api.cloudinary.com/v1_1/{cloudName}/image/upload`.
4. Stores the returned `public_id`.

The token is configured in the field's **Upload settings** and kept in `localStorage`. The API secret never reaches the browser. Rotate `CLOUDINARY_UPLOAD_TOKEN` if an operator with the token leaves.

For production, replace the shared token with a serverless endpoint that verifies the editor's Sanity session, and restrict the Cloudinary upload preset to the product folder.

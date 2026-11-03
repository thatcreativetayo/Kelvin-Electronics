# Brand and interface notes

## The idea

**Cloud is a trusted Nigerian importer, not a marketplace.** We choose a short edit of useful electronics, home goods and everyday wear, clear customs, and deliver across Nigeria at a Naira price that already includes the import.

The line is:

> **The good stuff, brought home.**

Supporting line:

> **Sourced abroad. Delivered across Nigeria.**

The storefront should feel like a quiet, well-run specialist shop: confident assortment, generous space, clear product photography, and plain service. Premium, not precious. Useful, not theatrical.

Cloud Home currently leads with lighting, power and kitchen. Cloud Wear is the first clothing capsule. Collections are data-driven, so later categories such as food can be added without a category-specific layout or a new accent colour.

## What trust looks like here

Trust is built through specifics, not badges:

- Naira prices with customs and duties included.
- Stock states that reflect inventory rather than theatre.
- Delivery windows, returns and the one-year electronics warranty stated plainly.
- A checkout that says when it is not connected instead of pretending a payment succeeded.
- No invented reviews, ratings, press logos, discounts, countdowns or "only X left" pressure.
- Contact details and WhatsApp support that are easy to find.

Product photography is licensed stock, cut out and colour-corrected for this storefront. It is illustrative: finish and small details on the unit that ships may differ. The source list lives on `/credits`.

## Wordmark and brand assets

- `public/brand/logo.svg` is the orange Cloud wordmark, including the fluffy cloud mark. Use it on light surfaces.
- `public/logo.svg` is the editable source for the wordmark.
- `public/brand/logo-mark.png` is the transparent cloud mark used by the loading state.
- `public/brand/favicon-32.png`, `icon-192.png`, `icon-512.png` and `apple-touch-icon.png` are the app icons.
- `public/brand/og.png` is the 1200 × 630 share image.
- Keep clear space around the wordmark of at least the height of the mark. Do not redraw, stretch, outline or recolour it.
- On dark surfaces use the wordmark as supplied, or the cloud mark in paper/white.

## Palette

Every colour token lives in `src/app/globals.css`. Do not hardcode colours in components.

| Token | Hex | Use |
| --- | --- | --- |
| `--primary` | `#DC7B26` | Primary actions and the single brand accent |
| `--primary-hover` | `#C26A1B` | Primary hover and pressed state |
| `--primary-text` | `#B8601A` | Orange text that needs stronger contrast on light surfaces |
| `--bg` | `#F5F8FC` | Page ground and quiet product stages |
| `--surface` | `#FFFFFF` | Cards, fields, header and panels |
| `--ink` | `#14110D` | Primary text, dark promise band |
| `--muted` | `#6B7280` | Secondary copy, labels, metadata |
| `--border` | `#E3E8EF` | Hairline borders, dividers, disabled controls |
| `--success` | `#16A34A` | In-stock dots and confirmation marks |
| `--error` | `#DC2626` | Validation errors and destructive actions |

Rules:

- Orange is the only brand accent. Do not introduce category colours or a second bright colour.
- Most of the page is off-white, white and ink. Orange is for actions and small moments of emphasis, not large decorative fields.
- Primary buttons use ink text on orange, not white. The pair is deliberately high contrast (about 6.2:1); do not switch it back to white.
- The focus ring uses the darker `--primary-text` orange so it remains visible on the off-white ground.
- Cards use a white surface, a 1px border, `rounded-2xl`, and the soft shadow token. Avoid floating cards and heavy drop shadows.
- The header becomes translucent white with a backdrop blur only after scrolling. Do not use blur elsewhere.
- No gradients on surfaces. The pale circular product stage is a flat `--bg` fill.

## Typography

**Poppins only**, self-hosted from `src/app/fonts/` through `next/font/local`:

- **600** — headings and product names at display sizes.
- **500** — buttons, navigation, labels and UI.
- **400** — body copy and supporting text.

Rules:

- Set prices, counts, stock and totals in tabular numerals.
- Use sentence case. Uppercase micro-labels are allowed only as short eyebrows with generous tracking.
- Keep paragraphs short. Do not set long copy in a display size.
- Use the narrow Naira symbol (`₦`) from the font. The formatter in `src/lib/format.ts` is the only way to render prices.
- The type roles are defined in `globals.css`: `type-hero`, `type-h1`, `type-h2`, `type-h3`, `type-lead`, `type-body`, `type-small`, `type-micro`, and `type-eyebrow`.
- Self-hosted files and `display: swap` keep the layout stable. Do not add a second typeface.

## Layout

- Maximum shell width is `1320px`; gutters are `20px` on mobile, `32px` at `md`, and `48px` at `xl`.
- The header is `64px` tall on mobile and `72px` from `md`, sticky, and blurred on scroll.
- Off-white page; white cards; generous whitespace. Rounded corners are restrained (largely `rounded-2xl` and `rounded-xl`).
- The homepage runs: split hero with a manual product carousel, exact trust strip, data-driven category rail, New In rail, single product spotlight, full-bleed ink promise band, help band, footer.
- Mobile category and product rails are horizontal snap rails. They are not squeezed two-column grids.
- The collection grid uses two columns on mobile and expands to four on large screens. Filters are a sidebar on desktop and a sheet on mobile.
- Product pages pair one large circular stage with a sticky purchase panel on desktop; the panel follows the content on mobile.
- Buttons are 48px high; compact controls are 38px. Focus rings are visible on every interactive element.

## Product presentation

- All products use the same treatment: a large, background-removed cut-out on a pale circular stage over the off-white page.
- Do not design per category. Lighting, power, kitchen, wear and any future collection use the same stage, card and typography rules.
- Keep the product large and centred with breathing room. Do not add props, lifestyle scenes or a different background colour per collection.
- Product cards show image, brand, name, Naira price, an Add control and a WhatsApp order action. The WhatsApp control is icon-only on cards and labelled on the product page.
- Use descriptive alt text. Never use the product name alone as the alt if it does not describe the image.

## Motion

- 150–200ms for state changes, hovers and controls.
- Use `var(--ease-ui)` and ease-out curves. No bounce.
- The drawer and filter sheet may use 180–220ms entrance animations.
- Respect `prefers-reduced-motion`. No autoplay carousels, parallax, animated counters or attention-seeking loops.
- The hero carousel is manual: arrows, dots, and product links only.

## Accessibility

- Contrast is checked for ink, muted and orange text on their intended surfaces.
- Every interactive element has a visible focus ring. Do not remove focus styles without replacing them.
- Images have useful alt text; decorative cloud shapes have empty alt text.
- State is not carried by colour alone. Stock, errors and selected options also use text or shape.
- Touch targets are generous; primary actions are 48px high. Compact card actions remain at least 38px with a wide hit area.
- `prefers-reduced-motion` disables non-essential animation.

## Voice

Write like a person who has used the thing and is telling you the useful part.

**Do**

- Lead with the everyday problem.
- Give the one detail that changes the decision.
- Use short sentences and concrete nouns.
- Say "catalogue", "bag", "customs" and "delivery" plainly.

**Don't**

- Use "revolutionary", "seamless", "elevate", "curated" as filler, or emojis.
- Invent urgency, scarcity, reviews or social proof.
- Use uppercase shouting or exclamation marks.
- Describe a product as the exact shipping unit when the image is illustrative.

## Avoid

- Category-specific pastel blocks or a different visual system per collection.
- Generic marketplace density, badge walls, gradients, glass panels outside the scrolled header, or neon.
- Floating cards on every surface, oversized shadows, or rounded pills everywhere.
- A second sans-serif or a decorative serif.

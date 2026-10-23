# Brand and interface notes

## The idea

**Cloud is a trusted importer, not a boutique.** We choose useful home electronics abroad, clear them through customs, and deliver them across Nigeria at a Naira price that already includes the import.

The line is:

> **The good stuff, brought home.**

Supporting line:

> **Sourced abroad. Delivered across Nigeria.**

The role model is a large, well-run department store: confident assortment, clear departments, useful service, and plain prices. The storefront should feel warm and edited, but never fragile, exclusive, or tech-bro.

Cloud Home leads with lighting, power, and kitchen. Cloud Wear is the first clothing capsule. The brand should be able to grow into more home and apparel categories without changing its voice.

## What trust looks like here

Trust is built through specifics, not badges:

- Naira prices with customs and duties included.
- Stock states that reflect inventory rather than theatre.
- Delivery windows, returns, and the one-year electronics warranty stated plainly.
- A checkout that says when it is not connected instead of pretending a payment succeeded.
- No invented reviews, ratings, press logos, discounts, countdowns, or “only X left” pressure.
- Contact details that are easy to find.

The product images in this build are original Cloud illustrations. They should not be described as photographs of the exact shipping unit.

## Wordmark

- Lowercase **cloud** plus a cobalt full stop: `cloud.`
- Set in the display serif at normal weight.
- The dot is a brand mark, not punctuation in a sentence; keep it in the same cobalt as the accent.
- Do not uppercase, letterspace, outline, or add a cloud icon.
- Give the mark clear space roughly equal to the dot's diameter.
- On dark grounds, use paper for the letters and a light blue or paper dot.

## Palette

All tokens live in `src/app/globals.css`.

| Token | Hex | Use |
| --- | --- | --- |
| `canvas` | `#f6f3eb` | Page ground; warm, paper-like |
| `paper` | `#fffdf8` | Cards, summary panels, form surfaces |
| `ink` | `#101214` | Primary text and dark sections |
| `ink-2` | `#3d4147` | Body copy |
| `muted` | `#6e7176` | Secondary labels and metadata |
| `line` | `#ded8cc` | Hairline borders on canvas |
| `line-strong` | `#c4bdb0` | Emphasised borders and controls |
| `accent` (cobalt) | `#1f3bff` | Primary actions, links, one dot, focus |
| `accent-soft` | `#e9edff` | Quiet accent washes |
| `success` | `#286447` | In-stock and confirmation text |
| `sky` | `#dbe7f6` | Lighting, cool product stages |
| `butter` | `#f0e3b5` | Kitchen and warm product stages |
| `clay` | `#f0dbcd` | Power and warmer editorial blocks |
| `sage` | `#dde6d6` | Wear and calm editorial blocks |

Rules:

- Cobalt is the only saturated accent. Do not introduce a second bright brand colour.
- Use flat colour blocks. No gradients, no mesh backgrounds, no glow.
- Border radius is restrained: small controls, medium panels, large category blocks. Avoid pill-shaped everything.
- Shadows are for depth on overlays only (cart drawer), not for making every card float.
- Never use glassmorphism, translucent blur panels, or backdrop filters.

## Typography

Two self-hosted families:

- **Instrument Serif** — display, hierarchy, and editorial statements. Regular and italic.
- **DM Sans** — product data, body copy, controls, navigation, and forms. Variable weight.

Rules:

- Sentence case everywhere. No decorative uppercase micro-labels.
- Use italic serif for a warm editorial aside, not for every heading.
- Display headings can be large and tightly set; body copy stays calm and readable.
- Use tabular numerals for prices, counts, stock, and order totals.
- Do not use letterspaced all-caps for “new”, “category”, or “shop now”.
- Do not set long paragraphs in the serif.

Type roles are class-based in `globals.css`: `type-display`, `type-h1`, `type-h2`, `type-h3`, `type-lead`, `type-body`, `type-small`, `type-micro`, and `type-eyebrow`.

## Layout

- A wide shell with generous margins and a max content width.
- Strong horizontal rules separate departments and editorial sections.
- Homepage category blocks use a deliberate asymmetric grid, not a uniform card wall.
- Product pages pair a large staged image with a narrow, practical purchase column.
- The bag and checkout use paper panels against canvas; summaries are bordered, not floating.
- Mobile layouts stack in reading order. Controls remain at least 44 px tall.
- Sticky elements are limited to the header and contextual summaries. They are opaque.

## Product presentation

- Products sit on flat colour stages taken from the collection tone.
- Keep the object large and centred with breathing room.
- Illustrations are clean, warm, and slightly idealised; they should read as one family.
- Avoid glossy 3D, neon lighting, busy props, or stock-photo lifestyle scenes.
- The same object should not appear in unrelated categories.

## Motion

- Short, functional transitions: 150–300 ms for controls; 500–700 ms for a gentle image scale.
- Ease out; no bounce.
- Respect `prefers-reduced-motion`.
- No parallax, autoplay carousels, animated counters, or attention-seeking loops.

## Voice

Write like a person who has used the thing and is telling you the useful part.

**Do**

- Lead with the everyday problem.
- Give the one detail that changes the decision.
- Name what is included: customs, delivery, warranty, returns.
- Use short sentences and concrete nouns.
- Say “bag”, not “cart”, in customer-facing copy.
- Use Naira and Nigerian delivery language naturally.

**Avoid**

- “Game-changing”, “revolutionary”, “must-have”, “unlock”, “elevate”.
- Luxury scarcity (“limited drop”, “only 3 left”, “selling fast”).
- Fake urgency, fake reviews, fake discounts, or unexplained strikethrough prices.
- Corporate filler (“we are committed to providing exceptional experiences”).
- Emoji, exclamation marks, and slang that will age badly.
- Uppercase labels used as decoration.

### Examples

Good:

- “Warm light, dimmable from your phone. Fits a standard E27 socket.”
- “The price at checkout is the price you pay. Customs and duties are already in it.”
- “Lagos: 1–3 working days. Elsewhere in Nigeria: 2–5.”
- “No card is collected in this build.”

Not Cloud:

- “THE FUTURE OF LIGHTING IS HERE.”
- “Only 2 left — grab yours before it's gone!”
- “Trusted by 10,000+ happy customers.”
- “Seamless, premium, curated experiences for the modern home.”

## Commerce language

- Free delivery threshold: **₦150,000**.
- Standard delivery: **₦4,500**.
- Delivery: Lagos 1–3 working days; nationwide 2–5.
- Returns: 14 days.
- Electronics warranty: one year.
- Checkout accepts Nigerian delivery addresses only.
- Unconfigured checkout: **Payment not connected**. Never “payment successful” unless a verified provider event says so.

## Accessibility

- Body text should meet WCAG AA contrast on canvas and paper.
- Focus is a visible cobalt outline; do not remove it without a replacement.
- Interactive controls have accessible names.
- Colour is not the only signal for stock, errors, or selected options.
- Images have descriptive alt text; decorative marks are hidden from assistive technology.
- Motion respects reduced-motion preferences.
- Keyboard order follows visual order; the cart drawer and mobile menu manage focus and Escape.

## Brand boundaries

The interface can be warm, literary, and spacious. It cannot be:

- A luxury fashion boutique with unreadable type and hidden prices.
- A generic dropshipping store with countdowns and fake reviews.
- A startup dashboard with gradients, glass, and floating metric cards.
- A marketplace that hides who is responsible for the import.

The test for any new section: **does it make the import, the price, or the delivery clearer?** If not, it is probably decoration.

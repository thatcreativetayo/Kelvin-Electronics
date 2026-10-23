# Supabase setup

Supabase owns inventory, customers, carts and orders. Sanity owns published content. The storefront talks to Supabase only from server route handlers, using the service-role key.

All money in the final schema is stored as **integer kobo** and orders default to **NGN**.

## Files

| File | Contents |
| --- | --- |
| `migrations/20261021090000_commerce_core.sql` | Enums, tables, indexes, `updated_at` triggers, auth → customer trigger |
| `migrations/20261021090100_create_order.sql` | First `create_order` and `release_order` functions |
| `migrations/20261021090200_rls.sql` | RLS policies and grants |
| `migrations/20261022120000_cloud_currency.sql` | Renames money columns to `*_kobo`, defaults currency to NGN, replaces `create_order` with the Cloud/Naira version |
| `seed.sql` | 27 inventory rows matching the current catalogue |

The first three migrations retain their original draft names and USD/cents columns. The final migration renames them. Do not edit migrations that have already been applied to a shared database; a fresh local reset applies all four and ends in the correct NGN/kobo shape.

## Apply locally

Requires Docker and the Supabase CLI.

```bash
supabase start
supabase db reset        # runs migrations, then seed.sql
```

Put the printed URL and keys in `.env.local`:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
PAYMENT_PROVIDER_SECRET_KEY=...   # readiness gate only; no adapter yet
```

The service-role key is server-only. Never expose it through a `NEXT_PUBLIC_*` variable.

## Apply to a hosted project

```bash
supabase link --project-ref <project-ref>
supabase db push
```

Then run `seed.sql` once in the SQL editor, or:

```bash
psql "$DATABASE_URL" -f supabase/seed.sql
```

The seed uses `on conflict (variant_id) do nothing`, so re-running it does not reset live stock.

Without the CLI, paste the four migrations into the SQL editor in filename order, then the seed. The auth trigger assumes the normal Supabase `auth` schema exists.

## Verify

```sql
select count(*) from public.inventory_items;                 -- 27

select variant_id, sku, on_hand, reserved, safety_stock,
       (on_hand - reserved - safety_stock) as available
from public.inventory_items
order by variant_id;

select proname
from pg_proc
where proname in ('create_order', 'release_order');

select column_name, data_type, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'orders'
  and column_name in ('currency', 'subtotal_kobo', 'shipping_kobo', 'total_kobo')
order by column_name;
```

Expected: 27 rows, `currency` defaults to `'NGN'`, and the money columns are `subtotal_kobo`, `shipping_kobo`, and `total_kobo`.

### Test a reservation and roll it back

Run this as the database owner in the SQL editor. `create_order` is executable only by `service_role`; the SQL editor owner can still call it.

```sql
begin;

select * from public.create_order(
  'test@example.com',
  'Test Order',
  null,
  '{"line1":"1 Test Street","city":"Lagos","country":"Nigeria"}'::jsonb,
  '[{"variantId":"halo-smart-bulb--single","sku":"CLD-HALO-1","productName":"Halo smart bulb","variantLabel":"Single","unitPrice":1850000,"quantity":1,"lineTotal":1850000}]'::jsonb,
  1850000,  -- ₦18,500 subtotal
  450000,   -- ₦4,500 delivery
  'NGN'
);

select variant_id, on_hand, reserved
from public.inventory_items
where variant_id = 'halo-smart-bulb--single';

select order_number, status, subtotal_kobo, shipping_kobo, total_kobo, currency
from public.orders
order by created_at desc
limit 1;

rollback;
```

Expected: `reserved` increases by 1 inside the transaction, the order number starts with `CLD-`, and the rollback leaves live stock unchanged.

This SQL has **not been executed in this repository's environment** because Docker, the Supabase CLI and `psql` are unavailable. Treat it as unverified until it runs against a disposable project.

## Tables

### `inventory_items`

`available = on_hand - reserved - safety_stock`.

- `on_hand` — physical units.
- `reserved` — units held by pending orders.
- `safety_stock` — a buffer excluded from sale (default 0).
- Constraint: `reserved <= on_hand`.

Restock:

```sql
update public.inventory_items
set on_hand = on_hand + 10
where variant_id = 'halo-smart-bulb--single';

insert into public.stock_movements (variant_id, delta, reason, note)
values ('halo-smart-bulb--single', 10, 'restock', 'PO-1042');
```

Correct a count:

```sql
update public.inventory_items
set on_hand = 8
where variant_id = 'halo-smart-bulb--single';

insert into public.stock_movements (variant_id, delta, reason, note)
values ('halo-smart-bulb--single', -2, 'correction', 'Cycle count');
```

Write the count change and movement in the same transaction. `stock_movements` is the audit trail.

### `orders` and `order_items`

Only `create_order` writes these tables. Statuses: `pending`, `paid`, `fulfilled`, `cancelled`, `refunded`.

Useful queries:

```sql
select order_number, email, status, subtotal_kobo, shipping_kobo, total_kobo, currency, created_at
from public.orders
order by created_at desc
limit 25;

select o.order_number, i.product_name, i.variant_label, i.quantity,
       i.unit_price_kobo, i.line_total_kobo
from public.order_items i
join public.orders o on o.id = i.order_id
where o.order_number = 'CLD-261022-10001';
```

Line totals are immutable snapshots taken when the order was placed. Do not recalculate historical orders from today's prices.

### `customers` and `addresses`

`customers.id` references `auth.users.id` and is populated by the `on_auth_user_created` trigger. There is no sign-in UI yet, so guest checkout leaves `customer_id` null and stores the delivery address as JSON on the order.

### `carts` and `cart_items`

Reserved for signed-in customers. Guests use the local cart under `cloud.cart.v1`. RLS restricts both tables to the owner.

### `stock_movements`

Append-only. Never update or delete a movement; write a compensating row with the appropriate reason.

## RLS summary

| Table | anon | authenticated |
| --- | --- | --- |
| `inventory_items` | select | select |
| `customers` | none | select/update own |
| `addresses` | none | all own |
| `carts`, `cart_items` | none | all own |
| `orders`, `order_items` | none | select own only |
| `stock_movements` | none | none |

The service role bypasses RLS and is the only role that can execute `create_order` or `release_order`.

## Cancelling an order

```sql
select public.release_order('<order-uuid>', 'customer cancelled before payment');
```

This returns reserved units and marks the order `cancelled`. For a paid order, refund through the payment provider first, then handle the status and stock deliberately. Do not hand-edit `inventory_items` without writing the matching movement.

## Common issues

- **`permission denied for function create_order`** — you are calling it as `anon` or `authenticated`. Call it from the server route with the service role, or from the SQL editor as owner.
- **`reserved_within_stock` violation** — `on_hand` was reduced below what pending orders already hold. Release or fulfil those orders first.
- **`unknown_variant`** — the Sanity variant ID and `inventory_items.variant_id` do not match. They must be identical, including the `product-slug--option-slug` form.
- **`total_mismatch`** — the sum of line totals does not equal the supplied subtotal. The API should have caught this; investigate the order payload.
- **`unsupported_currency`** — the function accepts NGN only.
- **Orders are empty after checkout** — the API requires `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` and `PAYMENT_PROVIDER_SECRET_KEY` as a gate. Without them it returns 501 before touching the database.
- **`relation "auth.users" does not exist`** — you are applying the schema to plain Postgres rather than Supabase. Use a normal Supabase project, or remove the auth-dependent section for a non-Supabase test.
- **Old `_cents` columns appear** — the final Cloud migration was not applied, or the migration order is wrong. A fresh `supabase db reset` should end with `_kobo` columns.

## Before launch

- [ ] Add an idempotency key to `orders` and `create_order`.
- [ ] Add reservation expiry and a scheduled release job for abandoned payments.
- [ ] Add a paid-order function that converts `reserved` into an `on_hand` decrement and a `sale` movement.
- [ ] Implement the payment adapter and webhook verification before enabling order capture.
- [ ] Configure backups, connection pooling and monitoring.
- [ ] Remove the seed from the deployment path once real inventory is live.
- [ ] Add rate limiting in front of `/api/checkout` and `/api/cloudinary/sign`.
- [ ] Verify the RLS policies with anon and authenticated test roles.

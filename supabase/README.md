# Supabase

Inventory, customers, carts and orders. Content does not live here — that is Sanity.

## Files

| File | Contents |
| --- | --- |
| `migrations/20261021090000_commerce_core.sql` | Types, tables, indexes, `updated_at` triggers, auth → customer trigger. |
| `migrations/20261021090100_create_order.sql` | `create_order` and `release_order` functions. |
| `migrations/20261021090200_rls.sql` | RLS policies and grants. |
| `seed.sql` | 30 inventory rows matching the seed catalog. |

## Apply locally

Requires Docker and the Supabase CLI.

```bash
supabase start
supabase db reset        # runs migrations, then seed.sql
```

The API URL and anon key printed by `supabase start` go into `.env.local`:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

## Apply to a hosted project

```bash
supabase link --project-ref <project-ref>
supabase db push
```

Then run `seed.sql` once in the SQL editor (or `psql "$DATABASE_URL" -f supabase/seed.sql`). It is non-destructive: `on conflict (variant_id) do nothing` means a re-run never resets live stock.

If you are not using the CLI, paste the three migrations in filename order into the SQL editor, then the seed.

## Verify

```sql
select count(*) from public.inventory_items;                     -- 30
select variant_id, on_hand, reserved from public.inventory_items order by variant_id;
select proname from pg_proc where proname in ('create_order', 'release_order');
```

Test a reservation in a transaction and roll it back:

```sql
begin;
select * from public.create_order(
  'test@example.com',
  'Test Order',
  null,
  '{"line1":"1 Test Street","city":"Lagos","country":"Nigeria"}'::jsonb,
  '[{"variantId":"airpods-pro--white","sku":"APP-WHT","productName":"AirPods Pro","variantLabel":"White","unitPrice":24900,"quantity":1,"lineTotal":24900}]'::jsonb,
  24900,
  1200,
  'USD'
);
select reserved from public.inventory_items where variant_id = 'airpods-pro--white';
rollback;
```

The function is service-role only; run this as the database owner (`postgres`) in the SQL editor.

## Tables

### `inventory_items`

`available = on_hand - reserved - safety_stock`.

- `on_hand` — physical units.
- `reserved` — units held by pending orders.
- `safety_stock` — a buffer you do not want to sell (default 0).
- Constraint: `reserved <= on_hand`.

Restock:

```sql
update public.inventory_items set on_hand = on_hand + 10 where variant_id = 'steam-deck--256';
insert into public.stock_movements (variant_id, delta, reason, note)
values ('steam-deck--256', 10, 'restock', 'PO-1042');
```

Correct a count:

```sql
update public.inventory_items set on_hand = 8 where variant_id = 'steam-deck--256';
insert into public.stock_movements (variant_id, delta, reason, note)
values ('steam-deck--256', -2, 'correction', 'Cycle count');
```

Use `reason = 'correction'` and write the movement in the same transaction; the table is the audit trail.

### `orders` / `order_items`

Created only by `create_order`. Statuses: `pending`, `paid`, `fulfilled`, `cancelled`, `refunded`.

Useful views:

```sql
select order_number, email, status, total_cents, created_at
from public.orders order by created_at desc limit 25;

select o.order_number, i.product_name, i.variant_label, i.quantity, i.line_total_cents
from public.order_items i join public.orders o on o.id = i.order_id
where o.order_number = 'KLV-261021-10001';
```

### `customers`, `addresses`

`customers.id` references `auth.users.id` and is populated by the `on_auth_user_created` trigger. There is no sign-in UI yet, so this table stays empty for guest traffic.

### `carts`, `cart_items`

For signed-in customers only. Guests use `localStorage`. RLS restricts both tables to the owner.

### `stock_movements`

Append-only. Never update or delete a movement; write a compensating row.

## RLS summary

| Table | anon | authenticated |
| --- | --- | --- |
| `inventory_items` | select | select |
| `customers` | none | select/update own |
| `addresses` | none | all own |
| `carts`, `cart_items` | none | all own |
| `orders`, `order_items` | none | select own only |
| `stock_movements` | none | none |

The service role bypasses RLS and is the only role that can execute `create_order` / `release_order`.

## Cancelling an order

```sql
select public.release_order('<order-uuid>', 'customer cancelled before payment');
```

This returns reserved units and sets the order to `cancelled`. For a paid order, refund through the payment provider first, then update status and stock deliberately.

## Common issues

- **`permission denied for function create_order`** — you are calling it as `anon`/`authenticated`. Use the service role from a server route, or the SQL editor as owner.
- **`reserved_within_stock` violation** — `on_hand` was reduced below what pending orders already hold. Release or fulfil those orders first.
- **`unknown_variant`** — the Sanity variant ID and `inventory_items.variant_id` do not match. They must be identical.
- **Orders are empty after checkout** — the API requires `PAYMENT_PROVIDER_SECRET_KEY` as a gate. Without it the route returns 501 before touching the database.
- **Auth trigger missing** — apply the migrations after the `auth` schema exists (a normal Supabase project always has it). On a plain Postgres database, skip the trigger section.

## Before launch

- Add an idempotency key to `orders` and `create_order`.
- Add reservation expiry and a release job for abandoned payments.
- Add a paid-order function that converts `reserved` into a stock decrement.
- Configure database backups and connection pooling.
- Move the seed inventory out of version control once real stock is live.
- Add rate limiting in front of `/api/checkout` and `/api/cloudinary/sign`.

# Checkout and order capture

Cloud checkout is deliberately honest. It validates a real Nigerian delivery order, refuses to invent a payment, and exposes the integration boundary instead of showing a fake success screen.

## What the customer sees

- `GET /checkout` renders the bag summary and a delivery form.
- Delivery is Nigeria only. The country select defaults to Nigeria; the server enforces the rule again.
- The order review shows line items, subtotal, delivery, and total in Naira.
- If checkout is not configured, the primary button is disabled and reads **Payment not connected**. A note lists the missing server variables.
- If checkout is configured, the button reads **Record order — ₦…**. The customer is told that submitting writes a real order and reserves stock, but that no card is collected or charged.

The post-order screen says that payment capture and confirmation email still belong to the payment provider. That is true: no provider adapter exists yet.

## Money invariants

| Rule | Value |
| --- | --- |
| Storage unit | Integer kobo |
| Display | `en-NG`, narrow Naira symbol |
| Free delivery threshold | ₦150,000 = `15_000_000` kobo |
| Standard delivery | ₦4,500 = `450_000` kobo |
| Maximum quantity per line | 10 |
| Maximum lines per order | 20 |
| Accepted delivery country | Nigeria |

The client sends only variant IDs and quantities. Prices, names, SKUs, subtotals, and delivery are recomputed by `src/lib/checkout.ts` from `src/data/products.ts`.

## Server flow

```text
POST /api/checkout
  |
  |-- parse JSON; reject malformed bodies with 400
  |-- validate items, customer, address
  |     |-- unknown variant -> 409
  |     |-- quantity or stock failure -> 409
  |     |-- non-Nigerian country -> 400
  |
  |-- if Supabase/payment env missing -> 501 integration_not_configured
  |-- if admin client cannot be created -> 501
  |
  |-- supabase.rpc("create_order", ...)
  |     |-- lock inventory rows in variant order
  |     |-- verify availability
  |     |-- write orders and order_items
  |     |-- increment reserved stock
  |     |-- write a stock_movements reservation row
  |     |-- return a CLD- order number
  |
  |-- 201 { orderNumber }
  |-- 409 insufficient_stock
  |-- 500 order_failed
```

The route never returns a made-up order number. It never accepts a client-supplied total.

### Request shape

```json
{
  "items": [{ "variantId": "halo-smart-bulb--single", "quantity": 1 }],
  "customer": {
    "email": "customer@example.com",
    "firstName": "Ada",
    "lastName": "Okafor",
    "phone": "+234..."
  },
  "address": {
    "line1": "1 Example Street",
    "line2": "Flat 2",
    "city": "Lagos",
    "region": "Lagos",
    "postalCode": "100001",
    "country": "Nigeria"
  }
}
```

### Response shape

```json
{ "orderNumber": "CLD-261022-10001" }
```

Unconfigured:

```json
{
  "error": "integration_not_configured",
  "message": "Checkout is not connected. No order has been created and no payment has been taken...",
  "missing": [
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "PAYMENT_PROVIDER_SECRET_KEY"
  ]
}
```

Status `501`. This is the expected state of the repository until a real deployment is configured.

## Supabase function

The active function is defined in `supabase/migrations/20261022120000_cloud_currency.sql`. It:

- Validates email presence, address object, non-empty item array, totals, and NGN currency.
- Rejects duplicate variants, unknown variants, quantities outside 1–10, and insufficient stock.
- Locks inventory rows in variant order to avoid deadlocks.
- Computes the total as `subtotal + shipping` and writes `currency = 'NGN'`.
- Generates `CLD-YYMMDD-NNNNN` from `order_number_seq`.
- Reserves stock by increasing `inventory_items.reserved`; it does not reduce `on_hand` until fulfilment.
- Appends a reservation row to `stock_movements`.

Only `service_role` may execute the function. The browser never receives the service-role key.

## Configuration

Checkout becomes technically enabled when all of these are present at build/runtime:

```bash
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
PAYMENT_PROVIDER_SECRET_KEY=
```

`PAYMENT_PROVIDER_SECRET_KEY` is a **readiness gate only**. No card charge is implemented behind it.

Do not point a public deployment at a production Supabase project until the payment adapter, confirmation email, and order operations are complete.

## Payment adapter still to build

To accept real payments:

1. Choose a Nigerian provider (Paystack or Flutterwave are the usual options).
2. Create a server-only adapter that initialises a charge for the recorded order total.
3. Keep the order in `pending` until a verified webhook confirms payment.
4. Verify the webhook signature and the amount against the stored `total_kobo`.
5. Store the provider reference in `orders.payment_intent` and transition status to `paid`.
6. Send the confirmation email only after verification.
7. Add idempotency so a repeated webhook cannot charge or fulfil twice.
8. Add release/expiry handling for abandoned reservations.

Never trust a client-side “payment successful” callback. The database transition must be driven by a verified server event.

## Local verification

Start the dev server, then:

```bash
node tools/smoke.mjs
```

The smoke test covers:

- Adding a variant from the PDP.
- Quantity persistence in `cloud.cart.v1`.
- The ₦37,000 subtotal for two Halo bulbs.
- Removing the line and showing the empty bag.
- The disabled “Payment not connected” checkout button.
- `501 integration_not_configured` from the API.
- Rejection of a Ghana delivery address.

Manual API check:

```bash
curl -i -X POST http://localhost:3000/api/checkout \
  -H "content-type: application/json" \
  -d '{"items":[{"variantId":"halo-smart-bulb--single","quantity":1}],"customer":{"email":"qa@cloud.ng","firstName":"QA","lastName":"Cloud"},"address":{"line1":"1 Test Street","city":"Lagos","country":"Nigeria"}}'
```

Expected without environment variables: `501`, `integration_not_configured`.

## Database verification after applying migrations

```sql
-- latest orders
select order_number, status, subtotal_kobo, shipping_kobo, total_kobo, currency, created_at
from public.orders
order by created_at desc
limit 1;

-- order lines
select variant_id, product_name, variant_label, quantity, unit_price_kobo, line_total_kobo
from public.order_items
where order_id = '<uuid>';

-- reservation audit
select variant_id, delta, reason, order_id, created_at
from public.stock_movements
order by created_at desc
limit 10;

-- available stock
select variant_id, sku, on_hand, reserved, safety_stock,
       (on_hand - reserved - safety_stock) as available
from public.inventory_items
order by variant_id;
```

Expected: `currency = 'NGN'`, all money columns are integers in kobo, and a successful order increments `reserved` by the ordered quantity.

## Security checklist

- Service-role key exists only in server environment variables.
- `create_order` is executable only by `service_role`.
- No card data is collected or stored in this build.
- The checkout endpoint validates the country, variant IDs, quantities, and stock again.
- Prices and delivery are never accepted from the client.
- Row level security and policies must be reviewed in a real Supabase project before launch.

See [Supabase setup](../supabase/README.md) for migration and seed instructions.

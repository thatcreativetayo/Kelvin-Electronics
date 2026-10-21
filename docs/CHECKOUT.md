# Checkout

Checkout is a **boundary**, not a simulated payment. The form collects delivery details, the API re-prices the order on the server and writes it with a stock reservation, and then it stops. No card data is collected, transmitted or stored in this build.

With no server credentials, `POST /api/checkout` returns `501` and the UI disables the submit button. That is the expected state of the deployed demo.

## Request

```http
POST /api/checkout
content-type: application/json
```

```json
{
  "items": [
    { "variantId": "airpods-max--silver", "quantity": 1 },
    { "variantId": "kindle-paperwhite--16", "quantity": 2 }
  ],
  "customer": {
    "email": "ada@example.com",
    "firstName": "Ada",
    "lastName": "Okafor",
    "phone": "+234..."
  },
  "address": {
    "line1": "14 Bourdillon Road",
    "line2": "Flat 3",
    "city": "Lagos",
    "region": "Lagos",
    "postalCode": "101233",
    "country": "Nigeria"
  }
}
```

Only `variantId` and `quantity` matter for pricing. Names, SKUs, unit prices and totals are looked up server-side; a client-supplied price is ignored.

## Validation

`src/lib/checkout.ts` enforces:

- JSON object body; 1–20 line items.
- Quantity is an integer 1–10.
- Variant ID exists in the server catalog.
- Requested quantity ≤ seed stock (Supabase re-checks live availability inside the transaction).
- Valid email (format check), first and last name, address line, city and country.
- Shipping is free at a $150 subtotal (15000 minor units), otherwise $12 (1200).
- Currency is `USD` in this build.
- Totals are recomputed; the client cannot influence them.

Strings are trimmed and length-capped. The route returns `400` for malformed input and `409` for an unknown or short variant.

## Response

| Status | Body | Meaning |
| --- | --- | --- |
| `201` | `{ "orderNumber": "KLV-261021-10001" }` | Order written and stock reserved. No payment taken. |
| `400` | `{ "error": "invalid_order", "message": "..." }` | Validation failed. |
| `409` | `{ "error": "insufficient_stock", "message": "..." }` | A line ran out between validation and the transaction. |
| `500` | `{ "error": "order_failed", "message": "..." }` | Database error. No payment has been taken. |
| `501` | `{ "error": "integration_not_configured", "missing": [...] }` | Supabase/payment environment is incomplete. Nothing was written. |

The success screen says “Order recorded”, never “Payment received”, and it tells the customer that payment and email are not connected. Do not change that copy until they are.

## Database transaction

`public.create_order` in `supabase/migrations/20261021090100_create_order.sql`:

1. Rejects empty, oversized and duplicate-variant orders.
2. Checks the supplied subtotal equals the sum of `lineTotal`.
3. Locks every requested `inventory_items` row with `FOR UPDATE`, ordered by `variant_id` to avoid deadlocks.
4. Rejects the **whole** order if any row is short (`insufficient_stock:{variantId}`).
5. Generates `KLV-YYMMDD-{sequence}`.
6. Links the order to an existing customer by email, if one exists.
7. Inserts the order header (`status = 'pending'`).
8. Inserts immutable line snapshots: SKU, product name, variant label, unit price, quantity, line total.
9. Increments `reserved` on each inventory row.
10. Appends a negative `stock_movements` row with reason `reservation`.

All of it runs in one transaction. A failure at any step rolls the whole order back.

`reserved` reduces availability without changing `on_hand`. On payment confirmation you would:

- decrement `on_hand` and `reserved` by the same quantity,
- set the order to `paid`,
- append a `reservation`/`correction` movement if needed.

On cancellation, call `release_order(order_id)` (service role only), which returns reserved units and sets the order to `cancelled`.

## Enabling order capture

1. Apply the migrations and seed: see [../supabase/README.md](../supabase/README.md).
2. Set on the server:

   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL=
   SUPABASE_SERVICE_ROLE_KEY=
   PAYMENT_PROVIDER_SECRET_KEY=
   ```

3. Ensure `inventory_items` has a row for every sellable variant.
4. Confirm the checkout form says “Order capture connected — card payment is not”.
5. Submit a test order and verify:

   ```sql
   select order_number, status, subtotal_cents, total_cents from public.orders order by created_at desc limit 1;
   select variant_id, quantity, unit_price_cents from public.order_items where order_id = '<uuid>';
   select variant_id, reserved from public.inventory_items where variant_id = 'airpods-max--silver';
   select variant_id, delta, reason from public.stock_movements order by created_at desc limit 5;
   ```

`PAYMENT_PROVIDER_SECRET_KEY` gates order recording. Its presence does **not** make a payment work. That is intentional: there is no provider adapter.

## Adding a payment provider

The recommended sequence for a real launch:

1. **Idempotency first.** Add a client-generated key to the request and a unique `idempotency_key` column on `orders`. Pass it to `create_order` and return the existing order if it repeats. The current UI prevents double clicks, but not network retries or two tabs.
2. **Create the order as `pending` without reserving forever.** A reservation should expire (for example, 30 minutes) if payment never completes. A scheduled job should release expired reservations.
3. **Initialise payment** with the provider (Stripe PaymentIntent, Paystack transaction). Send the server-computed amount, currency and order number as metadata.
4. **Return only what the client needs** — a client secret or authorization URL. Never return the provider secret.
5. **Verify the webhook signature** on a raw body, idempotently. On success: mark `paid`, move reserved stock to sold, write a movement, send the confirmation email. On failure/cancel: release the reservation.
6. **Never trust the redirect.** The customer returning to `/checkout/success` is not proof of payment; the webhook is.
7. **Add rate limiting** to the checkout and sign endpoints. There is none in this build.
8. **Add tax** where required. The current flat shipping rule and USD pricing are demo rules, not a tax engine.

Nigeria-first options are Paystack or Flutterwave; Stripe is the usual choice for USD/international. Whichever is chosen, the order table already stores the payment reference slot (`payment_intent`).

## Security notes

- Service-role key and provider secret are server-only; never `NEXT_PUBLIC_`.
- `create_order` is `security definer` with `search_path = public, pg_temp`, revoked from `public`, `anon` and `authenticated`.
- Order rows are read-only to authenticated customers and only their own; no client role can insert or change totals.
- Stock movements are service-role only.
- The checkout page is `noindex`.
- The current route has no authentication requirement, so anyone who can reach it and has valid server config can create pending orders. Add rate limiting and bot protection before launch.

## Manual test

```bash
curl -i -X POST http://localhost:3000/api/checkout \
  -H "content-type: application/json" \
  -d '{
    "items": [{"variantId": "airpods-pro--white", "quantity": 1}],
    "customer": {"email": "test@example.com", "firstName": "Test", "lastName": "Order"},
    "address": {"line1": "1 Test Street", "city": "Lagos", "country": "Nigeria"}
  }'
```

Without credentials the expected response is `501` with:

```json
{
  "error": "integration_not_configured",
  "message": "Checkout is not connected. No order has been created and no payment has been taken. Provide the missing server-side variables to enable order capture.",
  "missing": ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "PAYMENT_PROVIDER_SECRET_KEY"]
}
```

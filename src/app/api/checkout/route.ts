import { NextResponse } from "next/server";
import { validateOrder } from "@/lib/checkout";
import { checkoutRequirements, checkoutConfigured } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase";

export const runtime = "nodejs";

/**
 * Order capture boundary.
 *
 * The storefront never invents an order number. When Supabase and the payment
 * provider are not configured this route returns 501 with the explicit list of
 * missing variables, so the UI can show the truth instead of a fake success.
 *
 * When configured, prices and stock are recomputed here from the catalog and
 * the `create_order` Postgres function performs the stock reservation inside a
 * single transaction. Card capture belongs to the payment provider and is only
 * started after the order is written.
 */
export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json", message: "The request body must be JSON." }, { status: 400 });
  }

  const validated = validateOrder(payload);
  if (!validated.ok) {
    return NextResponse.json({ error: "invalid_order", message: validated.message }, { status: validated.status });
  }

  if (!checkoutConfigured) {
    return NextResponse.json(
      {
        error: "integration_not_configured",
        message:
          "Checkout is not connected. No order has been created and no payment has been taken. Provide the missing server-side variables to enable order capture.",
        missing: checkoutRequirements.filter((item) => !item.ready).map((item) => item.key),
      },
      { status: 501 },
    );
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json(
      {
        error: "integration_not_configured",
        message: "Supabase is not configured on the server, so the order could not be written.",
        missing: ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"],
      },
      { status: 501 },
    );
  }

  const { order } = validated;

  const { data, error } = await supabase.rpc("create_order", {
    p_email: order.customer.email,
    p_customer_name: `${order.customer.firstName} ${order.customer.lastName}`.trim(),
    p_phone: order.customer.phone ?? null,
    p_shipping_address: order.address,
    p_items: order.items,
    p_subtotal: order.subtotal,
    p_shipping: order.shipping,
    p_currency: order.currency,
  });

  if (error) {
    console.error("[checkout] create_order failed", error.message);
    const stockIssue = error.message.includes("insufficient_stock");
    return NextResponse.json(
      {
        error: stockIssue ? "insufficient_stock" : "order_failed",
        message: stockIssue
          ? "Someone purchased the last unit while you were checking out. Adjust your bag and try again."
          : "The order could not be written. No payment has been taken.",
      },
      { status: stockIssue ? 409 : 500 },
    );
  }

  const row = Array.isArray(data) ? data[0] : data;
  const orderNumber = (row as { order_number?: string } | null)?.order_number;

  if (!orderNumber) {
    return NextResponse.json(
      { error: "order_failed", message: "The order was not confirmed. No payment has been taken." },
      { status: 500 },
    );
  }

  // Payment capture would be initiated here with PAYMENT_PROVIDER_SECRET_KEY.
  // This build intentionally stops at a recorded order.

  return NextResponse.json({ orderNumber }, { status: 201 });
}

import { NextResponse } from "next/server";
import { products } from "@/data/products";
import { createAdminClient } from "@/lib/supabase";

export const runtime = "nodejs";

/**
 * Current availability for a set of variants.
 *
 * Supabase is the source of truth when it is configured. Without it the local
 * catalog seed is returned, clearly labelled with `source: "seed"`, so the cart
 * can still prevent obviously invalid quantities.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const ids = (url.searchParams.get("variantIds") ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, 50);

  if (ids.length === 0) {
    return NextResponse.json({ error: "missing_variant_ids" }, { status: 400 });
  }

  const supabase = createAdminClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("inventory_items")
      .select("variant_id, on_hand, reserved, safety_stock")
      .in("variant_id", ids);

    if (!error && data) {
      const stock = Object.fromEntries(
        data.map((row) => [
          row.variant_id,
          Math.max(0, Number(row.on_hand) - Number(row.reserved) - Number(row.safety_stock)),
        ]),
      );
      return NextResponse.json(
        { source: "supabase", stock },
        { headers: { "cache-control": "no-store" } },
      );
    }
  }

  const stock = Object.fromEntries(
    products.flatMap((product) =>
      product.variants.filter((variant) => ids.includes(variant.id)).map((variant) => [variant.id, variant.stock]),
    ),
  );

  return NextResponse.json({ source: "seed", stock }, { headers: { "cache-control": "no-store" } });
}

import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout-form";
import { checkoutConfigured, checkoutRequirements, integrations } from "@/lib/env";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Review your order and delivery details.",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <CheckoutForm
      configured={checkoutConfigured}
      requirements={checkoutRequirements.map((item) => item.key)}
      supabaseReady={integrations.supabaseAdmin}
    />
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Copy, Lock } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { formatPrice } from "@/lib/format";
import { shippingFor } from "@/lib/shipping";

type Props = {
  configured: boolean;
  requirements: string[];
  supabaseReady: boolean;
};

const countries = ["Nigeria"];

export function CheckoutForm({ configured, requirements, supabaseReady }: Props) {
  const { lines, subtotal, hydrated, clear } = useCart();
  const [status, setStatus] = useState<"idle" | "submitting" | "error" | "success">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const shipping = shippingFor(subtotal);
  const total = subtotal + shipping;

  const copySummary = async () => {
    const body = [
      "Cloud — order intent",
      ...lines.map(
        (line) =>
          `${line.quantity} × ${line.product.name} (${Object.values(line.variant.options).join(", ")}) — ${formatPrice(line.lineTotal)}`,
      ),
      `Subtotal: ${formatPrice(subtotal)}`,
      `Delivery: ${shipping === 0 ? "Free" : formatPrice(shipping)}`,
      `Total: ${formatPrice(total)}`,
      "Delivery within Nigeria only. Prices include customs duties.",
    ].join("\n");
    try {
      await navigator.clipboard.writeText(body);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setMessage("Clipboard access was blocked by the browser.");
    }
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!configured || status === "submitting") return;

    const data = new FormData(event.currentTarget);
    const customer = {
      email: String(data.get("email") ?? ""),
      firstName: String(data.get("firstName") ?? ""),
      lastName: String(data.get("lastName") ?? ""),
      phone: String(data.get("phone") ?? ""),
    };
    const address = {
      line1: String(data.get("line1") ?? ""),
      line2: String(data.get("line2") ?? ""),
      city: String(data.get("city") ?? ""),
      region: String(data.get("region") ?? ""),
      postalCode: String(data.get("postalCode") ?? ""),
      country: String(data.get("country") ?? ""),
    };

    setStatus("submitting");
    setMessage(null);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          items: lines.map((line) => ({ variantId: line.variantId, quantity: line.quantity })),
          customer,
          address,
        }),
      });
      const json = (await response.json()) as { orderNumber?: string; message?: string };
      if (!response.ok || !json.orderNumber) {
        setStatus("error");
        setMessage(json.message ?? "The order could not be recorded.");
        return;
      }
      setOrderNumber(json.orderNumber);
      setStatus("success");
      clear();
    } catch {
      setStatus("error");
      setMessage("The request did not reach the server. Check your connection and try again.");
    }
  };

  if (hydrated && lines.length === 0 && status !== "success") {
    return (
      <div className="shell py-24 text-center">
        <p className="type-eyebrow text-muted">Checkout</p>
        <h1 className="type-h2 mt-3">There is nothing to check out.</h1>
        <p className="mx-auto mt-3 max-w-[42ch] text-sm text-muted">
          Add a product to your bag first. Stock and pricing are confirmed again on the server before an order is
          accepted.
        </p>
        <Link href="/collections/all" className="btn mt-7">
          Shop the catalogue
          <ArrowRight size={15} />
        </Link>
      </div>
    );
  }

  if (status === "success" && orderNumber) {
    return (
      <div className="shell py-24">
        <div className="mx-auto max-w-[560px] border border-border bg-surface p-8 sm:p-12">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-success/10 text-success">
            <Check size={18} strokeWidth={2} />
          </span>
          <p className="type-eyebrow mt-6 text-muted">Order recorded</p>
          <h1 className="type-h2 mt-2">Thank you.</h1>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Order <span className="font-mono text-ink">{orderNumber}</span> has been written to the orders table.
            Payment capture and confirmation email belong to the payment provider and must be enabled before this
            goes live.
          </p>
          <Link href="/collections/all" className="btn mt-8">
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="shell pt-8 pb-20 md:pt-10 md:pb-24">
      <nav aria-label="Breadcrumb" className="text-xs text-muted">
        <Link href="/cart" className="inline-flex items-center gap-1.5 transition-colors hover:text-ink">
          <ArrowLeft size={12} strokeWidth={1.75} />
          Back to bag
        </Link>
      </nav>

      <header className="mt-8 border-b border-border pb-6">
        <p className="type-eyebrow text-muted">Order details</p>
        <h1 className="type-h1 mt-2">Checkout</h1>
      </header>

      <div className="mt-8 grid gap-12 lg:grid-cols-12 lg:gap-16">
        <form onSubmit={submit} className="lg:col-span-7" noValidate={false}>
          <fieldset className="border-b border-border pb-10">
            <legend className="type-micro text-muted">01 — Contact</legend>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className="mb-1.5 block text-[13px] text-muted">Email address</span>
                <input name="email" type="email" required autoComplete="email" className="field" placeholder="you@example.com" />
              </label>
              <label>
                <span className="mb-1.5 block text-[13px] text-muted">First name</span>
                <input name="firstName" required autoComplete="given-name" className="field" />
              </label>
              <label>
                <span className="mb-1.5 block text-[13px] text-muted">Last name</span>
                <input name="lastName" required autoComplete="family-name" className="field" />
              </label>
              <label className="sm:col-span-2">
                <span className="mb-1.5 block text-[13px] text-muted">Phone</span>
                <input name="phone" type="tel" autoComplete="tel" className="field" placeholder="Optional" />
              </label>
            </div>
          </fieldset>

          <fieldset className="border-b border-border py-10">
            <legend className="type-micro text-muted">02 — Delivery</legend>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className="mb-1.5 block text-[13px] text-muted">Address</span>
                <input name="line1" required autoComplete="address-line1" className="field" />
              </label>
              <label className="sm:col-span-2">
                <span className="mb-1.5 block text-[13px] text-muted">Apartment, suite (optional)</span>
                <input name="line2" autoComplete="address-line2" className="field" />
              </label>
              <label>
                <span className="mb-1.5 block text-[13px] text-muted">City</span>
                <input name="city" required autoComplete="address-level2" className="field" />
              </label>
              <label>
                <span className="mb-1.5 block text-[13px] text-muted">State / region</span>
                <input name="region" autoComplete="address-level1" className="field" />
              </label>
              <label>
                <span className="mb-1.5 block text-[13px] text-muted">Postal code</span>
                <input name="postalCode" autoComplete="postal-code" className="field" />
              </label>
              <label>
                <span className="mb-1.5 block text-[13px] text-muted">Country</span>
                <select name="country" required autoComplete="country-name" className="field" defaultValue="Nigeria">
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <p className="mt-3 text-[11px] text-muted">
              We deliver within Nigeria only for now. Lagos takes 1–3 working days; everywhere else 2–5.
            </p>
          </fieldset>

          <fieldset className="pt-10">
            <legend className="type-micro text-muted">03 — Payment</legend>
            <div className="mt-4 rounded-lg border border-border bg-surface px-4 py-4">
              <div className="flex items-start gap-3">
                <Lock size={16} strokeWidth={1.6} className="mt-0.5 shrink-0 text-muted" />
                <div>
                  <p className="text-sm font-medium">
                    {configured ? "Order capture connected. Card payment is not." : "Payment is not connected in this build"}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted">
                    {configured
                      ? "Submitting writes a real order and reserves stock in Supabase. No card is collected or charged: payment capture is still a boundary, not a demo."
                      : "No card details are collected and no charge is made. The storefront stops at order intent; this is the integration boundary, not a demo payment."}
                  </p>
                </div>
              </div>
            </div>

            {!configured && (
              <div id="checkout-boundary" className="mt-4 border-l-2 border-primary bg-primary/5 px-4 py-4">
                <p className="type-micro text-primary-text">Integration boundary</p>
                <p className="mt-2 text-xs leading-relaxed text-muted">
                  Enable checkout by providing these server-side variables, then apply the Supabase migrations in{" "}
                  <code className="font-mono text-[11px]">supabase/migrations</code>:
                </p>
                <ul className="mt-3 space-y-1">
                  {requirements.map((key) => (
                    <li key={key} className="flex items-center gap-2 font-mono text-[11px] text-muted">
                      <span className="h-1 w-1 rounded-full bg-primary" aria-hidden />
                      {key}
                    </li>
                  ))}
                </ul>
                {!supabaseReady && (
                  <p className="mt-3 text-[11px] text-muted">
                    Supabase order capture is also unavailable without a service-role key. The API route returns a
                    501 with this same explanation rather than simulating success.
                  </p>
                )}
              </div>
            )}
          </fieldset>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={!configured || status === "submitting"}
              className="btn btn flex-1"
              aria-describedby={configured ? undefined : "checkout-boundary"}
            >
              {status === "submitting" ? "Recording order…" : configured ? `Record order — ${formatPrice(total)}` : "Payment not connected"}
            </button>
            <button type="button" onClick={copySummary} className="btn btn-secondary">
              {copied ? <Check size={15} /> : <Copy size={15} />}
              {copied ? "Copied" : "Copy summary"}
            </button>
          </div>

          {message && (
            <p role="alert" className="mt-4 border-l-2 border-error pl-3 text-xs leading-relaxed text-error">
              {message}
            </p>
          )}

          <p className="mt-4 text-[11px] leading-relaxed text-muted">
            By continuing you agree to our{" "}
            <Link href="/how-it-works#delivery" className="underline decoration-border underline-offset-4 hover:text-ink">
              delivery
            </Link>{" "}
            and{" "}
            <Link href="/how-it-works#returns" className="underline decoration-border underline-offset-4 hover:text-ink">
              returns
            </Link>{" "}
            terms. This build does not process payments or store card data.
          </p>
        </form>

        <aside className="lg:col-span-5" aria-label="Order review">
          <div className="sticky top-[calc(var(--header-h)+24px)] border border-border bg-surface p-6">
            <div className="flex items-baseline justify-between">
              <h2 className="type-micro text-muted">Your order</h2>
              <Link href="/cart" className="text-[11px] text-muted underline decoration-border underline-offset-4 hover:text-ink">
                Edit bag
              </Link>
            </div>

            <ul className="mt-5 divide-y divide-border">
              {lines.map((line) => (
                <li key={line.variantId} className="flex items-start justify-between gap-4 py-3.5 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{line.product.name}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {Object.values(line.variant.options).join(" · ")} · Qty {line.quantity}
                    </p>
                  </div>
                  <p className="num shrink-0 text-[13px]">{formatPrice(line.lineTotal)}</p>
                </li>
              ))}
            </ul>

            <dl className="mt-4 space-y-2.5 border-t border-border pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd className="num">{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Delivery</dt>
                <dd className="num">{shipping === 0 ? "Free" : formatPrice(shipping)}</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-3 text-base font-medium">
                <dt>Total</dt>
                <dd className="num">{formatPrice(total)}</dd>
              </div>
            </dl>

            <p className="mt-4 text-[11px] leading-relaxed text-muted">
              Prices are in Naira and include customs duties. No additional tax is calculated in this build. Stock
              is re-checked server-side before an order is written.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

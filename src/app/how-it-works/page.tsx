import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, Mail, MapPin, PackageCheck, Truck, Undo2 } from "lucide-react";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { site } from "@/data/site";
import { whatsappSupportHref } from "@/lib/contact";
import { formatPrice } from "@/lib/format";
import { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING } from "@/lib/shipping";

export const metadata: Metadata = {
  title: "How Cloud works",
  description:
    "How Cloud imports electronics, home essentials and everyday wear, handles customs and delivers across Nigeria.",
};

const steps = [
  {
    number: "01",
    title: "We choose it.",
    body: "We work with makers and distributors we trust, and bring in a short edit of things we would use ourselves. If it does not solve a real, everyday problem, it does not make the list.",
  },
  {
    number: "02",
    title: "We clear it.",
    body: "Customs, duties and clearing are handled before the product reaches you. The Naira price on the product page already includes the import.",
  },
  {
    number: "03",
    title: "We deliver it.",
    body: "Orders leave our Lagos warehouse in 1-3 working days. Delivery across Nigeria takes another 2-5, with a tracking update when the parcel leaves us.",
  },
];

const honest = [
  "No pre-orders. If it is on the site, we have the stock.",
  "No surprise duties. Customs is already in the price.",
  "No invented reviews. Cloud is new; we would rather earn the first ones.",
  "No countdown timers. The price is the price.",
];

export default function HowItWorksPage() {
  return (
    <div className="shell pt-5 pb-20 md:pt-7 md:pb-24">
      <nav aria-label="Breadcrumb" className="text-xs text-muted">
        <Link href="/" className="transition-colors duration-150 hover:text-ink">
          Home
        </Link>
        <span className="mx-1.5 text-border">/</span>
        <span className="text-ink">How Cloud works</span>
      </nav>

      <header className="card mt-6 overflow-hidden">
        <div className="grid lg:grid-cols-12">
          <div className="flex flex-col justify-center p-6 sm:p-9 lg:col-span-7 lg:p-12">
            <p className="type-eyebrow">The Cloud promise</p>
            <h1 className="type-h1 mt-3">From supplier to your door.</h1>
            <p className="type-lead mt-5 max-w-[44ch]">
              Cloud is an importer, not a marketplace. We buy the stock, carry the customs risk and stand behind
              what arrives at your door.
            </p>
          </div>
          <div className="relative min-h-[260px] border-t border-border bg-bg lg:col-span-5 lg:min-h-[420px] lg:border-l lg:border-t-0">
            <Image
              src="/products/kettle-one.png"
              alt="A Cloud kitchen appliance"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-contain p-8 sm:p-12"
            />
          </div>
        </div>
      </header>

      <section className="section" aria-labelledby="process">
        <div className="max-w-[640px]">
          <p className="type-eyebrow">From there to here</p>
          <h2 id="process" className="type-h2 mt-2">
            A short chain, with fewer gaps.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Most import problems happen between the factory and the front door. We keep that chain short and own
            every part of it.
          </p>
        </div>

        <div className="mt-7 grid gap-3 sm:gap-4 md:grid-cols-3">
          {steps.map((step) => (
            <article key={step.number} className="card p-6">
              <span className="num text-sm font-medium text-primary-text">{step.number}</span>
              <h3 className="type-h3 mt-4">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="delivery" className="scroll-mt-28" aria-labelledby="delivery-title">
        <div className="card overflow-hidden">
          <div className="grid lg:grid-cols-12">
            <div className="p-6 sm:p-9 lg:col-span-4 lg:p-10">
              <p className="type-eyebrow">Delivery</p>
              <h2 id="delivery-title" className="type-h2 mt-2">
                From Lagos, outward.
              </h2>
              <p className="mt-4 max-w-[36ch] text-sm leading-relaxed text-muted">
                We deliver within Nigeria only for now. Delivery is calculated in Naira at checkout, and every
                price includes customs duties.
              </p>
            </div>

            <div className="border-t border-border px-6 pb-6 sm:px-9 sm:pb-9 lg:col-span-8 lg:border-l lg:border-t-0 lg:p-10">
              <dl className="divide-y divide-border border-y border-border">
                <div className="grid grid-cols-[1fr_auto] items-baseline gap-6 py-4">
                  <dt>
                    <span className="block text-[15px] font-medium">Lagos</span>
                    <span className="mt-1 block text-xs text-muted">Mainland and island addresses</span>
                  </dt>
                  <dd className="text-right text-sm">1-3 working days</dd>
                </div>
                <div className="grid grid-cols-[1fr_auto] items-baseline gap-6 py-4">
                  <dt>
                    <span className="block text-[15px] font-medium">Nationwide</span>
                    <span className="mt-1 block text-xs text-muted">All other states</span>
                  </dt>
                  <dd className="text-right text-sm">2-5 working days</dd>
                </div>
                <div className="grid grid-cols-[1fr_auto] items-baseline gap-6 py-4">
                  <dt>
                    <span className="block text-[15px] font-medium">Delivery fee</span>
                    <span className="mt-1 block text-xs text-muted">
                      Free over {formatPrice(FREE_SHIPPING_THRESHOLD)}
                    </span>
                  </dt>
                  <dd className="num text-right text-sm">{formatPrice(STANDARD_SHIPPING)}</dd>
                </div>
                <div className="grid grid-cols-[1fr_auto] items-baseline gap-6 py-4">
                  <dt>
                    <span className="block text-[15px] font-medium">Customs and duties</span>
                    <span className="mt-1 block text-xs text-muted">Already included in every price</span>
                  </dt>
                  <dd className="text-right text-sm">Included</dd>
                </div>
              </dl>

              <div className="mt-5 flex items-start gap-3 rounded-lg bg-bg p-4">
                <Truck size={17} strokeWidth={1.7} className="mt-0.5 shrink-0 text-primary-text" />
                <p className="text-xs leading-relaxed text-muted">
                  You will get a tracking update when the parcel leaves our Lagos warehouse. If a delivery attempt
                  fails, we will contact you to arrange another.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="returns" className="section scroll-mt-28" aria-labelledby="returns-title">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
            <p className="type-eyebrow">Returns</p>
            <h2 id="returns-title" className="type-h2 mt-2">
              14 days. No drama.
            </h2>
            <p className="mt-4 max-w-[36ch] text-sm leading-relaxed text-muted">
              If something is not right, start a return within 14 days of delivery. We will confirm the next step
              by email.
            </p>
            <Link href="/collections/all" className="btn mt-6">
              Shop with confidence
              <ArrowRight size={15} strokeWidth={1.9} />
            </Link>
          </div>

          <div className="lg:col-span-8">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="card p-6">
                <Undo2 size={19} strokeWidth={1.7} className="text-primary-text" />
                <h3 className="mt-4 text-[15px] font-medium">Changed your mind</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  The item should be unused, unopened and in its original packaging. We will arrange collection or
                  a return address once you email us.
                </p>
              </div>
              <div className="card p-6">
                <PackageCheck size={19} strokeWidth={1.7} className="text-primary-text" />
                <h3 className="mt-4 text-[15px] font-medium">Faulty on arrival</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  Send us a photo of the fault and the packaging within 14 days. We will repair, replace or refund
                  - whichever gets you a working product fastest.
                </p>
              </div>
            </div>

            <div id="warranty" className="mt-3 scroll-mt-28 rounded-2xl border border-border bg-bg p-6">
              <h3 className="text-[15px] font-medium">Warranty</h3>
              <p className="mt-2 max-w-[64ch] text-sm leading-relaxed text-muted">
                Every electronics item carries a one-year warranty handled by Cloud, not a third-party service
                desk. Apparel is covered by the 14-day returns window; if a seam or print fails in normal wear
                after that, email us and we will look at it.
              </p>
            </div>

            <p className="mt-5 text-xs leading-relaxed text-muted">
              To start a return, email{" "}
              <a
                href={`mailto:${site.email}`}
                className="underline decoration-border underline-offset-4 transition-colors duration-150 hover:text-ink"
              >
                {site.email}
              </a>{" "}
              with your order number and a short description. Do not ship anything back before we reply.
            </p>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl bg-ink text-surface" aria-labelledby="honest">
        <div className="grid lg:grid-cols-12">
          <div className="p-6 sm:p-9 lg:col-span-5 lg:p-12">
            <p className="type-eyebrow text-primary">The honest bit</p>
            <h2 id="honest" className="type-h2 mt-3 max-w-[9ch]">
              What we will not do.
            </h2>
            <p className="mt-5 max-w-[38ch] text-sm leading-relaxed text-surface/70">
              A new store has to earn trust. The least we can do is keep the interface honest while it does.
            </p>
          </div>
          <ul className="border-t border-surface/15 lg:col-span-7 lg:border-l lg:border-t-0">
            {honest.map((line) => (
              <li
                key={line}
                className="flex items-start gap-3 border-b border-surface/15 px-6 py-5 last:border-b-0 sm:px-8"
              >
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-surface/10">
                  <Check size={11} strokeWidth={2.4} />
                </span>
                <span className="text-sm leading-relaxed text-surface/80">{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="contact" className="mt-10 scroll-mt-28" aria-labelledby="contact-title">
        <div className="card grid gap-6 p-6 sm:p-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="type-eyebrow">Contact</p>
            <h2 id="contact-title" className="type-h3 mt-2">
              Questions before ordering?
            </h2>
            <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-muted">
              Send the product name and your city. We will confirm stock, delivery and the final price. We reply
              within one business day.
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <a href={`mailto:${site.email}`} className="btn">
                <Mail size={15} strokeWidth={1.9} />
                Email Cloud
              </a>
              <a href={whatsappSupportHref()} className="btn btn-secondary">
                <WhatsAppIcon size={16} />
                {site.whatsappNumber ? "Order on WhatsApp" : "WhatsApp support"}
              </a>
            </div>
          </div>
          <div className="border-t border-border pt-5 text-sm text-muted lg:col-span-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <MapPin size={15} strokeWidth={1.7} className="mt-0.5 shrink-0 text-primary-text" />
                <span>
                  {site.location}
                  <br />
                  <span className="text-xs">{site.hours}</span>
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail size={15} strokeWidth={1.7} className="mt-0.5 shrink-0 text-primary-text" />
                <a href={`mailto:${site.email}`} className="hover:text-ink">
                  {site.email}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
        <p className="text-sm text-muted">Ready to shop? The full catalogue is a short one.</p>
        <Link href="/collections/all" className="btn btn-sm">
          Shop all products
          <ArrowUpRight size={13} strokeWidth={1.9} />
        </Link>
      </div>
    </div>
  );
}

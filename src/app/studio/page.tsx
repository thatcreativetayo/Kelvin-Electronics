import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Check, Minus } from "lucide-react";
import { integrations, sanityEnv, cloudinaryEnv } from "@/lib/env";

export const metadata: Metadata = {
  title: "Store admin",
  description: "Sanity Studio, Supabase and Cloudinary status for this build.",
  robots: { index: false, follow: false },
};

const rows = [
  {
    label: "Sanity content",
    ready: integrations.sanity,
    detail: integrations.sanity
      ? `Project ${sanityEnv.projectId} · dataset ${sanityEnv.dataset}`
      : "Set NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET, then deploy studio/.",
    vars: ["NEXT_PUBLIC_SANITY_PROJECT_ID", "NEXT_PUBLIC_SANITY_DATASET"],
  },
  {
    label: "Supabase commerce",
    ready: integrations.supabaseAdmin,
    detail: integrations.supabaseAdmin
      ? "Server-side order capture and inventory are available."
      : "Apply supabase/migrations and provide the service-role key to enable order capture.",
    vars: ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"],
  },
  {
    label: "Cloudinary media",
    ready: integrations.cloudinary,
    detail: integrations.cloudinary
      ? `Signed uploads to ${cloudinaryEnv.uploadFolder}.`
      : "Add the cloud name, API key and secret to enable signed uploads from the Studio.",
    vars: ["NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"],
  },
  {
    label: "Payment provider",
    ready: Boolean(process.env.PAYMENT_PROVIDER_SECRET_KEY),
    detail: Boolean(process.env.PAYMENT_PROVIDER_SECRET_KEY)
      ? "A provider secret is present. Card capture is started after the order is written."
      : "Checkout stops at order intent. No card details are collected and no charge is made.",
    vars: ["PAYMENT_PROVIDER_SECRET_KEY"],
  },
];

export default function StudioPage() {
  return (
    <div className="shell pt-8 pb-20 md:pt-10 md:pb-24">
      <nav aria-label="Breadcrumb" className="text-xs text-muted">
        <Link href="/" className="hover:text-ink">
          Home
        </Link>
        <span className="mx-1.5 text-faint">/</span>
        <span className="text-ink">Store admin</span>
      </nav>

      <header className="mt-8 grid gap-8 border-b border-line pb-10 md:grid-cols-12">
        <div className="md:col-span-7">
          <p className="type-micro text-muted">Back office</p>
          <h1 className="type-h1 mt-3">
            The studio is
            <br />
            a separate app.
          </h1>
        </div>
        <div className="md:col-span-5">
          <p className="text-sm leading-relaxed text-ink-2">
            Sanity Studio lives in <code className="font-mono text-[12px]">studio/</code> so that schema changes
            deploy without rebuilding the storefront. The storefront reads published content when Sanity is
            configured, and falls back to the local seed catalog otherwise.
          </p>
        </div>
      </header>

      <section className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <h2 className="type-micro text-muted">Run it locally</h2>
          <ol className="mt-5 space-y-6">
            {[
              {
                title: "Install the studio",
                body: "From the repository root: pnpm --dir studio install. The studio is intentionally a separate package with its own dependencies.",
                code: "pnpm --dir studio install",
              },
              {
                title: "Create a Sanity project",
                body: "Create a project and a production dataset at sanity.io/manage, then add the project ID and dataset to both .env files.",
                code: "SANITY_STUDIO_PROJECT_ID=...\nSANITY_STUDIO_DATASET=production",
              },
              {
                title: "Start the studio",
                body: "Runs on port 3333. Sign in with the Sanity account that owns the project; editors are invited from the project dashboard.",
                code: "pnpm --dir studio dev",
              },
              {
                title: "Deploy when ready",
                body: "The studio deploys independently of the storefront. Set NEXT_PUBLIC_SANITY_STUDIO_URL to the deployed origin so the footer link points at it.",
                code: "pnpm --dir studio deploy",
              },
            ].map((step, index) => (
              <li key={step.title} className="grid grid-cols-[28px_1fr] gap-3">
                <span className="font-mono text-xs text-faint">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="text-sm font-medium">{step.title}</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-ink-2">{step.body}</p>
                  <pre className="mt-3 overflow-x-auto rounded-[var(--radius-sm)] border border-line bg-paper px-3 py-2.5 font-mono text-[11px] leading-relaxed text-ink-2">
                    {step.code}
                  </pre>
                </div>
              </li>
            ))}
          </ol>

          <p className="mt-8 border-l-2 border-line-strong pl-4 text-xs leading-relaxed text-muted">
            The storefront does not ship Sanity credentials. Nothing here claims a live project until the
            environment variables are present — the status board to the right reads the actual process
            environment.
          </p>
        </div>

        <aside className="lg:col-span-5" aria-label="Integration status">
          <h2 className="type-micro text-muted">Integration status</h2>
          <ul className="mt-5 divide-y divide-line border-y border-line">
            {rows.map((row) => (
              <li key={row.label} className="py-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-medium">{row.label}</h3>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-[var(--radius-xs)] px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] ${
                      row.ready ? "bg-success/10 text-success" : "bg-warn/10 text-warn"
                    }`}
                  >
                    {row.ready ? <Check size={10} strokeWidth={2.5} /> : <Minus size={10} strokeWidth={2.5} />}
                    {row.ready ? "Connected" : "Not configured"}
                  </span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-muted">{row.detail}</p>
                {!row.ready && (
                  <ul className="mt-2.5 space-y-1">
                    {row.vars.map((variable) => (
                      <li key={variable} className="font-mono text-[10.5px] text-faint">
                        {variable}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>

          <a
            href={sanityEnv.studioUrl}
            className="btn btn-outline mt-6 w-full"
            target={sanityEnv.studioUrl.startsWith("http") ? "_blank" : undefined}
            rel="noreferrer noopener"
          >
            {integrations.sanity ? "Open Studio" : "Studio not deployed"}
            <ArrowUpRight size={14} strokeWidth={1.75} />
          </a>
        </aside>
      </section>
    </div>
  );
}

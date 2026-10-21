import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="shell flex min-h-[60vh] flex-col justify-center py-20">
      <p className="type-micro text-muted">404 — Not found</p>
      <h1 className="type-h1 mt-4 max-w-[18ch]">
        This page is not in the catalog.
      </h1>
      <p className="mt-5 max-w-[46ch] text-sm leading-relaxed text-ink-2">
        The link may be outdated, or the product may have sold through. The full catalog is one page away.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/collections/all" className="btn">
          Browse the catalog
          <ArrowRight size={15} />
        </Link>
        <Link href="/" className="btn btn-outline">
          Back home
        </Link>
      </div>
    </div>
  );
}

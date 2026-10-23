import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/format";

export function Pagination({
  basePath,
  params,
  page,
  pageCount,
}: {
  basePath: string;
  params: Record<string, string>;
  page: number;
  pageCount: number;
}) {
  if (pageCount <= 1) return null;

  const href = (target: number) => {
    const sp = new URLSearchParams(params);
    if (target === 1) sp.delete("page");
    else sp.set("page", String(target));
    const qs = sp.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const pages = Array.from({ length: pageCount }, (_, index) => index + 1).filter(
    (value) => value === 1 || value === pageCount || Math.abs(value - page) <= 1,
  );

  return (
    <nav aria-label="Pagination" className="mt-14 flex items-center justify-between border-t border-border pt-6">
      {page > 1 ? (
        <Link href={href(page - 1)} className="inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-ink">
          <ChevronLeft size={14} strokeWidth={1.75} /> Previous
        </Link>
      ) : (
        <span className="inline-flex items-center gap-1.5 text-[13px] text-muted">
          <ChevronLeft size={14} strokeWidth={1.75} /> Previous
        </span>
      )}

      <ol className="flex items-center gap-1">
        {pages.map((value, index) => {
          const previous = pages[index - 1];
          const gap = previous && value - previous > 1;
          return (
            <li key={value} className="flex items-center gap-1">
              {gap && <span className="px-1 text-xs text-muted">…</span>}
              <Link
                href={href(value)}
                aria-current={value === page ? "page" : undefined}
                className={cn(
                  "num grid h-8 w-8 place-items-center rounded-md text-[13px] transition-colors",
                  value === page ? "bg-ink text-surface" : "text-muted hover:bg-surface",
                )}
              >
                {value}
              </Link>
            </li>
          );
        })}
      </ol>

      {page < pageCount ? (
        <Link href={href(page + 1)} className="inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-ink">
          Next <ChevronRight size={14} strokeWidth={1.75} />
        </Link>
      ) : (
        <span className="inline-flex items-center gap-1.5 text-[13px] text-muted">
          Next <ChevronRight size={14} strokeWidth={1.75} />
        </span>
      )}
    </nav>
  );
}

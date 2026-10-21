"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { collections } from "@/data/collections";
import { cn } from "@/lib/format";

export function AnnouncementBar() {
  return (
    <div className="bg-ink text-paper">
      <div className="shell flex h-9 items-center justify-center gap-3">
        <span className="type-micro text-[10px] opacity-90">
          Complimentary delivery over $150
        </span>
        <span aria-hidden className="hidden h-3 w-px bg-white/25 sm:block" />
        <span className="type-micro hidden text-[10px] opacity-60 sm:block">
          Two-year warranty on every product
        </span>
      </div>
    </div>
  );
}

export function SiteHeader() {
  const { count, openCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [menuOpen]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setSearchOpen(false);
    setMenuOpen(false);
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <>
      <AnnouncementBar />
      <header className="sticky top-0 z-40 border-b border-line bg-canvas/85 backdrop-blur-xl">
        <div className="shell flex h-[var(--header-h)] items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="-ml-2 grid h-10 w-10 place-items-center text-ink lg:hidden"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              <Menu size={19} strokeWidth={1.5} />
            </button>
            <Link href="/" className="group flex items-baseline gap-1.5" aria-label="Kelvin home">
              <span className="text-[19px] font-semibold tracking-[-0.06em] text-ink sm:text-[21px]">
                KELVIN
              </span>
              <span className="text-[13px] font-medium leading-none text-accent transition-transform duration-300 group-hover:-translate-y-0.5">
                °
              </span>
            </Link>
          </div>

          <nav aria-label="Collections" className="hidden items-center gap-7 lg:flex">
            {collections.map((collection) => {
              const active = pathname === `/collections/${collection.slug}`;
              return (
                <Link
                  key={collection.slug}
                  href={`/collections/${collection.slug}`}
                  className={cn(
                    "relative py-2 text-[13px] tracking-[-0.005em] transition-colors",
                    active ? "text-ink" : "text-ink-2 hover:text-ink",
                  )}
                >
                  {collection.name}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-x-0 -bottom-px h-px origin-left bg-ink transition-transform duration-300",
                      active ? "scale-x-100" : "scale-x-0",
                    )}
                  />
                </Link>
              );
            })}
            <Link
              href="/collections/all"
              className="py-2 text-[13px] text-muted transition-colors hover:text-ink"
            >
              All products
            </Link>
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen((open) => !open)}
              className="grid h-10 w-10 place-items-center text-ink transition-colors hover:text-accent"
              aria-label={searchOpen ? "Close search" : "Search products"}
              aria-expanded={searchOpen}
              aria-controls="header-search"
            >
              {searchOpen ? <X size={18} strokeWidth={1.6} /> : <Search size={18} strokeWidth={1.6} />}
            </button>
            <button
              type="button"
              onClick={openCart}
              className="relative grid h-10 w-10 place-items-center text-ink transition-colors hover:text-accent"
              aria-label={`Open bag, ${count} ${count === 1 ? "item" : "items"}`}
            >
              <ShoppingBag size={18} strokeWidth={1.6} />
              {count > 0 && (
                <span className="num absolute right-0.5 top-0.5 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-accent px-1 text-[10px] font-medium leading-none text-white">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>

        {searchOpen && (
          <div id="header-search" className="border-t border-line bg-paper" style={{ animation: "fadeIn 160ms var(--ease-ui) both" }}>
            <form onSubmit={submit} className="shell flex items-center gap-3 py-4" role="search">
              <Search size={17} className="shrink-0 text-muted" strokeWidth={1.6} />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search products, brands, specifications"
                className="h-10 w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-faint"
                aria-label="Search products"
              />
              <button type="submit" className="type-micro shrink-0 text-accent">
                Search
              </button>
            </form>
          </div>
        )}
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-ink/40"
            onClick={() => setMenuOpen(false)}
          />
          <div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="absolute inset-y-0 left-0 flex w-[88%] max-w-[400px] flex-col bg-paper"
            style={{ animation: "drawerIn 320ms var(--ease-out-quint) both", transformOrigin: "left" }}
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <span className="text-[17px] font-semibold tracking-[-0.05em]">KELVIN°</span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-full border border-line-strong"
                aria-label="Close menu"
              >
                <X size={15} strokeWidth={1.75} />
              </button>
            </div>
            <form onSubmit={submit} className="flex items-center gap-2 border-b border-line px-5 py-3" role="search">
              <Search size={16} className="text-muted" strokeWidth={1.6} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search the catalog"
                className="h-9 w-full bg-transparent text-sm outline-none placeholder:text-faint"
                aria-label="Search products"
              />
            </form>
            <nav aria-label="Mobile collections" className="flex-1 overflow-y-auto overscroll-contain px-5 py-6">
              <p className="type-micro mb-4 text-muted">Collections</p>
              <ul className="space-y-1">
                {collections.map((collection) => (
                  <li key={collection.slug}>
                    <Link
                      href={`/collections/${collection.slug}`}
                      className="flex items-baseline justify-between border-b border-line py-3 text-[22px] font-medium tracking-[-0.03em]"
                    >
                      {collection.name}
                      <span className="type-micro text-faint">{collection.eyebrow.split("/")[0].trim()}</span>
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/collections/all" className="block py-3 text-[15px] text-muted">
                    All products
                  </Link>
                </li>
              </ul>
            </nav>
            <div className="border-t border-line px-5 py-5">
              <button type="button" onClick={() => { setMenuOpen(false); openCart(); }} className="btn w-full">
                View bag ({count})
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

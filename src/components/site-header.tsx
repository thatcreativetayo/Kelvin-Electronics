"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Menu, Search, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { whatsappSupportHref } from "@/lib/contact";
import { cn } from "@/lib/format";
import type { Collection } from "@/lib/types";

export function SiteHeader({ collections }: { collections: Collection[] }) {
  const { count, openCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    if (!menuOpen && !searchOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen, searchOpen]);

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
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-[border-color,box-shadow] duration-200",
        scrolled ? "border-border shadow-soft" : "border-transparent bg-bg",
      )}
    >
      {scrolled && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-surface/88 backdrop-blur-xl"
        />
      )}
      <div className="shell relative z-10 flex h-[var(--header-h)] items-center gap-2">
        <Link href="/" className="flex shrink-0 items-center" aria-label="Cloud home">
          <Image
            src="/brand/logo.svg"
            alt="Cloud"
            width={792}
            height={300}
            priority
            className="h-[26px] w-auto sm:h-7"
          />
        </Link>

        <nav aria-label="Shop categories" className="ml-8 hidden h-full items-center gap-6 lg:flex">
          {collections.map((collection) => {
            const active = pathname === `/collections/${collection.slug}`;
            return (
              <Link
                key={collection.slug}
                href={`/collections/${collection.slug}`}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-full items-center text-[13px] font-medium transition-colors duration-150",
                  active ? "text-ink" : "text-muted hover:text-ink",
                )}
              >
                {collection.name}
                <span
                  className={cn(
                    "absolute inset-x-0 bottom-0 h-[2px] transition-colors duration-150",
                    active ? "bg-primary" : "bg-transparent",
                  )}
                  aria-hidden
                />
              </Link>
            );
          })}
          <Link
            href="/collections/all"
            className="relative flex h-full items-center text-[13px] font-medium text-muted transition-colors duration-150 hover:text-ink"
          >
            All products
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
          <button
            type="button"
            onClick={() => setSearchOpen((open) => !open)}
            className="grid h-10 w-10 place-items-center rounded-full text-ink transition-colors duration-150 hover:bg-surface"
            aria-label={searchOpen ? "Close search" : "Search products"}
            aria-expanded={searchOpen}
            aria-controls="header-search"
          >
            {searchOpen ? <X size={19} strokeWidth={1.7} /> : <Search size={19} strokeWidth={1.7} />}
          </button>

          <button
            type="button"
            onClick={() => {
              setSearchOpen(false);
              openCart();
            }}
            className="relative grid h-10 w-10 place-items-center rounded-full text-ink transition-colors duration-150 hover:bg-surface"
            aria-label={`Open bag, ${count} ${count === 1 ? "item" : "items"}`}
          >
            <ShoppingBag size={19} strokeWidth={1.7} />
            {count > 0 && (
              <span className="num absolute right-0.5 top-0 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-on-primary">
                {count}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setSearchOpen(false);
              setMenuOpen(true);
            }}
            className="grid h-10 w-10 place-items-center rounded-full text-ink transition-colors duration-150 hover:bg-surface lg:hidden"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            <Menu size={20} strokeWidth={1.7} />
          </button>
        </div>
      </div>

      {searchOpen && (
        <>
          <button
            type="button"
            aria-label="Dismiss search"
            tabIndex={-1}
            onClick={() => setSearchOpen(false)}
            className="absolute inset-x-0 top-full h-[100dvh] bg-ink/25"
            style={{ animation: "fadeIn 160ms var(--ease-ui) both" }}
          />
          <div
            id="header-search"
            className="absolute inset-x-0 top-full z-10 border-b border-border bg-surface shadow-soft"
            style={{ animation: "fadeIn 160ms var(--ease-ui) both" }}
          >
            <div className="shell py-4 sm:py-5">
              <form onSubmit={submit} className="flex items-center gap-3" role="search">
                <Search size={20} className="shrink-0 text-muted" strokeWidth={1.7} />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search Cloud"
                  className="h-11 w-full bg-transparent text-[17px] text-ink placeholder:text-muted sm:text-[19px]"
                  aria-label="Search products"
                />
                <button type="submit" className="btn btn-sm shrink-0">
                  Search
                </button>
              </form>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-3">
                <span className="type-micro text-muted">Browse</span>
                {collections.map((collection) => (
                  <Link
                    key={collection.slug}
                    href={`/collections/${collection.slug}`}
                    onClick={() => setSearchOpen(false)}
                    className="text-xs font-medium text-muted transition-colors duration-150 hover:text-ink"
                  >
                    {collection.name}
                  </Link>
                ))}
                <Link
                  href="/collections/all"
                  onClick={() => setSearchOpen(false)}
                  className="text-xs font-medium text-primary-text"
                >
                  All products
                </Link>
              </div>
            </div>
          </div>
        </>
      )}

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
            className="absolute inset-y-0 right-0 flex w-[92%] max-w-[420px] flex-col bg-surface shadow-lift"
            style={{ animation: "drawerIn 220ms var(--ease-ui) both" }}
          >
            <div className="flex h-[var(--header-h)] items-center justify-between border-b border-border px-5">
              <Link href="/" onClick={() => setMenuOpen(false)} aria-label="Cloud home">
                <Image src="/brand/logo.svg" alt="Cloud" width={792} height={300} className="h-6 w-auto" />
              </Link>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-full border border-border"
                aria-label="Close menu"
              >
                <X size={16} strokeWidth={1.8} />
              </button>
            </div>

            <form onSubmit={submit} className="border-b border-border px-5 py-4" role="search">
              <div className="flex items-center gap-2 rounded-xl border border-border px-3">
                <Search size={16} className="text-muted" strokeWidth={1.8} />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search products"
                  className="h-11 w-full bg-transparent text-sm placeholder:text-muted"
                  aria-label="Search products"
                />
                <button type="submit" className="text-xs font-medium text-primary-text">
                  Go
                </button>
              </div>
            </form>

            <nav aria-label="Mobile categories" className="flex-1 overflow-y-auto overscroll-contain px-5 py-5">
              <p className="type-eyebrow">Shop</p>
              <ul className="mt-2">
                {collections.map((collection) => (
                  <li key={collection.slug}>
                    <Link
                      href={`/collections/${collection.slug}`}
                      className="group flex items-center justify-between border-b border-border py-4"
                    >
                      <span className="text-[18px] font-medium tracking-[-0.02em]">{collection.name}</span>
                      <span className="flex items-center gap-2 text-xs text-muted">
                        {collection.tagline}
                        <ArrowRight
                          size={14}
                          strokeWidth={1.8}
                          className="transition-transform duration-150 group-hover:translate-x-0.5"
                        />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>

              <ul className="mt-8 space-y-3 text-sm text-muted">
                <li>
                  <Link href="/collections/all" className="transition-colors hover:text-ink">
                    All products
                  </Link>
                </li>
                <li>
                  <Link href="/how-it-works" className="transition-colors hover:text-ink">
                    How Cloud works
                  </Link>
                </li>
                <li>
                  <Link href={whatsappSupportHref()} className="transition-colors hover:text-ink">
                    WhatsApp support
                  </Link>
                </li>
                <li>
                  <Link href="/how-it-works#contact" className="transition-colors hover:text-ink">
                    Contact
                  </Link>
                </li>
              </ul>
            </nav>

            <div className="border-t border-border px-5 py-4">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  openCart();
                }}
                className="btn w-full"
              >
                <ShoppingBag size={15} strokeWidth={1.9} />
                View bag ({count})
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

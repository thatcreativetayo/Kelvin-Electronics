import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { CartProvider } from "@/components/cart-provider";
import { CartDrawer } from "@/components/cart-drawer";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "KELVIN — Precision electronics",
    template: "%s · KELVIN",
  },
  description:
    "An independent electronics retailer. Audio, computing, mobile, imaging and gaming — chosen for how they hold up after the unboxing.",
  openGraph: {
    title: "KELVIN — Precision electronics",
    description:
      "Audio, computing, imaging and gaming, chosen for how they hold up after the unboxing.",
    type: "website",
    images: [{ url: "/products/airpods-max.jpg", width: 1400, height: 1400, alt: "KELVIN" }],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#f2f1ec",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <CartProvider>
          <SiteHeader />
          <main id="main">{children}</main>
          <SiteFooter />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}

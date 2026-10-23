import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { CartProvider } from "@/components/cart-provider";
import { CartDrawer } from "@/components/cart-drawer";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCatalog } from "@/lib/content";

const poppins = localFont({
  src: [
    { path: "./fonts/Poppins-Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/Poppins-Medium.ttf", weight: "500", style: "normal" },
    { path: "./fonts/Poppins-SemiBold.ttf", weight: "600", style: "normal" },
  ],
  variable: "--font-poppins",
  display: "swap",
  preload: true,
});

const description =
  "Genuine electronics, home essentials and everyday wear, imported and delivered across Nigeria. Prices in Naira, customs included.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Cloud | The good stuff, brought home",
    template: "%s | Cloud",
  },
  description,
  applicationName: "Cloud",
  icons: {
    icon: [
      { url: "/brand/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/brand/favicon-32.png",
    apple: [{ url: "/brand/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "Cloud | The good stuff, brought home",
    description,
    type: "website",
    url: "/",
    siteName: "Cloud",
    images: [
      {
        url: "/brand/og.png",
        width: 1200,
        height: 630,
        alt: "Cloud - the good stuff, brought home",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cloud | The good stuff, brought home",
    description,
    images: ["/brand/og.png"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#f5f8fc",
  colorScheme: "light",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { collections } = await getCatalog();

  return (
    <html lang="en-NG" className={poppins.variable}>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <CartProvider>
          <SiteHeader collections={collections} />
          <main id="main">{children}</main>
          <SiteFooter collections={collections} />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}

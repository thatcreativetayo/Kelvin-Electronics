/**
 * Store contact and social configuration.
 *
 * WhatsApp stays disabled until a real number is provided through
 * NEXT_PUBLIC_WHATSAPP_NUMBER. Components fall back to the contact section
 * instead of showing an invented phone number.
 */
const whatsappNumber = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(/\D/g, "");

export const site = {
  legalName: "Cloud Retail Ltd",
  email: "hello@cloud.ng",
  location: "Lagos, Nigeria",
  hours: "Monday to Friday, 09:00-18:00 WAT",
  whatsappNumber,
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "https://www.instagram.com/cloud.ng",
  tiktok: process.env.NEXT_PUBLIC_TIKTOK_URL ?? "https://www.tiktok.com/@cloud.ng",
} as const;

export const socials = [
  { label: "Instagram", href: site.instagram },
  { label: "TikTok", href: site.tiktok },
] as const;

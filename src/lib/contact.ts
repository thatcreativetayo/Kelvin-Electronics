import { site } from "@/data/site";

/**
 * Returns a WhatsApp order link when a number is configured. Until then it
 * points people to the contact section so the button still has an honest job.
 */
export function whatsappOrderHref(productName: string, option?: string): string {
  const detail = option ? ` (${option})` : "";
  const message = `Hello Cloud, I would like to order the ${productName}${detail}. Is it available?`;

  if (!site.whatsappNumber) return "/how-it-works#contact";

  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function whatsappSupportHref(message = "Hello Cloud, I have a question."): string {
  if (!site.whatsappNumber) return "/how-it-works#contact";
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export const whatsappConfigured = Boolean(site.whatsappNumber);

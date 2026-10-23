export const FREE_SHIPPING_THRESHOLD = 15_000_000;
export const STANDARD_SHIPPING = 450_000;

/** Delivery within Nigeria. All amounts are NGN minor units (kobo). */
export function shippingFor(subtotal: number): number {
  if (subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  return STANDARD_SHIPPING;
}

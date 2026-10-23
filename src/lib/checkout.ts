import { products } from "@/data/products";
import { shippingFor } from "@/lib/shipping";
import type { Variant } from "@/lib/types";

export type CheckoutItemInput = { variantId: string; quantity: number };

export type CheckoutCustomer = {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
};

export type CheckoutAddress = {
  line1: string;
  line2?: string;
  city: string;
  region?: string;
  postalCode?: string;
  country: string;
};

export type ValidatedOrder = {
  items: { variantId: string; sku: string; productName: string; variantLabel: string; unitPrice: number; quantity: number; lineTotal: number }[];
  customer: CheckoutCustomer;
  address: CheckoutAddress;
  subtotal: number;
  shipping: number;
  total: number;
  currency: "NGN";
};

const index = new Map<string, { variant: Variant; productName: string }>();
for (const product of products) {
  for (const variant of product.variants) {
    index.set(variant.id, { variant, productName: product.name });
  }
}

const isString = (value: unknown, max = 200): value is string =>
  typeof value === "string" && value.trim().length > 0 && value.trim().length <= max;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateOrder(
  input: unknown,
): { ok: true; order: ValidatedOrder } | { ok: false; status: number; message: string } {
  if (!input || typeof input !== "object") {
    return { ok: false, status: 400, message: "The order payload is missing." };
  }

  const payload = input as {
    items?: unknown;
    customer?: Partial<CheckoutCustomer>;
    address?: Partial<CheckoutAddress>;
  };

  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    return { ok: false, status: 400, message: "The bag is empty." };
  }
  if (payload.items.length > 20) {
    return { ok: false, status: 400, message: "Too many line items in one order." };
  }

  const items: ValidatedOrder["items"] = [];
  let subtotal = 0;

  for (const raw of payload.items) {
    if (!raw || typeof raw !== "object") {
      return { ok: false, status: 400, message: "A line item is malformed." };
    }
    const { variantId, quantity } = raw as CheckoutItemInput;
    if (!isString(variantId)) {
      return { ok: false, status: 400, message: "A line item has no variant." };
    }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      return { ok: false, status: 400, message: "Quantities must be whole numbers between 1 and 10." };
    }

    const entry = index.get(variantId);
    if (!entry) {
      return { ok: false, status: 409, message: "One of the products is no longer in the catalog." };
    }
    if (entry.variant.stock < quantity) {
      return {
        ok: false,
        status: 409,
        message: `${entry.productName} has only ${entry.variant.stock} left in that option.`,
      };
    }

    const lineTotal = entry.variant.price * quantity;
    subtotal += lineTotal;
    items.push({
      variantId,
      sku: entry.variant.sku,
      productName: entry.productName,
      variantLabel: Object.values(entry.variant.options).join(" / "),
      unitPrice: entry.variant.price,
      quantity,
      lineTotal,
    });
  }

  const customer = payload.customer ?? {};
  if (!isString(customer.email) || !EMAIL.test(customer.email.trim())) {
    return { ok: false, status: 400, message: "A valid email address is required." };
  }
  if (!isString(customer.firstName, 80) || !isString(customer.lastName, 80)) {
    return { ok: false, status: 400, message: "First and last name are required." };
  }

  const address = payload.address ?? {};
  if (!isString(address.line1) || !isString(address.city) || !isString(address.country)) {
    return { ok: false, status: 400, message: "A delivery address, city and country are required." };
  }
  if (address.country.trim().toLowerCase() !== "nigeria") {
    return { ok: false, status: 400, message: "Cloud currently delivers within Nigeria only." };
  }

  const shipping = shippingFor(subtotal);

  return {
    ok: true,
    order: {
      items,
      customer: {
        email: customer.email.trim().toLowerCase(),
        firstName: customer.firstName.trim(),
        lastName: customer.lastName.trim(),
        phone: isString(customer.phone, 40) ? customer.phone.trim() : undefined,
      },
      address: {
        line1: address.line1.trim(),
        line2: isString(address.line2) ? address.line2.trim() : undefined,
        city: address.city.trim(),
        region: isString(address.region) ? address.region.trim() : undefined,
        postalCode: isString(address.postalCode, 24) ? address.postalCode.trim() : undefined,
        country: address.country.trim(),
      },
      subtotal,
      shipping,
      total: subtotal + shipping,
      currency: "NGN",
    },
  };
}

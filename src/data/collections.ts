import type { Collection } from "@/lib/types";

/**
 * Seed categories. The storefront reads collections from the catalogue, so
 * new categories added in Sanity need no code changes here.
 */
export const collections: Collection[] = [
  {
    slug: "lighting",
    name: "Lighting",
    eyebrow: "Lighting",
    tagline: "Better light, quietly.",
    description:
      "Bulbs, lamps and strips that make a room feel finished. Warm where it matters, bright where you need it, and simple enough to live with every day.",
    image: "/products/halo-bulb.png",
  },
  {
    slug: "power",
    name: "Power",
    eyebrow: "Power",
    tagline: "The quiet infrastructure.",
    description:
      "The plugs, strips and cubes that keep everything else running. Proper surge protection, useful port layouts and no cable spaghetti.",
    image: "/products/plug-mini.png",
  },
  {
    slug: "kitchen",
    name: "Kitchen",
    eyebrow: "Kitchen",
    tagline: "Daily work, made easier.",
    description:
      "Small appliances for the meals you actually make. Fewer modes, better controls, and parts that are easy to clean after a long day.",
    image: "/products/kettle-one.png",
  },
  {
    slug: "wear",
    name: "Wear",
    eyebrow: "Wear",
    tagline: "Off-duty, considered.",
    description:
      "The first Cloud Wear capsule: heavyweight cotton, a roomy hoodie and a canvas tote. Made to be worn hard and washed often.",
    image: "/products/everyday-tee.png",
  },
];

export const collectionBySlug = (slug: string) => collections.find((collection) => collection.slug === slug);

import type { Collection } from "@/lib/types";

export const collections: Collection[] = [
  {
    slug: "audio",
    name: "Audio",
    eyebrow: "01 / Audio",
    tagline: "Quiet, on purpose.",
    description:
      "Headphones, earbuds and speakers chosen for tuning rather than marketing. Every model here is one we would keep on our own desk.",
    image: "/products/airpods-max.jpg",
  },
  {
    slug: "computing",
    name: "Computing",
    eyebrow: "02 / Computing",
    tagline: "The quiet workhorses.",
    description:
      "Machines and input devices for people who spend their day inside them. Sensible ports, real key travel, no gimmicks.",
    image: "/products/macbook-air.jpg",
  },
  {
    slug: "mobile",
    name: "Mobile",
    eyebrow: "03 / Mobile",
    tagline: "Small things, made well.",
    description:
      "Phones, tablets and readers for the hours away from a desk. We stock fewer of them so each one earns its place.",
    image: "/products/iphone-15-pro.jpg",
  },
  {
    slug: "imaging",
    name: "Imaging",
    eyebrow: "04 / Imaging",
    tagline: "For people who look twice.",
    description:
      "Mirrorless bodies with honest colour science and controls you can learn by touch. Lenses and bodies sold separately.",
    image: "/products/fujifilm-x-t5.jpg",
  },
  {
    slug: "gaming",
    name: "Gaming",
    eyebrow: "05 / Gaming",
    tagline: "Play, without the spectacle.",
    description:
      "Consoles, handhelds and controllers that respect your time. Chosen for build quality first, frame rates second.",
    image: "/products/steam-deck.jpg",
  },
];

export const collectionBySlug = (slug: string) => collections.find((c) => c.slug === slug);

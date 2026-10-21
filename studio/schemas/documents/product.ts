import { defineArrayMember, defineField, defineType } from "sanity";

export const product = defineType({
  name: "product",
  title: "Product",
  type: "document",
  groups: [
    { name: "basics", title: "Basics", default: true },
    { name: "media", title: "Photography" },
    { name: "commerce", title: "Variants & stock" },
    { name: "content", title: "Editorial" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "name",
      type: "string",
      group: "basics",
      validation: (rule) => rule.required().max(70),
    }),
    defineField({
      name: "slug",
      type: "slug",
      group: "basics",
      options: { source: "name", maxLength: 80 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "brand",
      type: "string",
      group: "basics",
      validation: (rule) => rule.required().max(40),
    }),
    defineField({
      name: "collection",
      type: "reference",
      to: [{ type: "collection" }],
      group: "basics",
      validation: (rule) => rule.required().error("Every product belongs to one department."),
    }),
    defineField({
      name: "status",
      title: "Publishing status",
      type: "string",
      group: "basics",
      options: {
        list: [
          { title: "Published", value: "published" },
          { title: "Draft", value: "draft" },
          { title: "Archived", value: "archived" },
        ],
        layout: "radio",
      },
      initialValue: "draft",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "summary",
      type: "text",
      rows: 2,
      group: "basics",
      description: "One sentence used on cards, search results and the product page lead.",
      validation: (rule) => rule.required().max(180),
    }),
    defineField({
      name: "releasedAt",
      title: "Release date",
      type: "date",
      group: "basics",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "flags",
      title: "Merchandising",
      type: "object",
      group: "basics",
      options: { columns: 1 },
      fields: [
        defineField({ name: "featured", title: "Featured", type: "boolean", initialValue: false }),
        defineField({ name: "newArrival", title: "New arrival", type: "boolean", initialValue: false }),
        defineField({ name: "bestseller", title: "Shortlist / bestseller", type: "boolean", initialValue: false }),
      ],
    }),
    defineField({
      name: "images",
      type: "array",
      group: "media",
      of: [defineArrayMember({ type: "cloudinaryImage" })],
      validation: (rule) => rule.required().min(1).max(6).error("At least one image is required."),
    }),
    defineField({
      name: "variants",
      type: "array",
      group: "commerce",
      of: [defineArrayMember({ type: "variant" })],
      validation: (rule) =>
        rule
          .required()
          .min(1)
          .custom((variants: { id?: string }[] | undefined) => {
            if (!variants) return "At least one variant is required.";
            const ids = variants.map((variant) => variant.id).filter(Boolean);
            return new Set(ids).size === ids.length ? true : "Variant IDs must be unique within a product.";
          }),
    }),
    defineField({
      name: "filters",
      title: "Filter facets",
      type: "object",
      group: "commerce",
      description: "These power the collection filters. Keep the vocabulary consistent across the department.",
      fields: [
        defineField({
          name: "type",
          type: "string",
          options: {
            list: [
              "Over-ear",
              "In-ear",
              "Smart speaker",
              "Laptop",
              "Keyboard",
              "Mouse",
              "Phone",
              "Tablet",
              "E-reader",
              "Mirrorless",
              "Console",
              "Handheld",
              "Controller",
            ],
          },
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "connectivity",
          type: "string",
          options: { list: ["Wireless", "Wired"] },
        }),
      ],
    }),
    defineField({
      name: "highlights",
      title: "Highlights",
      type: "array",
      group: "content",
      of: [defineArrayMember({ type: "string" })],
      description: "Three to five short, factual lines. No marketing adjectives.",
      validation: (rule) => rule.min(2).max(6),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "array",
      group: "content",
      of: [defineArrayMember({ type: "text", rows: 4 })],
      description: "Two or three paragraphs. One array item per paragraph.",
      validation: (rule) => rule.min(1).max(4),
    }),
    defineField({
      name: "specs",
      type: "array",
      group: "content",
      of: [defineArrayMember({ type: "spec" })],
      description: "Electronics specification table. Keep the label vocabulary consistent within a department.",
      validation: (rule) => rule.min(3).max(14),
    }),
    defineField({
      name: "seo",
      type: "seo",
      group: "seo",
    }),
  ],
  preview: {
    select: {
      title: "name",
      brand: "brand",
      status: "status",
      media: "images.0",
      price: "variants.0.price",
    },
    prepare: ({ title, brand, status, media, price }) => ({
      title,
      subtitle: `${brand ?? "—"} · ${status ?? "draft"}${price ? ` · $${(price / 100).toLocaleString()}` : ""}`,
      media,
    }),
  },
  orderings: [
    { title: "Newest release", name: "releasedAtDesc", by: [{ field: "releasedAt", direction: "desc" }] },
    { title: "Name A–Z", name: "nameAsc", by: [{ field: "name", direction: "asc" }] },
  ],
});

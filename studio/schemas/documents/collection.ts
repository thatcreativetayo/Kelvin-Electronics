import { defineField, defineType } from "sanity";

export const collection = defineType({
  name: "collection",
  title: "Collection",
  type: "document",
  fields: [
    defineField({
      name: "name",
      type: "string",
      validation: (rule) => rule.required().max(40),
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "name", maxLength: 40 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "eyebrow",
      title: "Eyebrow",
      type: "string",
      description: "e.g. 01 / Audio",
      validation: (rule) => rule.max(32),
    }),
    defineField({
      name: "tagline",
      type: "string",
      validation: (rule) => rule.required().max(60),
    }),
    defineField({
      name: "description",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required().max(240),
    }),
    defineField({
      name: "image",
      type: "cloudinaryImage",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "position",
      type: "number",
      description: "Order in the navigation and homepage departments rail.",
      validation: (rule) => rule.required().integer().min(1),
    }),
    defineField({
      name: "showInNavigation",
      title: "Show in header navigation",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "seo",
      type: "seo",
    }),
  ],
  orderings: [{ title: "Position", name: "position", by: [{ field: "position", direction: "asc" }] }],
  preview: {
    select: { title: "name", subtitle: "tagline", media: "image" },
  },
});

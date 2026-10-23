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
      description: "e.g. 01 / Lighting",
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
      name: "tone",
      title: "Colour block",
      type: "string",
      description: "Background behind the collection image and product stages.",
      options: {
        list: [
          { title: "Sky", value: "#dbe7f6" },
          { title: "Butter", value: "#f0e3b5" },
          { title: "Clay", value: "#f0dbcd" },
          { title: "Sage", value: "#dde6d6" },
        ],
        layout: "radio",
      },
      initialValue: "#dbe7f6",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "position",
      type: "number",
      description: "Order in the navigation and homepage category grid.",
      validation: (rule) => rule.required().integer().min(1),
    }),
    defineField({
      name: "showInNavigation",
      title: "Show in navigation",
      description: "Prepared for a future navigation adapter. The current header is code-driven.",
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

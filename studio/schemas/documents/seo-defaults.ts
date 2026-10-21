import { defineField, defineType } from "sanity";

export const seoDefaults = defineType({
  name: "seoDefaults",
  title: "SEO defaults",
  type: "document",
  fields: [
    defineField({
      name: "defaultTitle",
      type: "string",
      initialValue: "KELVIN — Precision electronics",
      validation: (rule) => rule.required().max(60),
    }),
    defineField({
      name: "titleTemplate",
      type: "string",
      description: "Use %s for the page title, e.g. “%s · KELVIN”.",
      initialValue: "%s · KELVIN",
      validation: (rule) => rule.required().max(40),
    }),
    defineField({
      name: "defaultDescription",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required().max(160),
    }),
    defineField({
      name: "defaultImage",
      type: "cloudinaryImage",
      description: "Used when a page has no social image of its own. 1200 × 630 recommended.",
    }),
    defineField({
      name: "twitterHandle",
      type: "string",
      validation: (rule) => rule.max(20),
    }),
    defineField({
      name: "organisationName",
      type: "string",
      initialValue: "Kelvin Electronics Ltd",
    }),
  ],
  preview: {
    prepare: () => ({ title: "SEO defaults" }),
  },
});

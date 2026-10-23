import { defineArrayMember, defineField, defineType } from "sanity";
import { CloudinaryImageInput } from "../components/CloudinaryImageInput";

const cloudName = process.env.SANITY_STUDIO_CLOUDINARY_CLOUD_NAME;

const cloudinaryPreview = (publicId?: string, width = 200) =>
  publicId && cloudName
    ? `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto,w_${width}/${publicId}`
    : undefined;

export const cloudinaryImage = defineType({
  name: "cloudinaryImage",
  title: "Image",
  type: "object",
  fields: [
    defineField({
      name: "publicId",
      title: "Cloudinary public ID",
      type: "string",
      description: "Upload through the field below, or paste an existing public ID from the Cloudinary media library.",
      components: { input: CloudinaryImageInput },
      validation: (rule) => rule.required().error("Upload an image before publishing."),
    }),
    defineField({
      name: "alt",
      title: "Alt text",
      type: "string",
      description: "Describe the product for screen readers and image search. Do not start with “image of”.",
      validation: (rule) => rule.required().max(160).warning("Keep alt text under 160 characters."),
    }),
    defineField({
      name: "fallbackUrl",
      title: "Local fallback path",
      type: "string",
      description: "Used by the storefront when Cloudinary is not configured. For example /products/halo-bulb.png.",
      initialValue: "",
    }),
    defineField({
      name: "width",
      title: "Width",
      type: "number",
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: "height",
      title: "Height",
      type: "number",
      readOnly: true,
      hidden: true,
    }),
  ],
  preview: {
    select: { title: "alt", subtitle: "publicId" },
    prepare: ({ title, subtitle }) => ({
      title: title || "Image",
      subtitle: subtitle || "No upload yet",
      media: cloudinaryPreview(subtitle),
    }),
  },
});

export const spec = defineType({
  name: "spec",
  title: "Specification",
  type: "object",
  fields: [
    defineField({
      name: "label",
      type: "string",
      validation: (rule) => rule.required().max(48),
    }),
    defineField({
      name: "value",
      type: "string",
      validation: (rule) => rule.required().max(120),
    }),
  ],
  preview: {
    select: { title: "label", subtitle: "value" },
  },
});

export const variantOption = defineType({
  name: "variantOption",
  title: "Option",
  type: "object",
  fields: [
    defineField({
      name: "name",
      title: "Option name",
      type: "string",
      description: "Colour, Storage, Memory, Layout…",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "value",
      title: "Value",
      type: "string",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "value" },
  },
});

export const variant = defineType({
  name: "variant",
  title: "Variant",
  type: "object",
  fields: [
    defineField({
      name: "id",
      title: "Variant ID",
      type: "string",
      description:
        "Stable commerce ID shared with Supabase inventory. Lowercase, hyphenated: product-slug--option. Never change this once orders exist.",
      validation: (rule) =>
        rule
          .required()
          .regex(/^[a-z0-9-]+--[a-z0-9-]+$/, { name: "variant id", invert: false })
          .error("Use the form product-slug--option-slug."),
    }),
    defineField({
      name: "sku",
      title: "SKU",
      type: "string",
      validation: (rule) => rule.required().uppercase().max(32),
    }),
    defineField({
      name: "options",
      title: "Options",
      type: "array",
      of: [defineArrayMember({ type: "variantOption" })],
      validation: (rule) => rule.min(1).error("At least one option is required."),
    }),
    defineField({
      name: "price",
      title: "Price (kobo)",
      type: "number",
      description:
        "Integer minor units. ₦54,900 is 5490000 kobo. Prices are stored in kobo to avoid float drift.",
      validation: (rule) => rule.required().integer().positive().min(100),
    }),
    defineField({
      name: "stock",
      title: "Seed stock",
      type: "number",
      description:
        "Initial units. After launch, live stock lives in Supabase inventory_items — this field is only used to seed it.",
      validation: (rule) => rule.required().integer().min(0),
    }),
  ],
  preview: {
    select: { title: "sku", options: "options", price: "price", stock: "stock" },
    prepare: ({ title, options, price, stock }) => ({
      title: title,
      subtitle: `${(options ?? []).map((option: { value: string }) => option.value).join(" / ")} · ₦${(
        (price ?? 0) / 100
      ).toLocaleString("en-NG")} · ${stock ?? 0} in stock`,
    }),
  },
});

export const seo = defineType({
  name: "seo",
  title: "SEO",
  type: "object",
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({
      name: "title",
      title: "Meta title",
      type: "string",
      validation: (rule) => rule.max(60).warning("Titles longer than 60 characters are truncated in search results."),
    }),
    defineField({
      name: "description",
      title: "Meta description",
      type: "text",
      rows: 3,
      validation: (rule) => rule.max(160).warning("Descriptions longer than 160 characters are truncated."),
    }),
    defineField({
      name: "image",
      title: "Social image",
      type: "cloudinaryImage",
    }),
    defineField({
      name: "noIndex",
      title: "Hide from search engines",
      type: "boolean",
      initialValue: false,
    }),
  ],
});

export const link = defineType({
  name: "link",
  title: "Link",
  type: "object",
  fields: [
    defineField({
      name: "label",
      type: "string",
      validation: (rule) => rule.required().max(40),
    }),
    defineField({
      name: "href",
      type: "string",
      description: "Internal path (/collections/audio) or a full https:// URL.",
      validation: (rule) =>
        rule.required().custom((value) => {
          if (!value) return "A link target is required.";
          if (value.startsWith("/") || value.startsWith("#") || value.startsWith("https://") || value.startsWith("mailto:")) {
            return true;
          }
          return "Use a path starting with /, an anchor, mailto:, or a full https:// URL.";
        }),
    }),
  ],
  preview: {
    select: { title: "label", subtitle: "href" },
  },
});

export const heroSection = defineType({
  name: "heroSection",
  title: "Hero",
  type: "object",
  fields: [
    defineField({ name: "eyebrow", type: "string", initialValue: "Est. 2026 — Precision electronics", validation: (r) => r.max(60) }),
    defineField({
      name: "headline",
      type: "text",
      rows: 3,
      description: "Line breaks are preserved in the storefront.",
      validation: (r) => r.required().max(80),
    }),
    defineField({ name: "lead", type: "text", rows: 3, validation: (r) => r.max(220) }),
    defineField({ name: "primaryCta", title: "Primary CTA", type: "link" }),
    defineField({ name: "secondaryCta", title: "Secondary CTA", type: "link" }),
    defineField({
      name: "product",
      title: "Featured product",
      type: "reference",
      to: [{ type: "product" }],
      validation: (r) => r.required(),
    }),
    defineField({ name: "note", type: "string", description: "Caption under the image, e.g. “01 — Silver”.", validation: (r) => r.max(80) }),
  ],
  preview: {
    select: { title: "headline", subtitle: "product.name" },
  },
});

export const productRailSection = defineType({
  name: "productRailSection",
  title: "Product rail",
  type: "object",
  fields: [
    defineField({ name: "eyebrow", type: "string", validation: (r) => r.max(40) }),
    defineField({ name: "title", type: "string", validation: (r) => r.required().max(60) }),
    defineField({ name: "intro", type: "text", rows: 2, validation: (r) => r.max(200) }),
    defineField({ name: "link", title: "View-all link", type: "link" }),
    defineField({
      name: "products",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "product" }] })],
      validation: (r) => r.min(2).max(8),
    }),
    defineField({
      name: "surface",
      title: "Surface",
      type: "string",
      options: {
        list: [
          { title: "Paper", value: "paper" },
          { title: "Canvas", value: "canvas" },
        ],
        layout: "radio",
      },
      initialValue: "paper",
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "eyebrow" },
  },
});

export const editorialSection = defineType({
  name: "editorialSection",
  title: "Editorial",
  type: "object",
  fields: [
    defineField({ name: "eyebrow", type: "string", validation: (r) => r.max(40) }),
    defineField({ name: "headline", type: "text", rows: 2, validation: (r) => r.required().max(80) }),
    defineField({ name: "body", type: "text", rows: 4, validation: (r) => r.max(500) }),
    defineField({ name: "image", type: "cloudinaryImage", validation: (r) => r.required() }),
    defineField({ name: "caption", type: "string", validation: (r) => r.max(120) }),
    defineField({ name: "link", type: "link" }),
    defineField({
      name: "stats",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "stat",
          fields: [
            defineField({ name: "value", type: "string", validation: (r) => r.required().max(12) }),
            defineField({ name: "label", type: "string", validation: (r) => r.required().max(24) }),
          ],
          preview: { select: { title: "value", subtitle: "label" } },
        }),
      ],
      validation: (r) => r.max(3),
    }),
    defineField({
      name: "tone",
      type: "string",
      options: { list: [{ title: "Ink", value: "ink" }, { title: "Paper", value: "paper" }], layout: "radio" },
      initialValue: "ink",
    }),
  ],
  preview: {
    select: { title: "headline", media: "image" },
  },
});

export const serviceSection = defineType({
  name: "serviceSection",
  title: "Service band",
  type: "object",
  fields: [
    defineField({ name: "title", type: "string", initialValue: "Before you order", validation: (r) => r.max(60) }),
    defineField({
      name: "items",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "serviceItem",
          fields: [
            defineField({ name: "title", type: "string", validation: (r) => r.required().max(30) }),
            defineField({ name: "body", type: "text", rows: 3, validation: (r) => r.required().max(260) }),
            defineField({
              name: "icon",
              type: "string",
              options: {
                list: [
                  { title: "Delivery", value: "truck" },
                  { title: "Returns", value: "returns" },
                  { title: "Warranty", value: "shield" },
                ],
              },
              initialValue: "truck",
            }),
          ],
          preview: { select: { title: "title", subtitle: "body" } },
        }),
      ],
      validation: (r) => r.min(1).max(4),
    }),
  ],
  preview: {
    select: { title: "title" },
  },
});

export const sectionTypes = [heroSection, productRailSection, editorialSection, serviceSection];

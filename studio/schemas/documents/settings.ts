import { defineArrayMember, defineField, defineType } from "sanity";

export const settings = defineType({
  name: "settings",
  title: "Brand & settings",
  type: "document",
  groups: [
    { name: "brand", title: "Brand", default: true },
    { name: "contact", title: "Contact" },
    { name: "policies", title: "Policies" },
  ],
  fields: [
    defineField({
      name: "brandName",
      type: "string",
      group: "brand",
      initialValue: "cloud",
      validation: (rule) => rule.required().max(24),
    }),
    defineField({
      name: "tagline",
      type: "string",
      group: "brand",
      initialValue: "The good stuff, brought home",
      validation: (rule) => rule.max(60),
    }),
    defineField({
      name: "description",
      type: "text",
      rows: 3,
      group: "brand",
      validation: (rule) => rule.max(240),
    }),
    defineField({
      name: "currency",
      type: "string",
      group: "brand",
      options: { list: ["NGN"] },
      initialValue: "NGN",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "contactEmail",
      type: "string",
      group: "contact",
      validation: (rule) => rule.required().email(),
    }),
    defineField({ name: "contactPhone", type: "string", group: "contact" }),
    defineField({
      name: "address",
      type: "text",
      rows: 3,
      group: "contact",
    }),
    defineField({
      name: "social",
      type: "array",
      group: "contact",
      of: [defineArrayMember({ type: "link" })],
      validation: (rule) => rule.max(4),
    }),
    defineField({
      name: "policies",
      type: "array",
      group: "policies",
      of: [
        defineArrayMember({
          type: "object",
          name: "policy",
          fields: [
            defineField({
              name: "key",
              type: "string",
              options: { list: ["delivery", "returns", "warranty"] },
              validation: (r) => r.required(),
            }),
            defineField({ name: "title", type: "string", validation: (r) => r.required().max(40) }),
            defineField({ name: "body", type: "text", rows: 3, validation: (r) => r.required().max(260) }),
          ],
          preview: { select: { title: "title", subtitle: "body" } },
        }),
      ],
      validation: (rule) => rule.max(3),
    }),
  ],
  preview: {
    prepare: () => ({ title: "Brand & settings" }),
  },
});

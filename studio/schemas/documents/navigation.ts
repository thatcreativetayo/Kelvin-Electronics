import { defineArrayMember, defineField, defineType } from "sanity";

export const navigation = defineType({
  name: "navigation",
  title: "Navigation",
  type: "document",
  fields: [
    defineField({
      name: "announcement",
      type: "string",
      description: "The thin bar above the header. Leave empty to hide it.",
      validation: (rule) => rule.max(90),
    }),
    defineField({
      name: "announcementSecondary",
      type: "string",
      validation: (rule) => rule.max(90),
    }),
    defineField({
      name: "headerLinks",
      title: "Header links",
      type: "array",
      of: [defineArrayMember({ type: "link" })],
      validation: (rule) => rule.max(7),
    }),
    defineField({
      name: "footerColumns",
      title: "Footer columns",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "footerColumn",
          fields: [
            defineField({ name: "title", type: "string", validation: (r) => r.required().max(30) }),
            defineField({
              name: "links",
              type: "array",
              of: [defineArrayMember({ type: "link" })],
              validation: (r) => r.min(1).max(7),
            }),
          ],
          preview: { select: { title: "title", subtitle: "links.0.label" } },
        }),
      ],
      validation: (rule) => rule.max(4),
    }),
    defineField({
      name: "contactEmail",
      type: "string",
      validation: (rule) => rule.email(),
    }),
    defineField({ name: "contactPhone", type: "string" }),
    defineField({ name: "legalLine", type: "string", validation: (rule) => rule.max(120) }),
  ],
  preview: {
    prepare: () => ({ title: "Navigation & footer" }),
  },
});

import { defineArrayMember, defineField, defineType } from "sanity";

export const homepage = defineType({
  name: "homepage",
  title: "Homepage",
  type: "document",
  fields: [
    defineField({
      name: "title",
      type: "string",
      initialValue: "Homepage",
      readOnly: true,
    }),
    defineField({
      name: "sections",
      title: "Sections",
      type: "array",
      description:
        "Drag to reorder. Each section is rendered by the storefront in this order; empty sections are skipped.",
      of: [
        defineArrayMember({ type: "heroSection" }),
        defineArrayMember({ type: "productRailSection" }),
        defineArrayMember({ type: "editorialSection" }),
        defineArrayMember({ type: "serviceSection" }),
      ],
      validation: (rule) => rule.min(1).max(8),
    }),
    defineField({ name: "seo", type: "seo" }),
  ],
  preview: {
    prepare: () => ({ title: "Homepage sections" }),
  },
});

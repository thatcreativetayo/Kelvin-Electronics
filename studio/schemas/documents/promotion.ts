import { defineField, defineType } from "sanity";

export const promotion = defineType({
  name: "promotion",
  title: "Promotion",
  type: "document",
  fields: [
    defineField({
      name: "title",
      type: "string",
      description: "Internal name. Not shown to customers.",
      validation: (rule) => rule.required().max(60),
    }),
    defineField({
      name: "active",
      type: "boolean",
      initialValue: false,
      description: "Only one announcement promotion should be active at a time.",
    }),
    defineField({
      name: "placement",
      type: "string",
      options: {
        list: [
          { title: "Announcement bar", value: "announcement" },
          { title: "Homepage banner", value: "homepage" },
        ],
        layout: "radio",
      },
      initialValue: "announcement",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "message",
      type: "string",
      validation: (rule) => rule.required().max(90),
    }),
    defineField({
      name: "link",
      type: "link",
    }),
    defineField({
      name: "startsAt",
      type: "datetime",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "endsAt",
      type: "datetime",
      validation: (rule) =>
        rule.required().custom((value, context) => {
          const start = (context.document?.startsAt as string | undefined) ?? "";
          if (!value || !start) return true;
          return new Date(value) > new Date(start) ? true : "The end must be after the start.";
        }),
    }),
  ],
  preview: {
    select: { title: "title", active: "active", placement: "placement", message: "message" },
    prepare: ({ title, active, placement, message }) => ({
      title,
      subtitle: `${active ? "Active" : "Inactive"} · ${placement} · ${message}`,
    }),
  },
});

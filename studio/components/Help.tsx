import { Box, Card, Heading, Stack, Text } from "@sanity/ui";

const guide = [
  {
    title: "1 · Start with collections, not products",
    body: "Five departments are already defined. Set position 1–5 and keep the eyebrow format “01 / Audio”. The storefront sorts navigation and the homepage rail by that number.",
  },
  {
    title: "2 · A product is not publishable without media and a variant",
    body: "Validation blocks publication until at least one Cloudinary image and one variant exist. Alt text is required, because the grid relies on it when images fail.",
  },
  {
    title: "3 · Variant IDs are permanent",
    body: "The ID (product-slug--option) is written into Supabase inventory_items and order_items. Renaming it after an order exists breaks the stock link. Add a new variant instead.",
  },
  {
    title: "4 · Prices are integers in cents",
    body: "$549.00 is 54900. The storefront and checkout both work in minor units, and the checkout route recomputes totals from the catalog — never from the browser.",
  },
  {
    title: "5 · Filter facets must come from the controlled list",
    body: "Type and connectivity drive the collection filters. Adding “Over-Ear” when the rest is “Over-ear” creates a second, empty facet. Copy the spelling from an existing product.",
  },
  {
    title: "6 · Photography is signed, not pasted",
    body: "Upload through the image field. It requests a signature from the storefront, uploads directly to Cloudinary, and stores the public ID. The light box in the Studio previews it.",
  },
  {
    title: "7 · Homepage sections are a stack",
    body: "Reorder hero, rails, editorial bands and the service strip. Empty sections are skipped by the storefront. A hero must reference a product so the price and caption stay honest.",
  },
  {
    title: "8 · Publishing is explicit",
    body: "Draft products stay out of the storefront query. Set status to Published only when photography, specs, price and stock are all correct.",
  },
];

export function Help() {
  return (
    <Box padding={[4, 5, 6]} style={{ maxWidth: 900, margin: "0 auto" }}>
      <Stack space={6}>
        <Stack space={4}>
          <Text size={1} muted style={{ letterSpacing: "0.13em", textTransform: "uppercase" }}>
            KELVIN / Help
          </Text>
          <Heading size={4} style={{ letterSpacing: "-0.035em" }}>
            How this studio works.
          </Heading>
          <Text size={2} muted style={{ maxWidth: "62ch", lineHeight: 1.6 }}>
            A short operating manual for editors. The rules exist because content, commerce and photography meet
            in this dataset — a mistake here becomes a wrong price or an unsellable variant.
          </Text>
        </Stack>

        <Card padding={4} border radius={2} tone="primary">
          <Stack space={3}>
            <Text size={2} weight="semibold">
              Publishing checklist
            </Text>
            <Text size={1} style={{ lineHeight: 1.7 }}>
              One image with alt text · one variant per option · integer price · filter facets copied from a
              sibling · three or more specs · a two-paragraph description · status set to Published.
            </Text>
          </Stack>
        </Card>

        <Stack space={5}>
          {guide.map((item) => (
            <Stack key={item.title} space={2}>
              <Text size={2} weight="semibold">
                {item.title}
              </Text>
              <Text size={1} muted style={{ lineHeight: 1.7, maxWidth: "68ch" }}>
                {item.body}
              </Text>
            </Stack>
          ))}
        </Stack>

        <Card padding={4} border radius={2} tone="transparent">
          <Stack space={3}>
            <Text size={1} weight="semibold">
              Keyboard
            </Text>
            <Text size={1} muted style={{ lineHeight: 1.7 }}>
              ⌘/Ctrl + S publishes. ⌘/Ctrl + Z undoes. Hold Alt while clicking “Publish” to publish without
              closing the document. Press ⌘/Ctrl + Enter in a text field to add a new line without leaving it.
            </Text>
          </Stack>
        </Card>
      </Stack>
    </Box>
  );
}

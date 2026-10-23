import { Box, Card, Heading, Stack, Text } from "@sanity/ui";

const guide = [
  {
    title: "1 · Start with collections, not products",
    body: "Four collections are already defined. Set position 1–4 and keep the eyebrow format “01 / Lighting”. The storefront sorts the homepage category grid by that number; header navigation is currently code-driven. Each collection also needs a colour block.",
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
    title: "4 · Prices are integers in kobo",
    body: "₦18,500 is 1850000. The storefront and checkout both work in minor units, and the checkout route recomputes totals from the catalog — never from the browser.",
  },
  {
    title: "5 · Filter facets must come from the controlled list",
    body: "Type, room and fit drive the collection filters. Adding “Floor Lamp” when the rest is “Floor lamp” creates a second, empty facet. Copy the spelling from an existing product.",
  },
  {
    title: "6 · Photography is signed, not pasted",
    body: "Upload through the image field. It requests a signature from the storefront, uploads directly to Cloudinary, and stores the public ID. The light box in the Studio previews it.",
  },
  {
    title: "7 · Some schemas are not live yet",
    body: "Homepage sections, navigation, promotions and standalone pages are prepared for a later content pass. The current storefront composes those areas in code and reads only published products and collections, so editing the prepared documents will not change the live site.",
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
          <Text size={1} muted style={{ fontStyle: "italic" }}>
            Cloud / Help
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

import { useEffect, useState } from "react";
import { useClient } from "sanity";
import { Badge, Box, Card, Grid, Heading, Stack, Text } from "@sanity/ui";

type Counts = {
  products: number;
  published: number;
  collections: number;
  promotions: number;
  pages: number;
};

const empty: Counts = { products: 0, published: 0, collections: 0, promotions: 0, pages: 0 };

const sections = [
  {
    href: "/structure/products",
    title: "Products",
    body: "Variants, photography, specifications and SEO. A product needs at least one image and one variant before it can publish.",
  },
  {
    href: "/structure/collections",
    title: "Collections",
    body: "The five departments. Position controls the header nav and the homepage rail.",
  },
  {
    href: "/structure/homepage-sections",
    title: "Homepage sections",
    body: "Drag to reorder the hero, product rails, editorial bands and service strip.",
  },
  {
    href: "/structure/navigation",
    title: "Navigation",
    body: "Announcement bar, header links and footer columns. The storefront falls back to local defaults if this is empty.",
  },
];

export function Overview() {
  const client = useClient({ apiVersion: "2025-01-01" });
  const [counts, setCounts] = useState<Counts>(empty);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    client
      .fetch<Counts>(
        `{
          "products": count(*[_type == "product"]),
          "published": count(*[_type == "product" && status == "published"]),
          "collections": count(*[_type == "collection"]),
          "promotions": count(*[_type == "promotion"]),
          "pages": count(*[_type == "page"])
        }`,
      )
      .then((result) => {
        if (!cancelled) setCounts(result);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [client]);

  return (
    <Box padding={[4, 5, 6]} style={{ maxWidth: 1080, margin: "0 auto" }}>
      <Stack space={6}>
        <Stack space={4}>
          <Text size={1} style={{ fontFamily: "monospace", letterSpacing: "0.13em", textTransform: "uppercase" }} muted>
            KELVIN / Content operations
          </Text>
          <Heading size={4} style={{ letterSpacing: "-0.035em" }}>
            Good morning. Here is the state of the store.
          </Heading>
          <Text size={2} muted style={{ maxWidth: "62ch", lineHeight: 1.6 }}>
            The storefront reads published products from this dataset when it is configured and falls back to a
            local seed catalog otherwise. Nothing here is invented: counts below come from this project.
          </Text>
        </Stack>

        <Grid columns={[2, 3, 5]} gap={3}>
          {[
            { label: "Products", value: counts.products },
            { label: "Published", value: counts.published },
            { label: "Collections", value: counts.collections },
            { label: "Promotions", value: counts.promotions },
            { label: "Pages", value: counts.pages },
          ].map((stat) => (
            <Card key={stat.label} padding={4} border radius={2} tone="transparent">
              <Stack space={3}>
                <Text size={0} muted style={{ letterSpacing: "0.12em", textTransform: "uppercase" }}>
                  {stat.label}
                </Text>
                <Heading size={4} style={{ fontVariantNumeric: "tabular-nums" }}>
                  {failed ? "—" : stat.value}
                </Heading>
              </Stack>
            </Card>
          ))}
        </Grid>

        {failed && (
          <Card padding={4} border radius={2} tone="critical">
            <Text size={1}>
              Counts could not be read. Check the project ID, dataset and CORS origins for this Studio.
            </Text>
          </Card>
        )}

        <Stack space={4}>
          <FlexHeading />
          <Grid columns={[1, 2]} gap={3}>
            {sections.map((section) => (
              <Card key={section.href} padding={4} border radius={2} tone="transparent">
                <Stack space={3}>
                  <Text size={2} weight="semibold">
                    {section.title}
                  </Text>
                  <Text size={1} muted style={{ lineHeight: 1.6 }}>
                    {section.body}
                  </Text>
                  <Box>
                    <a
                      href={section.href}
                      style={{
                        fontSize: 13,
                        color: "#1e3aff",
                        textDecoration: "none",
                        borderBottom: "1px solid rgba(30,58,255,0.3)",
                        paddingBottom: 1,
                      }}
                    >
                      Open section
                    </a>
                  </Box>
                </Stack>
              </Card>
            ))}
          </Grid>
        </Stack>

        <Card padding={4} border radius={2} tone="primary">
          <Stack space={3}>
            <Badge tone="primary" fontSize={0} padding={2} style={{ alignSelf: "flex-start" }}>
              Before publishing
            </Badge>
            <Text size={2} weight="semibold">
              Variant IDs are the contract with Supabase.
            </Text>
            <Text size={1} style={{ lineHeight: 1.6 }}>
              Inventory and order lines key off the <code>product-slug--option</code> variant ID. Create the
              Supabase inventory row at the same time as the variant, and never rename an ID that has orders
              against it.
            </Text>
            <Box>
              <a href="/structure/help" style={{ fontSize: 13, color: "#1e3aff", textDecoration: "none" }}>
                Read the content guide →
              </a>
            </Box>
          </Stack>
        </Card>

        <Text size={0} muted>
          Storefront: http://localhost:3000 · Studio: http://localhost:3333
        </Text>
      </Stack>
    </Box>
  );
}

function FlexHeading() {
  return (
    <Text size={0} muted style={{ letterSpacing: "0.13em", textTransform: "uppercase" }}>
      Sections
    </Text>
  );
}

import { Flex, Text } from "@sanity/ui";

export function StudioLogo() {
  return (
    <Flex align="baseline" gap={1} paddingLeft={1}>
      <Text weight="semibold" size={2} style={{ letterSpacing: "-0.06em", fontSize: 18 }}>
        cloud
      </Text>
      <Text size={1} style={{ color: "#1f3bff", lineHeight: 1 }}>
        .
      </Text>
    </Flex>
  );
}

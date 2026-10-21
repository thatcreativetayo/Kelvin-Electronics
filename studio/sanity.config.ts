import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./schemas";
import { structure } from "./structure";
import { StudioLogo } from "./components/StudioLogo";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID ?? "kelvin-project-id";
const dataset = process.env.SANITY_STUDIO_DATASET ?? "production";

export default defineConfig({
  name: "kelvin",
  title: "KELVIN Studio",
  projectId,
  dataset,
  basePath: "/",
  plugins: [
    structureTool({ structure, defaultDocumentNode: undefined }),
    visionTool({ defaultApiVersion: "2025-01-01" }),
  ],
  schema: {
    types: schemaTypes,
    templates: (templates) => templates.filter(({ schemaType }) => !["homepage", "navigation", "settings", "seoDefaults"].includes(schemaType)),
  },
  studio: {
    components: {
      logo: StudioLogo,
    },
  },
  document: {
    // Products and collections should be created from the list views, not
    // from a global "create new" menu that hides which collection they join.
    newDocumentOptions: (prev, { creationContext }) =>
      creationContext.type === "global"
        ? prev.filter(({ templateId }) => ["product", "collection", "promotion", "page"].includes(templateId))
        : prev,
  },
});

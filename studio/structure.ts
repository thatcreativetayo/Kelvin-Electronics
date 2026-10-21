import type { StructureResolver } from "sanity/structure";
import { Overview } from "./components/Overview";
import { Help } from "./components/Help";

export const structure: StructureResolver = (S) =>
  S.list()
    .id("content")
    .title("Content")
    .items([
      S.listItem()
        .id("overview")
        .title("Overview")
        .child(S.component(Overview).title("Overview")),
      S.divider(),
      S.documentTypeListItem("product")
        .id("products")
        .title("Products"),
      S.documentTypeListItem("collection")
        .id("collections")
        .title("Collections"),
      S.listItem()
        .id("homepage-sections")
        .title("Homepage sections")
        .child(
          S.document()
            .id("homepage")
            .schemaType("homepage")
            .documentId("homepage")
            .title("Homepage sections"),
        ),
      S.listItem()
        .id("navigation")
        .title("Navigation")
        .child(
          S.document()
            .schemaType("navigation")
            .documentId("navigation")
            .title("Navigation & footer"),
        ),
      S.documentTypeListItem("promotion")
        .id("promotions")
        .title("Promotions"),
      S.documentTypeListItem("page")
        .id("pages")
        .title("Pages"),
      S.divider(),
      S.listItem()
        .id("brand-settings")
        .title("Brand & settings")
        .child(
          S.document()
            .schemaType("settings")
            .documentId("settings")
            .title("Brand & settings"),
        ),
      S.listItem()
        .id("seo")
        .title("SEO")
        .child(
          S.document()
            .schemaType("seoDefaults")
            .documentId("seoDefaults")
            .title("SEO defaults"),
        ),
      S.listItem()
        .id("help")
        .title("Help")
        .child(S.component(Help).title("Help")),
    ]);

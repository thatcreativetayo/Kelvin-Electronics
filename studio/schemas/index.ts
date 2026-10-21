import { product } from "./documents/product";
import { collection } from "./documents/collection";
import { homepage } from "./documents/homepage";
import { navigation } from "./documents/navigation";
import { promotion } from "./documents/promotion";
import { page } from "./documents/page";
import { settings } from "./documents/settings";
import { seoDefaults } from "./documents/seo-defaults";
import {
  cloudinaryImage,
  spec,
  variant,
  variantOption,
  seo,
  link,
  heroSection,
  productRailSection,
  editorialSection,
  serviceSection,
} from "./objects";

export const schemaTypes = [
  // documents
  product,
  collection,
  homepage,
  navigation,
  promotion,
  page,
  settings,
  seoDefaults,
  // objects
  cloudinaryImage,
  spec,
  variant,
  variantOption,
  seo,
  link,
  heroSection,
  productRailSection,
  editorialSection,
  serviceSection,
];

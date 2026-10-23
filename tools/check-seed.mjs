/**
 * Checks that supabase/seed.sql still mirrors the catalog variants.
 *
 * The storefront is the source of truth for the initial catalog. Supabase
 * owns live stock after launch, so this deliberately compares only the seed
 * values, not runtime inventory.
 */
import { readFile } from "node:fs/promises";

const [catalogSource, seedSource] = await Promise.all([
  readFile(new URL("../src/data/products.ts", import.meta.url), "utf8"),
  readFile(new URL("../supabase/seed.sql", import.meta.url), "utf8"),
]);

const variants = [
  ...catalogSource.matchAll(
    /id: "([^"]+)",\s*sku: "([^"]+)",\s*options: \{[^}]*\},\s*price: \d+,\s*stock: (\d+)/g,
  ),
].map((match) => ({ id: match[1], sku: match[2], stock: Number(match[3]) }));

const seed = [
  ...seedSource.matchAll(/\('([^']+)',\s*'([^']+)',\s*'([^']+)',\s*(\d+),/g),
].map((match) => ({ id: match[1], sku: match[2], slug: match[3], stock: Number(match[4]) }));

const problems = [];

if (variants.length !== 27) problems.push(`expected 27 catalog variants, parsed ${variants.length}`);
if (seed.length !== 27) problems.push(`expected 27 seed rows, parsed ${seed.length}`);

const seedById = new Map(seed.map((row) => [row.id, row]));
for (const variant of variants) {
  const row = seedById.get(variant.id);
  if (!row) {
    problems.push(`missing seed row for ${variant.id}`);
    continue;
  }
  if (row.sku !== variant.sku) problems.push(`${variant.id}: seed SKU ${row.sku} != catalog SKU ${variant.sku}`);
  if (row.stock !== variant.stock) {
    problems.push(`${variant.id}: seed stock ${row.stock} != catalog seed stock ${variant.stock}`);
  }
}

const catalogIds = new Set(variants.map((variant) => variant.id));
for (const row of seed) {
  if (!catalogIds.has(row.id)) problems.push(`seed row ${row.id} is not in the catalog`);
}

if (problems.length) {
  console.error(problems.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Seed matches the catalog: ${variants.length} variants, ${seed.length} rows.`);
}

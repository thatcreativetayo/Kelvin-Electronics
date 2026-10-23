-- Cloud inventory seed
--
-- Mirrors the variant IDs, SKUs and seed stock in src/data/products.ts.
-- Run after the migrations: supabase db reset (local) or paste into the SQL editor.
-- The conflict clause is deliberately non-destructive: re-running never resets
-- live stock that has already moved.

insert into public.inventory_items (variant_id, sku, product_slug, on_hand, reserved, safety_stock)
values
  ('halo-smart-bulb--single', 'CLD-HALO-1',   'halo-smart-bulb',   24, 0, 0),
  ('halo-smart-bulb--pair',   'CLD-HALO-2',   'halo-smart-bulb',   12, 0, 0),
  ('arc-floor-lamp--sand',    'CLD-ARC-SND',  'arc-floor-lamp',     6, 0, 0),
  ('arc-floor-lamp--ink',     'CLD-ARC-INK',  'arc-floor-lamp',     4, 0, 0),
  ('line-light-strip--3m',    'CLD-LINE-3',   'line-light-strip',  10, 0, 0),
  ('line-light-strip--5m',    'CLD-LINE-5',   'line-light-strip',   8, 0, 0),
  ('plug-mini--single',       'CLD-PLUG-1',   'plug-mini',         30, 0, 0),
  ('plug-mini--pair',         'CLD-PLUG-2',   'plug-mini',         14, 0, 0),
  ('current-4-way-strip--3m', 'CLD-CUR-3',    'current-4-way-strip', 18, 0, 0),
  ('current-4-way-strip--5m', 'CLD-CUR-5',    'current-4-way-strip', 10, 0, 0),
  ('orbit-power-cube--white', 'CLD-ORB-WHT',  'orbit-power-cube',  12, 0, 0),
  ('orbit-power-cube--ink',   'CLD-ORB-INK',  'orbit-power-cube',   8, 0, 0),
  ('kettle-one--cream',       'CLD-KET-CRM',  'kettle-one',         9, 0, 0),
  ('kettle-one--ink',         'CLD-KET-INK',  'kettle-one',         6, 0, 0),
  ('air-four--white',         'CLD-AIR-WHT',  'air-four',           7, 0, 0),
  ('air-four--ink',           'CLD-AIR-INK',  'air-four',           4, 0, 0),
  ('blend-mini--white',       'CLD-BLD-WHT',  'blend-mini',        10, 0, 0),
  ('blend-mini--sky',         'CLD-BLD-SKY',  'blend-mini',         6, 0, 0),
  ('everyday-tee--s',         'CLD-TEE-S',    'everyday-tee',       8, 0, 0),
  ('everyday-tee--m',         'CLD-TEE-M',    'everyday-tee',      14, 0, 0),
  ('everyday-tee--l',         'CLD-TEE-L',    'everyday-tee',      12, 0, 0),
  ('everyday-tee--xl',        'CLD-TEE-XL',   'everyday-tee',       6, 0, 0),
  ('cloud-hoodie--s',         'CLD-HOOD-S',   'cloud-hoodie',       5, 0, 0),
  ('cloud-hoodie--m',         'CLD-HOOD-M',   'cloud-hoodie',       9, 0, 0),
  ('cloud-hoodie--l',         'CLD-HOOD-L',   'cloud-hoodie',       7, 0, 0),
  ('cloud-hoodie--xl',        'CLD-HOOD-XL',  'cloud-hoodie',       3, 0, 0),
  ('day-tote--natural',       'CLD-TOTE-NAT', 'day-tote',          20, 0, 0)
on conflict (variant_id) do nothing;

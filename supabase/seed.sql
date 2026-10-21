-- Inventory seed
--
-- Mirrors the variant IDs and seed stock in src/data/products.ts.
-- Run after the migrations: supabase db reset (local) or paste into the SQL editor.
-- The conflict clause is deliberately non-destructive: re-running never resets
-- live stock that has already moved.

insert into public.inventory_items (variant_id, sku, product_slug, on_hand, reserved, safety_stock)
values
  ('airpods-max--silver',            'APM-SLV',        'airpods-max',            7,  0, 0),
  ('airpods-max--space',             'APM-SPG',        'airpods-max',            4,  0, 0),
  ('airpods-max--blue',              'APM-BLU',        'airpods-max',            2,  0, 0),
  ('airpods-pro--white',             'APP-WHT',        'airpods-pro',           18,  0, 0),
  ('homepod-mini--white',            'HPM-WHT',        'homepod-mini',          12,  0, 0),
  ('homepod-mini--midnight',         'HPM-MDN',        'homepod-mini',           9,  0, 0),
  ('homepod-mini--orange',           'HPM-ORG',        'homepod-mini',           3,  0, 0),
  ('macbook-air--8-256',             'MBA-M1-8-256',   'macbook-air',            6,  0, 0),
  ('macbook-air--16-512',            'MBA-M1-16-512',  'macbook-air',            3,  0, 0),
  ('magic-keyboard--us',             'MK-US',          'magic-keyboard',        14,  0, 0),
  ('logitech-mx-master-3s--graphite','MX3S-GRA',       'logitech-mx-master-3s', 11,  0, 0),
  ('logitech-mx-master-3s--pale',    'MX3S-PLG',       'logitech-mx-master-3s',  5,  0, 0),
  ('iphone-15-pro--128-natural',     'IP15P-128-NAT',  'iphone-15-pro',          5,  0, 0),
  ('iphone-15-pro--256-natural',     'IP15P-256-NAT',  'iphone-15-pro',          4,  0, 0),
  ('iphone-15-pro--256-blue',        'IP15P-256-BLU',  'iphone-15-pro',          2,  0, 0),
  ('iphone-15-pro--512-black',       'IP15P-512-BLK',  'iphone-15-pro',          0,  0, 0),
  ('ipad-pro--128-silver',           'IPP11-128-SLV',  'ipad-pro',               6,  0, 0),
  ('ipad-pro--256-space',            'IPP11-256-SPG',  'ipad-pro',               2,  0, 0),
  ('kindle-paperwhite--16',          'KPW-16',         'kindle-paperwhite',      9,  0, 0),
  ('kindle-paperwhite--32',          'KPW-32',         'kindle-paperwhite',      3,  0, 0),
  ('sony-a7r-iv--body',              'A7RIV-BODY',     'sony-a7r-iv',            2,  0, 0),
  ('sony-a7r-iv--55mm',              'A7RIV-55',       'sony-a7r-iv',            0,  0, 0),
  ('fujifilm-x-t5--black',           'XT5-BLK',        'fujifilm-x-t5',          4,  0, 0),
  ('fujifilm-x-t5--silver',          'XT5-SLV',        'fujifilm-x-t5',          2,  0, 0),
  ('nintendo-switch-oled--white',    'NSW-OLED-WHT',   'nintendo-switch-oled',   8,  0, 0),
  ('nintendo-switch-oled--neon',     'NSW-OLED-NEO',   'nintendo-switch-oled',   0,  0, 0),
  ('steam-deck--256',                'SD-256',         'steam-deck',             5,  0, 0),
  ('steam-deck--512',                'SD-512',         'steam-deck',             2,  0, 0),
  ('dualsense--white',               'DS-WHT',         'dualsense',             16,  0, 0),
  ('dualsense--midnight',            'DS-MDN',         'dualsense',              7,  0, 0)
on conflict (variant_id) do nothing;

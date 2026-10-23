-- Cloud currency alignment
--
-- The storefront prices everything in Naira and stores money in kobo.
-- Supabase's money columns were named *_cents in the first draft; rename them
-- before any production data exists and make Naira the default currency.

alter table public.orders
  alter column currency set default 'NGN';

alter table public.orders rename column subtotal_cents to subtotal_kobo;
alter table public.orders rename column shipping_cents to shipping_kobo;
alter table public.orders rename column total_cents to total_kobo;

alter table public.order_items rename column unit_price_cents to unit_price_kobo;
alter table public.order_items rename column line_total_cents to line_total_kobo;

-- Recreate the order function against the renamed columns and the Cloud
-- order-number prefix. Only the service role may execute this function.
create or replace function public.create_order(
  p_email text,
  p_customer_name text,
  p_phone text,
  p_shipping_address jsonb,
  p_items jsonb,
  p_subtotal integer,
  p_shipping integer,
  p_currency text default 'NGN'
)
returns table (order_number text)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_order_id uuid;
  v_order_number text;
  v_customer_id uuid;
  v_item jsonb;
  v_variant_id text;
  v_quantity integer;
  v_available integer;
  v_computed_subtotal integer;
  v_total integer;
  v_line_count integer;
  v_distinct_count integer;
begin
  if p_email is null or position('@' in p_email) = 0 then
    raise exception 'invalid_email';
  end if;
  if p_shipping_address is null or jsonb_typeof(p_shipping_address) <> 'object' then
    raise exception 'invalid_address';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'empty_order';
  end if;
  if jsonb_array_length(p_items) > 20 then
    raise exception 'too_many_lines';
  end if;
  if p_subtotal is null or p_shipping is null or p_subtotal < 0 or p_shipping < 0 then
    raise exception 'invalid_total';
  end if;
  if upper(coalesce(p_currency, 'NGN')) <> 'NGN' then
    raise exception 'unsupported_currency';
  end if;

  select count(distinct item ->> 'variantId'), count(*)
    into v_distinct_count, v_line_count
    from jsonb_array_elements(p_items) as item;

  if v_distinct_count <> v_line_count then
    raise exception 'duplicate_variant';
  end if;

  select coalesce(sum((item ->> 'lineTotal')::integer), 0)
    into v_computed_subtotal
    from jsonb_array_elements(p_items) as item;

  if v_computed_subtotal is null or v_computed_subtotal <> p_subtotal then
    raise exception 'total_mismatch';
  end if;

  -- Lock in variant order so concurrent orders cannot deadlock each other.
  for v_item in
    select item from jsonb_array_elements(p_items) as item
    order by item ->> 'variantId'
  loop
    v_variant_id := v_item ->> 'variantId';
    v_quantity := (v_item ->> 'quantity')::integer;

    if v_quantity is null or v_quantity < 1 or v_quantity > 10 then
      raise exception 'invalid_quantity:%', v_variant_id;
    end if;

    select (on_hand - reserved - safety_stock)
      into v_available
      from public.inventory_items
      where variant_id = v_variant_id
      for update;

    if not found then
      raise exception 'unknown_variant:%', v_variant_id;
    end if;

    if v_available < v_quantity then
      raise exception 'insufficient_stock:%', v_variant_id;
    end if;
  end loop;

  select id into v_customer_id
    from public.customers
    where lower(email) = lower(p_email)
    limit 1;

  v_total := p_subtotal + p_shipping;
  v_order_number := 'CLD-' || to_char(now(), 'YYMMDD') || '-' ||
    lpad(nextval('public.order_number_seq')::text, 5, '0');

  insert into public.orders (
    order_number, customer_id, email, customer_name, phone, status,
    subtotal_kobo, shipping_kobo, total_kobo, currency, shipping_address
  ) values (
    v_order_number, v_customer_id, lower(p_email), p_customer_name, p_phone, 'pending',
    p_subtotal, p_shipping, v_total, 'NGN', p_shipping_address
  )
  returning id into v_order_id;

  for v_item in select item from jsonb_array_elements(p_items) as item
  loop
    v_variant_id := v_item ->> 'variantId';
    v_quantity := (v_item ->> 'quantity')::integer;

    insert into public.order_items (
      order_id, variant_id, sku, product_name, variant_label,
      unit_price_kobo, quantity, line_total_kobo
    ) values (
      v_order_id,
      v_variant_id,
      v_item ->> 'sku',
      v_item ->> 'productName',
      v_item ->> 'variantLabel',
      (v_item ->> 'unitPrice')::integer,
      v_quantity,
      (v_item ->> 'lineTotal')::integer
    );

    update public.inventory_items
      set reserved = reserved + v_quantity
      where variant_id = v_variant_id;

    insert into public.stock_movements (variant_id, delta, reason, order_id, note)
    values (v_variant_id, -v_quantity, 'reservation', v_order_id, v_order_number);
  end loop;

  return query select v_order_number;
end;
$$;

revoke all on function public.create_order(text, text, text, jsonb, jsonb, integer, integer, text) from public;
revoke all on function public.create_order(text, text, text, jsonb, jsonb, integer, integer, text) from anon;
revoke all on function public.create_order(text, text, text, jsonb, jsonb, integer, integer, text) from authenticated;
grant execute on function public.create_order(text, text, text, jsonb, jsonb, integer, integer, text) to service_role;

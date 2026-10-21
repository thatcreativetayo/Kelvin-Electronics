-- Atomic order capture.
--
-- Only the service role may execute this function. It:
--   1. validates and locks inventory rows in a deterministic order,
--   2. rejects the whole order if any line lacks stock,
--   3. writes the order + immutable line snapshots,
--   4. reserves stock and appends stock movements.
--
-- Card capture belongs to the payment provider. The reservation is released
-- by an admin function or a payment webhook when an order is cancelled.

create or replace function public.create_order(
  p_email text,
  p_customer_name text,
  p_phone text,
  p_shipping_address jsonb,
  p_items jsonb,
  p_subtotal integer,
  p_shipping integer,
  p_currency text default 'USD'
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
  v_order_number := 'KLV-' || to_char(now(), 'YYMMDD') || '-' ||
    lpad(nextval('public.order_number_seq')::text, 5, '0');

  insert into public.orders (
    order_number, customer_id, email, customer_name, phone, status,
    subtotal_cents, shipping_cents, total_cents, currency, shipping_address
  ) values (
    v_order_number, v_customer_id, lower(p_email), p_customer_name, p_phone, 'pending',
    p_subtotal, p_shipping, v_total, upper(substr(p_currency, 1, 3)), p_shipping_address
  )
  returning id into v_order_id;

  for v_item in select item from jsonb_array_elements(p_items) as item
  loop
    v_variant_id := v_item ->> 'variantId';
    v_quantity := (v_item ->> 'quantity')::integer;

    insert into public.order_items (
      order_id, variant_id, sku, product_name, variant_label,
      unit_price_cents, quantity, line_total_cents
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

/*
 * Release a reservation (cancellation or expired payment).
 * Kept as an explicit, auditable action rather than an update by hand.
 */
create or replace function public.release_order(p_order_id uuid, p_note text default 'released')
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_item record;
begin
  if not exists (select 1 from public.orders where id = p_order_id and status in ('pending', 'cancelled')) then
    raise exception 'order_not_releasable';
  end if;

  for v_item in
    select variant_id, quantity from public.order_items where order_id = p_order_id
  loop
    update public.inventory_items
      set reserved = greatest(0, reserved - v_item.quantity)
      where variant_id = v_item.variant_id;

    insert into public.stock_movements (variant_id, delta, reason, order_id, note)
    values (v_item.variant_id, v_item.quantity, 'release', p_order_id, p_note);
  end loop;

  update public.orders set status = 'cancelled' where id = p_order_id;
end;
$$;

revoke all on function public.release_order(uuid, text) from public, anon, authenticated;
grant execute on function public.release_order(uuid, text) to service_role;

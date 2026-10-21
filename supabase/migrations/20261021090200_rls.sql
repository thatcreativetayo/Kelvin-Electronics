-- Row level security
--
-- The storefront's public reads go through the server (service role) for
-- stock, so only inventory is exposed publicly. Orders are written exclusively
-- by the create_order function; no client role can insert an order or change
-- its totals.

alter table public.customers enable row level security;
alter table public.addresses enable row level security;
alter table public.inventory_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.stock_movements enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;

/* ---------------------------------------------------------------- */
/*  Inventory: read-only public availability                        */
/* ---------------------------------------------------------------- */

revoke all on public.inventory_items from anon, authenticated;
grant select on public.inventory_items to anon, authenticated;

drop policy if exists "inventory is publicly readable" on public.inventory_items;
create policy "inventory is publicly readable"
  on public.inventory_items
  for select
  to anon, authenticated
  using (true);

/* ---------------------------------------------------------------- */
/*  Customers & addresses                                           */
/* ---------------------------------------------------------------- */

revoke all on public.customers from anon;
grant select, update on public.customers to authenticated;

drop policy if exists "customers read own profile" on public.customers;
create policy "customers read own profile"
  on public.customers for select to authenticated
  using (auth.uid() = id);

drop policy if exists "customers update own profile" on public.customers;
create policy "customers update own profile"
  on public.customers for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

revoke all on public.addresses from anon;
grant select, insert, update, delete on public.addresses to authenticated;

drop policy if exists "addresses are owned by the customer" on public.addresses;
create policy "addresses are owned by the customer"
  on public.addresses for all to authenticated
  using (auth.uid() = customer_id)
  with check (auth.uid() = customer_id);

/* ---------------------------------------------------------------- */
/*  Orders: read your own, never write from the client              */
/* ---------------------------------------------------------------- */

revoke all on public.orders from anon;
revoke insert, update, delete on public.orders from authenticated;
grant select on public.orders to authenticated;

drop policy if exists "orders read own" on public.orders;
create policy "orders read own"
  on public.orders for select to authenticated
  using (customer_id = auth.uid());

revoke all on public.order_items from anon;
revoke insert, update, delete on public.order_items from authenticated;
grant select on public.order_items to authenticated;

drop policy if exists "order items read own" on public.order_items;
create policy "order items read own"
  on public.order_items for select to authenticated
  using (
    exists (
      select 1 from public.orders
      where public.orders.id = public.order_items.order_id
        and public.orders.customer_id = auth.uid()
    )
  );

revoke all on public.stock_movements from anon, authenticated;

/* ---------------------------------------------------------------- */
/*  Carts: signed-in only                                           */
/* ---------------------------------------------------------------- */

revoke all on public.carts from anon;
grant select, insert, update, delete on public.carts to authenticated;

drop policy if exists "carts owned by customer" on public.carts;
create policy "carts owned by customer"
  on public.carts for all to authenticated
  using (customer_id = auth.uid())
  with check (customer_id = auth.uid());

revoke all on public.cart_items from anon;
grant select, insert, update, delete on public.cart_items to authenticated;

drop policy if exists "cart items follow their cart" on public.cart_items;
create policy "cart items follow their cart"
  on public.cart_items for all to authenticated
  using (
    exists (
      select 1 from public.carts
      where public.carts.id = public.cart_items.cart_id
        and public.carts.customer_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.carts
      where public.carts.id = public.cart_items.cart_id
        and public.carts.customer_id = auth.uid()
    )
  );

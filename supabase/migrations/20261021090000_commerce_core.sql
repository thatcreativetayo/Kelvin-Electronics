-- Initial commerce schema (draft column names).
-- Sanity owns content. Supabase owns inventory, customers, carts and orders.
-- The Cloud currency migration normalises money columns to kobo and currency to NGN.
-- Every variant_id here is the same string used by the Sanity variant field.

create extension if not exists "pgcrypto";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type public.order_status as enum ('pending', 'paid', 'fulfilled', 'cancelled', 'refunded');
  end if;
  if not exists (select 1 from pg_type where typname = 'stock_reason') then
    create type public.stock_reason as enum ('seed', 'reservation', 'release', 'restock', 'correction', 'return');
  end if;
end $$;

/* ---------------------------------------------------------------- */
/*  Customers                                                       */
/* ---------------------------------------------------------------- */

create table if not exists public.customers (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete cascade,
  label text,
  line1 text not null,
  line2 text,
  city text not null,
  region text,
  postal_code text,
  country text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

/* ---------------------------------------------------------------- */
/*  Inventory                                                       */
/* ---------------------------------------------------------------- */

create table if not exists public.inventory_items (
  variant_id text primary key,
  sku text not null unique,
  product_slug text not null,
  on_hand integer not null default 0 check (on_hand >= 0),
  reserved integer not null default 0 check (reserved >= 0),
  safety_stock integer not null default 0 check (safety_stock >= 0),
  updated_at timestamptz not null default now(),
  constraint reserved_within_stock check (reserved <= on_hand)
);

create index if not exists inventory_items_product_slug_idx
  on public.inventory_items (product_slug);

/* ---------------------------------------------------------------- */
/*  Orders                                                          */
/* ---------------------------------------------------------------- */

create sequence if not exists public.order_number_seq as bigint start with 10001;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_id uuid references public.customers (id) on delete set null,
  email text not null,
  customer_name text not null,
  phone text,
  status public.order_status not null default 'pending',
  subtotal_cents integer not null check (subtotal_cents >= 0),
  shipping_cents integer not null default 0 check (shipping_cents >= 0),
  total_cents integer not null check (total_cents >= 0),
  currency char(3) not null default 'USD',
  shipping_address jsonb not null,
  payment_intent text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_email_idx on public.orders (lower(email));
create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_customer_id_idx on public.orders (customer_id);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  variant_id text not null,
  sku text not null,
  product_name text not null,
  variant_label text,
  unit_price_cents integer not null check (unit_price_cents >= 0),
  quantity integer not null check (quantity between 1 and 10),
  line_total_cents integer not null check (line_total_cents >= 0),
  created_at timestamptz not null default now()
);

create index if not exists order_items_order_id_idx on public.order_items (order_id);
create index if not exists order_items_variant_id_idx on public.order_items (variant_id);

/* ---------------------------------------------------------------- */
/*  Stock movements — an audit trail, never overwritten             */
/* ---------------------------------------------------------------- */

create table if not exists public.stock_movements (
  id bigint generated always as identity primary key,
  variant_id text not null references public.inventory_items (variant_id) on delete cascade,
  delta integer not null,
  reason public.stock_reason not null,
  order_id uuid references public.orders (id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists stock_movements_variant_idx
  on public.stock_movements (variant_id, created_at desc);

/* ---------------------------------------------------------------- */
/*  Carts — for signed-in customers. Guests use the local cart.     */
/* ---------------------------------------------------------------- */

create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists carts_customer_idx on public.carts (customer_id);

create table if not exists public.cart_items (
  cart_id uuid not null references public.carts (id) on delete cascade,
  variant_id text not null,
  quantity integer not null check (quantity between 1 and 10),
  added_at timestamptz not null default now(),
  primary key (cart_id, variant_id)
);

/* ---------------------------------------------------------------- */
/*  updated_at                                                      */
/* ---------------------------------------------------------------- */

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists customers_touch on public.customers;
create trigger customers_touch before update on public.customers
  for each row execute function public.touch_updated_at();

drop trigger if exists inventory_touch on public.inventory_items;
create trigger inventory_touch before update on public.inventory_items
  for each row execute function public.touch_updated_at();

drop trigger if exists orders_touch on public.orders;
create trigger orders_touch before update on public.orders
  for each row execute function public.touch_updated_at();

drop trigger if exists carts_touch on public.carts;
create trigger carts_touch before update on public.carts
  for each row execute function public.touch_updated_at();

/* ---------------------------------------------------------------- */
/*  Auth → customer profile                                          */
/* ---------------------------------------------------------------- */

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.customers (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

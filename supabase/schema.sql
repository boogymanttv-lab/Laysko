-- Изпълни в Supabase -> SQL Editor

create extension if not exists "pgcrypto";

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text not null default '',
  price_cents integer not null check (price_cents >= 0),
  compare_at_cents integer,                 -- зачертана "стара" цена (по избор)
  supplier_cost_cents integer,              -- какво плащаш на Etsy/Temu (само за теб)
  images text[] not null default '{}',
  category text,                            -- категория за филтъра (по избор)
  source text not null default 'other',     -- etsy | temu | other
  source_url text,                          -- линк към доставчика (само за теб)
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  stripe_session_id text unique not null,
  product_id uuid references products(id) on delete set null,
  product_title text not null,
  quantity integer not null default 1,
  amount_cents integer not null,
  items jsonb,                              -- [{product_id,title,quantity,unit_cents}]
  status text not null default 'paid',      -- paid | ordered | shipped | cancelled
  customer_name text,
  customer_email text,
  customer_phone text,
  shipping_address jsonb,
  tracking_number text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists site_settings (
  key text primary key,
  value text,
  updated_at timestamptz not null default now()
);
alter table site_settings enable row level security;

alter table products enable row level security;
alter table orders enable row level security;

-- Публично четене само на активни продукти (source_url остава достъпен през anon ключа,
-- затова сайтът чете през сървъра със service role и не излага тази колона).
drop policy if exists "public read active products" on products;
create policy "public read active products" on products
  for select using (active = true);

-- orders: без политики => достъп само през service role (сървъра).

-- Изпълни в Supabase -> SQL Editor (категории, които се създават от админ панела)

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  image_url text,
  sort int not null default 0,
  created_at timestamptz not null default now()
);

alter table categories enable row level security;
-- Без политики: достъп само през сървъра (service role).

-- Прехвърля категориите, които вече са въведени в продуктите
insert into categories (name)
select distinct category from products
where category is not null and category <> ''
on conflict (name) do nothing;

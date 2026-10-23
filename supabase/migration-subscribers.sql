-- Изпълни в Supabase -> SQL Editor (абонати + еднократни кодове за отстъпка)
create table if not exists subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  code text not null unique,
  percent int not null default 10,
  used_at timestamptz,
  created_at timestamptz not null default now()
);
alter table subscribers enable row level security;
-- Без политики: достъп само през сървъра (service role).

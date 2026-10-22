-- Изпълни в Supabase -> SQL Editor (за снимките на началната страница)

create table if not exists site_settings (
  key text primary key,
  value text,
  updated_at timestamptz not null default now()
);

alter table site_settings enable row level security;
-- Без политики: достъп само през сървъра (service role).

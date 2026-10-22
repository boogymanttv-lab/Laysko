-- Изпълни в Supabase -> SQL Editor (за дългата продуктова страница)

alter table products add column if not exists content jsonb not null default '{}'::jsonb;

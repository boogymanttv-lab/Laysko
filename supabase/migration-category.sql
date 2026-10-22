-- Изпълни в Supabase -> SQL Editor (за категориите и филтрите)

alter table products add column if not exists category text;

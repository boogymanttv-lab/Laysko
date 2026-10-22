-- Изпълни в Supabase -> SQL Editor (за кошницата: поръчки с няколко продукта)

alter table orders add column if not exists items jsonb;

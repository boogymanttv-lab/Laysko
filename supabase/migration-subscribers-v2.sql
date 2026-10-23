-- Изпълни в Supabase -> SQL Editor (отписване от имейли)
alter table subscribers add column if not exists unsubscribed_at timestamptz;

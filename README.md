# Dropship магазин (2 продукта) — Next.js + Supabase + Stripe + Vercel

## Как работи
- **Витрина** `/` и продуктова страница `/product/[slug]`, бутон „Купи сега“ → Stripe Checkout (EUR, събира адрес и телефон).
- След плащане Stripe вика `/api/stripe/webhook` и поръчката влиза в Supabase.
- **Админ** `/admin` (парола): добавяне/редакция/скриване на продукти, лимит `MAX_PRODUCTS` (по подразбиране 2), списък с поръчки със статус и проследяване, линк към доставчика.
- **Импорт от линк**: в админа поставяш Etsy/Temu линк и натискаш „Дръпни“ — сайтът се опитва да вземе заглавие, снимки и цена. Etsy и Temu нямат публично API за чужди продукти и често блокират автоматични заявки; ако се случи, попълваш ръчно (линкът се запазва). Поръчките към доставчика се правят ръчно.

## Стартиране
1. Supabase: нов проект → SQL Editor → изпълни `supabase/schema.sql`.
2. `cp .env.example .env.local` и попълни стойностите (Supabase URL + service role key, Stripe ключове, парола за админа, `ADMIN_SECRET`).
3. `npm install` и `npm run dev` → http://localhost:3000 (админ: /admin).
4. Stripe webhook локално: `stripe listen --forward-to localhost:3000/api/stripe/webhook` (дава `whsec_...`).

## Деплой във Vercel
1. Качи папката в GitHub и импортирай в Vercel (или `npx vercel`).
2. Добави всички променливи от `.env.example` в Project Settings → Environment Variables (`SITE_URL` = адресът на сайта).
3. В Stripe → Developers → Webhooks добави `https://ТВОЙ-ДОМЕЙН/api/stripe/webhook` със събитие `checkout.session.completed` и сложи `whsec_...` във Vercel.

## Важно
- `SUPABASE_SERVICE_ROLE_KEY` е само за сървъра — не го слагай с `NEXT_PUBLIC_`.
- Преди да рекламираш: добави страници за условия, поверителност и връщане на стоки; посочи реалните срокове за доставка (Етси/Темо идват 1–3 седмици).
- Провери условията на Etsy/Temu и авторските права върху снимките и описанията, които ползваш.

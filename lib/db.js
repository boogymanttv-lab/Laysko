import { createClient } from "@supabase/supabase-js";

// Само за сървърен код (server components, route handlers, server actions).
export function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: { persistSession: false },
      // Никога не кешира заявките към базата (Next.js иначе ги запазва и сайтът показва стари данни)
      global: { fetch: (url, options = {}) => fetch(url, { ...options, cache: "no-store" }) },
    }
  );
}

// Колони, безопасни за показване във витрината (без source_url и цена на доставчика)
export const PUBLIC_COLS =
  "id, slug, title, description, price_cents, compare_at_cents, images, category, active, created_at";

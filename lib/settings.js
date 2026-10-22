import { db } from "@/lib/db";

// Връща { hero_1: "...", hero_2: "..." }. Ако таблицата още не е създадена, връща {}.
export async function getSettings() {
  try {
    const { data, error } = await db().from("site_settings").select("key, value");
    if (error || !data) return {};
    return Object.fromEntries(data.map((r) => [r.key, r.value]));
  } catch {
    return {};
  }
}

import { parseHome } from "@/lib/home";
export async function getHome() {
  const s = await getSettings();
  const h = parseHome(s.home);
  // стари настройки на снимките
  h.images.hero = h.images.hero || s.hero_1 || "";
  h.images.story = h.images.story || s.hero_2 || "";
  return h;
}

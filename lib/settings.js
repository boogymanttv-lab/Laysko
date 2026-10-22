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

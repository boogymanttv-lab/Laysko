import { db } from "@/lib/db";

// Връща [{ name, image }]. Ако таблицата categories още не е създадена, ползва категориите от продуктите.
export async function getCategories({ onlyUsed = false } = {}) {
  const { data: prods } = await db().from("products").select("category, images").eq("active", true);
  const used = new Map();
  for (const p of prods || []) if (p.category && !used.has(p.category)) used.set(p.category, p.images?.[0] || "");

  let rows = null;
  try {
    const r = await db().from("categories").select("name, image_url, sort").order("sort").order("created_at");
    if (!r.error && r.data) rows = r.data;
  } catch {}

  let list;
  if (rows) {
    list = rows.map((c) => ({ name: c.name, image: c.image_url || used.get(c.name) || "", used: used.has(c.name) }));
  } else {
    list = [...used.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([name, image]) => ({ name, image, used: true }));
  }
  return onlyUsed ? list.filter((c) => c.used) : list;
}

// Всички категории (за админ формите), включително празните
export async function getCategoryNames() {
  return (await getCategories()).map((c) => c.name);
}

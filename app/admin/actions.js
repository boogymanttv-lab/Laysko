"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { checkPassword, createSession, destroySession, requireAdmin } from "@/lib/auth";
import { slugify, toCents } from "@/lib/format";

export async function login(prevState, formData) {
  if (!checkPassword(formData.get("password"))) return { error: "Грешна парола" };
  createSession();
  redirect("/admin");
}

export async function logout() {
  destroySession();
  redirect("/admin/login");
}

export async function saveProduct(prevState, formData) {
  requireAdmin();
  const id = formData.get("id") || null;
  const title = String(formData.get("title") || "").trim();
  const price = toCents(formData.get("price"));
  if (!title) return { error: "Заглавието е задължително" };
  if (price === null) return { error: "Невалидна цена" };

  // Снимките идват като подреден списък: { u: "линк" } за съществуваща/линк, { f: N } за нов файл
  let layout = [];
  try { layout = JSON.parse(String(formData.get("layout") || "[]")); } catch {}
  const files = formData.getAll("files").filter((f) => f && typeof f === "object" && f.size > 0);

  const images = [];
  for (const entry of layout.slice(0, 12)) {
    if (entry?.f != null) {
      const file = files[entry.f];
      if (!file) continue;
      const ext = EXT[file.type];
      if (!ext) return { error: "Позволени са снимки JPG, PNG, WEBP, GIF или AVIF." };
      if (file.size > 4 * 1024 * 1024) return { error: "Една от снимките е над 4 MB." };
      await db().storage.createBucket(BUCKET, { public: true });
      const path = `products/${Date.now()}-${images.length}.${ext}`;
      const up = await db().storage.from(BUCKET).upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type, upsert: true });
      if (up.error) return { error: `Качването на снимка не успя: ${up.error.message}` };
      images.push(db().storage.from(BUCKET).getPublicUrl(path).data.publicUrl);
    } else if (typeof entry?.u === "string" && /^https?:\/\//.test(entry.u)) {
      images.push(entry.u);
    }
  }

  const row = {
    title,
    slug: slugify(String(formData.get("slug") || "") || title),
    description: String(formData.get("description") || ""),
    price_cents: price,
    compare_at_cents: toCents(formData.get("compare_at")),
    supplier_cost_cents: toCents(formData.get("supplier_cost")),
    images,
    category: String(formData.get("category") || "").trim() || null,
    source: ["etsy", "temu", "other"].includes(formData.get("source")) ? formData.get("source") : "other",
    source_url: String(formData.get("source_url") || "").trim() || null,
    active: formData.get("active") === "on",
  };

  const client = db();
  if (id) {
    const { error } = await client.from("products").update(row).eq("id", id);
    if (error) return { error: error.message };
  } else {
    const max = parseInt(process.env.MAX_PRODUCTS || "2", 10);
    const { count } = await client.from("products").select("id", { count: "exact", head: true });
    if ((count ?? 0) >= max) {
      return { error: `Магазинът е за ${max} продукта. Изтрий един, за да добавиш нов (или смени MAX_PRODUCTS).` };
    }
    const { error } = await client.from("products").insert(row);
    if (error) return { error: error.code === "23505" ? "Вече има продукт с този адрес (slug)" : error.message };
  }
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin");
  redirect("/admin");
}

export async function deleteProduct(formData) {
  requireAdmin();
  await db().from("products").delete().eq("id", formData.get("id"));
  revalidatePath("/");
  redirect("/admin");
}

const BUCKET = "site";
const EXT = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "image/avif": "avif" };

export async function saveHero(prevState, formData) {
  requireAdmin();
  const client = db();
  const updates = [];

  for (const slot of [1, 2]) {
    const key = `hero_${slot}`;
    const file = formData.get(`file${slot}`);
    const url = String(formData.get(`url${slot}`) || "").trim();
    const clear = formData.get(`clear${slot}`) === "on";

    if (clear) {
      updates.push({ key, value: "" });
    } else if (file && typeof file === "object" && file.size > 0) {
      const ext = EXT[file.type];
      if (!ext) return { error: `Снимка ${slot}: позволени са JPG, PNG, WEBP, GIF или AVIF.` };
      if (file.size > 4 * 1024 * 1024) return { error: `Снимка ${slot}: над 4 MB е. Намали я и опитай пак.` };

      // Създава публичен bucket, ако още го няма (грешката "вече съществува" се игнорира)
      await client.storage.createBucket(BUCKET, { public: true });

      const path = `hero/${slot}-${Date.now()}.${ext}`;
      const { error } = await client.storage
        .from(BUCKET)
        .upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type, upsert: true });
      if (error) return { error: `Качването на снимка ${slot} не успя: ${error.message}` };

      updates.push({ key, value: client.storage.from(BUCKET).getPublicUrl(path).data.publicUrl });
    } else if (url) {
      if (!/^https?:\/\//.test(url)) return { error: `Снимка ${slot}: линкът трябва да започва с https://` };
      updates.push({ key, value: url });
    }
  }

  if (!updates.length) return { error: "Не си избрал нищо за промяна." };

  const { error } = await client
    .from("site_settings")
    .upsert(updates.map((u) => ({ ...u, updated_at: new Date().toISOString() })), { onConflict: "key" });
  if (error) {
    return {
      error: /site_settings/.test(error.message)
        ? "Липсва таблицата site_settings. Изпълни supabase/migration-settings.sql в Supabase (SQL Editor)."
        : error.message,
    };
  }
  revalidatePath("/");
  revalidatePath("/admin/settings");
  return { ok: "Запазено! Презареди началната страница, за да видиш промяната." };
}

export async function updateOrder(formData) {
  requireAdmin();
  const status = ["paid", "ordered", "shipped", "cancelled"].includes(formData.get("status"))
    ? formData.get("status") : "paid";
  await db().from("orders").update({
    status,
    tracking_number: String(formData.get("tracking") || "").trim() || null,
    notes: String(formData.get("notes") || "").trim() || null,
  }).eq("id", formData.get("id"));
  revalidatePath("/admin/orders");
}

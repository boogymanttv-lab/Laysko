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


const BUCKET_NAME = "site";
const IMG_EXT = { "image/svg+xml": "svg", "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "image/avif": "avif" };

async function uploadImage(client, file, folder) {
  const ext = IMG_EXT[file.type];
  if (!ext) return { error: "Позволени са снимки JPG, PNG, WEBP, GIF или AVIF." };
  if (file.size > 4 * 1024 * 1024) return { error: "Една от снимките е над 4 MB." };
  await client.storage.createBucket(BUCKET_NAME, { public: true });
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
  const up = await client.storage.from(BUCKET_NAME).upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type, upsert: true });
  if (up.error) return { error: `Качването на снимка не успя: ${up.error.message}` };
  return { url: client.storage.from(BUCKET_NAME).getPublicUrl(path).data.publicUrl };
}

// Подрежда и почиства съдържанието на продуктовата страница; качва новите снимки на секциите
async function buildContent(client, raw, files) {
  let c = {};
  try { c = JSON.parse(raw || "{}"); } catch {}
  const str = (v, max) => String(v ?? "").trim().slice(0, max);
  const arr = (v, n) => (Array.isArray(v) ? v.slice(0, n) : []);
  const out = { bullets: [], sections: [], features: [], faq: [], specs: [] };

  out.bullets = arr(c.bullets, 8).map((b) => str(b, 200)).filter(Boolean);
  for (const s of arr(c.sections, 8)) {
    let image = "";
    if (s?.image?.f != null) {
      const file = files[s.image.f];
      if (file) {
        const up = await uploadImage(client, file, "sections");
        if (up.error) return { error: up.error };
        image = up.url;
      }
    } else if (typeof s?.image?.u === "string" && /^https?:\/\//.test(s.image.u.trim())) {
      image = s.image.u.trim();
    }
    const title = str(s?.title, 150), text = str(s?.text, 2000);
    if (title || text || image) out.sections.push({ title, text, image });
  }
  for (const f of arr(c.features, 8)) {
    const title = str(f?.title, 100), text = str(f?.text, 400);
    if (title || text) out.features.push({ title, text });
  }
  for (const f of arr(c.faq, 12)) {
    const q = str(f?.q, 200), a = str(f?.a, 1500);
    if (q && a) out.faq.push({ q, a });
  }
  for (const s of arr(c.specs, 15)) {
    const k = str(s?.k, 80), v = str(s?.v, 200);
    if (k && v) out.specs.push({ k, v });
  }
  return { content: out };
}

const dbMsg = (e) =>
  /content/.test(e.message || "")
    ? "Липсва колоната за съдържание. Изпълни supabase/migration-content.sql в Supabase (SQL Editor)."
    : e.message;

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

  const secFiles = formData.getAll("secfiles").filter((f) => f && typeof f === "object" && f.size > 0);
  const built = await buildContent(db(), String(formData.get("content") || ""), secFiles);
  if (built.error) return { error: built.error };

  const row = {
    title,
    slug: slugify(String(formData.get("slug") || "") || title),
    description: String(formData.get("description") || ""),
    price_cents: price,
    compare_at_cents: toCents(formData.get("compare_at")),
    supplier_cost_cents: toCents(formData.get("supplier_cost")),
    images,
    content: built.content,
    category: String(formData.get("category") || "").trim() || null,
    source: ["etsy", "temu", "other"].includes(formData.get("source")) ? formData.get("source") : "other",
    source_url: String(formData.get("source_url") || "").trim() || null,
    active: formData.get("active") === "on",
  };

  const client = db();
  if (id) {
    const { error } = await client.from("products").update(row).eq("id", id);
    if (error) return { error: dbMsg(error) };
  } else {
    const max = parseInt(process.env.MAX_PRODUCTS || "2", 10);
    const { count } = await client.from("products").select("id", { count: "exact", head: true });
    if ((count ?? 0) >= max) {
      return { error: `Магазинът е за ${max} продукта. Изтрий един, за да добавиш нов (или смени MAX_PRODUCTS).` };
    }
    const { error } = await client.from("products").insert(row);
    if (error) return { error: error.code === "23505" ? "Вече има продукт с този адрес (slug)" : dbMsg(error) };
    if (row.active && formData.get("notify") === "on") {
      try {
        const { sendBatch, productEmail, unsubLink, emailLogo } = await import("@/lib/email");
        const logo = await emailLogo();
        const { data: subs } = await client.from("subscribers").select("id, email").is("unsubscribed_at", null).limit(2000);
        const site = process.env.NEXT_PUBLIC_SITE_NAME || "Laysko";
        await sendBatch((subs || []).map((u) => ({
          to: u.email,
          subject: `Ново в ${site}: ${row.title}`,
          html: productEmail({ product: row, unsubUrl: unsubLink(u.id), site, logo }),
        })));
      } catch (e) { console.error(e); }
    }
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

export async function saveHome(prevState, formData) {
  requireAdmin();
  const { parseHome } = await import("@/lib/home");
  const client = db();
  let cfg = {};
  try { cfg = JSON.parse(String(formData.get("cfg") || "{}")); } catch {}
  const home = parseHome(JSON.stringify(cfg));
  home.images = { ...home.images };
  for (const key of ["hero", "promo", "story", "logo"]) {
    const file = formData.get(`img_${key}`);
    if (file && typeof file === "object" && file.size > 0) {
      const up = await uploadImage(client, file, "home");
      if (up.error) return { error: up.error };
      home.images[key] = up.url;
    } else {
      const v = String(home.images[key] || "").trim();
      home.images[key] = /^https?:\/\//.test(v) ? v : "";
    }
  }
  home.videos = home.videos.map((v) => ({ title: v.title.trim().slice(0, 80), url: v.url.trim() }));
  const { error } = await client.from("site_settings").upsert(
    [{ key: "home", value: JSON.stringify(home), updated_at: new Date().toISOString() }], { onConflict: "key" });
  if (error) {
    return { error: /site_settings/.test(error.message) ? "Липсва таблицата site_settings. Изпълни supabase/migration-settings.sql в Supabase." : error.message };
  }
  revalidatePath("/", "layout");
  return { ok: "Запазено! Презареди сайта, за да видиш промените.", images: home.images };
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


// ---------- Категории ----------
const catErr = (e) =>
  /categories/.test(e.message || "") && /exist|schema|relation|find/i.test(e.message || "")
    ? "Липсва таблицата за категории. Изпълни supabase/migration-categories.sql в Supabase (SQL Editor)."
    : e.code === "23505" ? "Вече има категория с това име." : e.message;

export async function createCategory(prevState, formData) {
  requireAdmin();
  const name = String(formData.get("name") || "").trim().slice(0, 60);
  if (!name) return { error: "Въведи име на категорията." };
  const client = db();
  let image_url = null;
  const file = formData.get("image");
  if (file && typeof file === "object" && file.size > 0) {
    const up = await uploadImage(client, file, "categories");
    if (up.error) return { error: up.error };
    image_url = up.url;
  }
  const { count } = await client.from("categories").select("id", { count: "exact", head: true });
  const { error } = await client.from("categories").insert({ name, image_url, sort: count ?? 0 });
  if (error) return { error: catErr(error) };
  revalidatePath("/", "layout");
  revalidatePath("/admin/categories");
  return { ok: `Категорията „${name}“ е създадена.` };
}

export async function updateCategory(formData) {
  requireAdmin();
  const id = formData.get("id");
  const name = String(formData.get("name") || "").trim().slice(0, 60);
  if (!id || !name) return;
  const client = db();
  const { data: old } = await client.from("categories").select("name").eq("id", id).maybeSingle();
  const patch = { name };
  const file = formData.get("image");
  if (file && typeof file === "object" && file.size > 0) {
    const up = await uploadImage(client, file, "categories");
    if (!up.error) patch.image_url = up.url;
  }
  if (formData.get("clear") === "on") patch.image_url = null;
  const { error } = await client.from("categories").update(patch).eq("id", id);
  if (!error && old && old.name !== name) await client.from("products").update({ category: name }).eq("category", old.name);
  revalidatePath("/", "layout");
  revalidatePath("/admin/categories");
}

export async function deleteCategory(formData) {
  requireAdmin();
  const id = formData.get("id");
  const client = db();
  const { data: old } = await client.from("categories").select("name").eq("id", id).maybeSingle();
  if (old) await client.from("products").update({ category: null }).eq("category", old.name);
  await client.from("categories").delete().eq("id", id);
  revalidatePath("/", "layout");
  revalidatePath("/admin/categories");
}


export async function markOrdered(formData) {
  requireAdmin();
  await db().from("orders").update({ status: "ordered" }).eq("id", formData.get("id")).eq("status", "paid");
  revalidatePath("/admin/orders");
}

export async function deleteSubscriber(formData) {
  requireAdmin();
  const id = String(formData.get("id") || "");
  if (id) await db().from("subscribers").delete().eq("id", id);
  revalidatePath("/admin/subscribers");
}

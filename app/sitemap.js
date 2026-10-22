import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function sitemap() {
  const base = (process.env.SITE_URL || "https://www.laysko.com").replace(/\/$/, "");
  const { data } = await db().from("products").select("slug, created_at").eq("active", true);
  const pages = ["", "/products", "/contact", "/info/delivery", "/info/returns"].map((p) => ({
    url: `${base}${p}`, changeFrequency: p === "" ? "daily" : "weekly", priority: p === "" ? 1 : 0.6,
  }));
  const products = (data || []).map((p) => ({
    url: `${base}/product/${p.slug}`, lastModified: p.created_at, changeFrequency: "weekly", priority: 0.8,
  }));
  return [...pages, ...products];
}

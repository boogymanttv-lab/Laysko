import { requireAdmin } from "@/lib/auth";
import { getHome } from "@/lib/settings";
import { db } from "@/lib/db";
import AdminNav from "../AdminNav";
import HomeForm from "./HomeForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  requireAdmin();
  const home = await getHome();
  const { data } = await db().from("products").select("id, title, category, active").order("created_at", { ascending: false });
  const categories = [...new Set((data || []).map((p) => p.category).filter(Boolean))].sort();
  return (
    <>
      <AdminNav />
      <h1 style={{ fontSize: 24 }}>Начална страница</h1>
      <p className="muted" style={{ maxWidth: 640 }}>
        Тук редактираш всички текстове, снимки и клипове на началната страница, бягащата лента и футъра.
      </p>
      <HomeForm initial={home} categories={categories} products={(data || []).filter((p) => p.active).map((p) => ({ id: p.id, title: p.title }))} />
    </>
  );
}

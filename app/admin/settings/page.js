import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import AdminNav from "../AdminNav";
import HeroForm from "./HeroForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  requireAdmin();
  const s = await getSettings();
  return (
    <>
      <AdminNav />
      <h1 style={{ fontSize: 24 }}>Начална страница</h1>
      <p className="muted" style={{ maxWidth: 620 }}>
        Двете снимки в колажа най-горе на сайта. Качи файл или постави линк. Ако не зададеш снимка,
        се ползват снимките на първите два продукта.
      </p>
      <HeroForm hero1={s.hero_1 || ""} hero2={s.hero_2 || ""} />
    </>
  );
}

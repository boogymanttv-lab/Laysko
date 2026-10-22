import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import AdminNav from "../AdminNav";
import CategoryForm from "./CategoryForm";
import { updateCategory, deleteCategory } from "../actions";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  requireAdmin();
  const { data, error } = await db().from("categories").select("*").order("sort").order("created_at");
  const { data: prods } = await db().from("products").select("category");
  const count = {};
  for (const p of prods || []) if (p.category) count[p.category] = (count[p.category] || 0) + 1;

  return (
    <>
      <AdminNav />
      <h1 style={{ fontSize: 24 }}>Категории</h1>
      <p className="muted" style={{ maxWidth: 620 }}>
        Създай категориите тук, преди да добавяш продукти. После във формата на продукта избираш в коя категория е.
        Снимката е за плочката на началната страница; ако не качиш, се ползва снимка на продукт от категорията.
      </p>
      {error && (
        <p className="banner-warn">Липсва таблицата за категории. Изпълни <b>supabase/migration-categories.sql</b> в Supabase (SQL Editor) и презареди.</p>
      )}
      <CategoryForm />
      <h2 style={{ fontSize: 18, marginTop: 28 }}>Твоите категории</h2>
      {!data?.length && !error && <p className="muted">Още няма категории.</p>}
      <div style={{ display: "grid", gap: 12, maxWidth: 720 }}>
        {(data || []).map((c) => (
          <div key={c.id} className="form-card" style={{ padding: 16 }}>
            <form action={updateCategory} style={{ display: "grid", gap: 8 }}>
              <input type="hidden" name="id" value={c.id} />
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", overflow: "hidden", background: "var(--soft)", flex: "none" }}>
                  {c.image_url && <img src={c.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <input name="name" defaultValue={c.name} required maxLength={60} />
                  <span className="muted" style={{ fontSize: 13 }}>{count[c.name] || 0} продукта</span>
                </div>
              </div>
              <input name="image" type="file" accept="image/*" />
              {c.image_url && (
                <label style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 400 }}>
                  <input type="checkbox" name="clear" style={{ width: "auto" }} /> Махни снимката
                </label>
              )}
              <div><button className="btn sm">Запази</button></div>
            </form>
            <form action={deleteCategory} style={{ marginTop: 8 }}>
              <input type="hidden" name="id" value={c.id} />
              <button className="btn danger sm">Изтрий</button>
              <span className="muted" style={{ fontSize: 12, marginLeft: 8 }}>Продуктите в нея остават без категория.</span>
            </form>
          </div>
        ))}
      </div>
    </>
  );
}

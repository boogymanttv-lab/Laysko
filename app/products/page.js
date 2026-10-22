import Link from "next/link";
import { db, PUBLIC_COLS } from "@/lib/db";
import ProductCard from "../ProductCard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Продукти" };

const SORTS = {
  new: "Най-нови",
  "price-asc": "Цена: от ниска към висока",
  "price-desc": "Цена: от висока към ниска",
  discount: "Най-голяма отстъпка",
};

const num = (v) => {
  const n = parseFloat(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
};

export default async function ProductsPage({ searchParams }) {
  const { data } = await db().from("products").select(PUBLIC_COLS).eq("active", true);
  const all = data || [];

  const q = String(searchParams.q || "").trim().toLowerCase();
  const category = String(searchParams.category || "");
  const min = num(searchParams.min);
  const max = num(searchParams.max);
  const sale = searchParams.sale === "1";
  const sort = SORTS[searchParams.sort] ? searchParams.sort : "new";

  const categories = [...new Set(all.map((p) => p.category).filter(Boolean))].sort();
  const maxPrice = all.length ? Math.ceil(Math.max(...all.map((p) => p.price_cents)) / 100) : 0;
  const discount = (p) => (p.compare_at_cents > p.price_cents ? 1 - p.price_cents / p.compare_at_cents : 0);

  let list = all.filter((p) => {
    if (q && !`${p.title} ${p.description}`.toLowerCase().includes(q)) return false;
    if (category && p.category !== category) return false;
    if (min !== null && p.price_cents < min * 100) return false;
    if (max !== null && p.price_cents > max * 100) return false;
    if (sale && discount(p) <= 0) return false;
    return true;
  });

  list.sort((a, b) => {
    if (sort === "price-asc") return a.price_cents - b.price_cents;
    if (sort === "price-desc") return b.price_cents - a.price_cents;
    if (sort === "discount") return discount(b) - discount(a);
    return new Date(b.created_at) - new Date(a.created_at);
  });

  const filtered = q || category || min !== null || max !== null || sale;

  return (
    <div className="container">
      <div className="crumbs"><Link href="/">Начало</Link> / Продукти</div>
      <div className="shop-head">
        <h1 style={{ margin: 0, fontSize: 36 }}>Всички продукти</h1>
        <span className="muted">{list.length} {list.length === 1 ? "продукт" : "продукта"}</span>
      </div>

      <div className="shop">
        <form className="filters" method="get" action="/products">
          <h3>Филтри</h3>

          <label htmlFor="q">Търсене</label>
          <input id="q" name="q" defaultValue={searchParams.q || ""} placeholder="Търси продукт..." />

          {categories.length > 0 && (
            <>
              <label htmlFor="category">Категория</label>
              <select id="category" name="category" defaultValue={category}>
                <option value="">Всички</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </>
          )}

          <label>Цена (EUR){maxPrice ? ` · до ${maxPrice}` : ""}</label>
          <div className="two">
            <input name="min" inputMode="decimal" placeholder="От" defaultValue={searchParams.min || ""} />
            <input name="max" inputMode="decimal" placeholder="До" defaultValue={searchParams.max || ""} />
          </div>

          <label htmlFor="sort">Подреди по</label>
          <select id="sort" name="sort" defaultValue={sort}>
            {Object.entries(SORTS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>

          <label style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 500, marginTop: 16 }}>
            <input type="checkbox" name="sale" value="1" defaultChecked={sale} style={{ width: "auto" }} />
            Само намалени
          </label>

          <button className="btn primary block" style={{ marginTop: 18 }}>Приложи</button>
          {filtered && <Link href="/products" className="btn ghost block" style={{ marginTop: 8 }}>Изчисти филтрите</Link>}
        </form>

        <div>
          {!list.length ? (
            <div className="empty">
              <h3 style={{ margin: "0 0 6px" }}>Няма намерени продукти</h3>
              <p className="muted" style={{ margin: 0 }}>Опитай с други филтри.</p>
            </div>
          ) : (
            <div className="grid shop-grid">
              {list.map((p) => <ProductCard key={p.id} p={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

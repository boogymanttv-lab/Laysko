import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { eur } from "@/lib/format";
import AdminNav from "./AdminNav";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  requireAdmin();
  const { data: products } = await db().from("products").select("*").order("created_at");
  const max = parseInt(process.env.MAX_PRODUCTS || "2", 10);
  const canAdd = (products?.length ?? 0) < max;

  return (
    <>
      <AdminNav />
      <div className="row" style={{ marginBottom: 16 }}>
        <h1 style={{ margin: 0, fontSize: 24 }}>Продукти ({products?.length ?? 0}/{max})</h1>
        {canAdd && <Link href="/admin/products/new" className="btn">+ Нов продукт</Link>}
      </div>
      {!canAdd && (
        <p className="banner-warn" style={{ margin: "0 0 16px" }}>
          Достигнат е лимитът от {max} продукта, затова не може да се добави нов. За да смениш продукт,
          натисни „Редакция“ и промени заглавие, снимки и цена, или изтрий един продукт. За повече продукти
          увеличи <b>MAX_PRODUCTS</b> в <b>.env.local</b> и рестартирай сървъра.
        </p>
      )}
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Продукт</th><th>Цена</th><th>Печалба/бр.</th><th>Източник</th><th>Статус</th><th></th></tr>
          </thead>
          <tbody>
            {products?.map((p) => (
              <tr key={p.id}>
                <td>{p.title}</td>
                <td>{eur(p.price_cents)}</td>
                <td>{p.supplier_cost_cents != null ? eur(p.price_cents - p.supplier_cost_cents) : "—"}</td>
                <td>
                  {p.source_url ? <a href={p.source_url} target="_blank" rel="noreferrer">{p.source} ↗</a> : p.source}
                </td>
                <td><span className="badge">{p.active ? "Активен" : "Скрит"}</span></td>
                <td><Link href={`/admin/products/${p.id}`}>Редакция</Link></td>
              </tr>
            ))}
            {!products?.length && <tr><td colSpan={6} className="muted">Още няма продукти.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}

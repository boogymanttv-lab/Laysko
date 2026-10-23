import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { eur } from "@/lib/format";
import AdminNav from "../AdminNav";
import { updateOrder, markOrdered } from "../actions";
import OrderTools from "./OrderTools";

export const dynamic = "force-dynamic";

const LABELS = { paid: "Платена", ordered: "Поръчана при доставчик", shipped: "Изпратена", cancelled: "Отказана" };

export default async function Orders() {
  requireAdmin();
  const client = db();
  const { data: orders } = await client.from("orders").select("*").order("created_at", { ascending: false });
  const { data: prods } = await client.from("products").select("id, source_url");
  const urlById = Object.fromEntries((prods || []).map((p) => [p.id, p.source_url]));

  return (
    <>
      <AdminNav />
      <h1 style={{ fontSize: 24 }}>Поръчки</h1>
      <ol className="muted" style={{ maxWidth: 640, paddingLeft: 20, fontSize: 14 }}>
        <li>Натисни „Отвори при доставчика“ и добави продукта в количката му.</li>
        <li>Натисни „Копирай всички данни за доставка“ и ги постави при поръчката.</li>
        <li>След като поръчаш, натисни „Маркирай като поръчана“ и по-късно добави проследяване.</li>
      </ol>
      {!orders?.length && <p className="muted">Още няма поръчки.</p>}
      <div style={{ display: "grid", gap: 16 }}>
        {orders?.map((o) => {
          const a = o.shipping_address || {};
          const items = o.items?.length
            ? o.items
            : [{ title: o.product_title, quantity: o.quantity, product_id: o.product_id }];
          return (
            <div key={o.id} className="form-card" style={{ maxWidth: "none", paddingTop: 16 }}>
              <div className="row" style={{ alignItems: "flex-start" }}>
                <div>
                  <strong>Общо {eur(o.amount_cents)}</strong>
                  <div className="muted" style={{ fontSize: 13 }}>{new Date(o.created_at).toLocaleString("bg-BG")}</div>
                </div>
                <span className="badge">{LABELS[o.status] || o.status}</span>
              </div>

              <ul style={{ margin: "12px 0", paddingLeft: 18, fontSize: 14 }}>
                {items.map((i, idx) => (
                  <li key={idx}>
                    {i.title} × {i.quantity}
                    {i.unit_cents != null && <span className="muted"> ({eur(i.unit_cents)} / бр.)</span>}
                    {urlById[i.product_id] && (
                      <> — <a href={urlById[i.product_id]} target="_blank" rel="noreferrer">при доставчика ↗</a></>
                    )}
                  </li>
                ))}
              </ul>

              <p style={{ margin: "12px 0", fontSize: 14 }}>
                {o.customer_name}<br />
                {[a.line1, a.line2, a.postal_code, a.city, a.state, a.country].filter(Boolean).join(", ")}<br />
                {o.customer_email} {o.customer_phone && `· ${o.customer_phone}`}
              </p>

              {(() => {
                const addressLine = [a.line1, a.line2, a.postal_code, a.city, a.state, a.country].filter(Boolean).join(", ");
                const fullBlock = [
                  o.customer_name,
                  a.line1, a.line2,
                  [a.postal_code, a.city].filter(Boolean).join(" "),
                  a.state, a.country,
                  o.customer_phone && `Тел: ${o.customer_phone}`,
                  o.customer_email && `Имейл: ${o.customer_email}`,
                ].filter(Boolean).join("\n");
                const links = items
                  .filter((i) => urlById[i.product_id])
                  .map((i) => ({ url: urlById[i.product_id], title: i.title }));
                return (
                  <OrderTools name={o.customer_name || ""} phone={o.customer_phone || ""} email={o.customer_email || ""}
                    addressLine={addressLine} fullBlock={fullBlock} links={links} />
                );
              })()}

              {o.status === "paid" && (
                <form action={markOrdered} style={{ margin: "10px 0 0" }}>
                  <input type="hidden" name="id" value={o.id} />
                  <button className="btn sm">Маркирай като поръчана</button>
                </form>
              )}

              <form action={updateOrder} className="two" style={{ alignItems: "end" }}>
                <input type="hidden" name="id" value={o.id} />
                <div>
                  <label>Статус</label>
                  <select name="status" defaultValue={o.status}>
                    {Object.entries(LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label>Проследяване</label>
                  <input name="tracking" defaultValue={o.tracking_number || ""} />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label>Бележки</label>
                  <input name="notes" defaultValue={o.notes || ""} />
                </div>
                <div><button className="btn sm">Запази</button></div>
              </form>
            </div>
          );
        })}
      </div>
    </>
  );
}

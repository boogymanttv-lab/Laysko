import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { eur } from "@/lib/format";
import AdminNav from "../AdminNav";
import { updateOrder } from "../actions";

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
      <p className="muted">След плащане: отвори линка към доставчика за всеки продукт, поръчай с адреса на клиента, после маркирай „Поръчана“ и добави проследяване.</p>
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

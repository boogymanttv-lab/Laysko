import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { eur } from "@/lib/format";
import { computeStats } from "@/lib/stats";
import AdminNav from "../AdminNav";
import { TimeChart, HBars } from "./Charts";

export const dynamic = "force-dynamic";
export const metadata = { title: "Статистика" };

const RANGES = { "7": "7 дни", "30": "30 дни", "90": "90 дни", "365": "12 месеца", all: "Всичко" };
const BYS = { day: "По дни", week: "По седмици", month: "По месеци" };
const SOURCE = { etsy: { label: "Etsy", color: "var(--series-1)" }, temu: { label: "Temu", color: "var(--series-2)" }, other: { label: "Друг", color: "var(--series-3)" } };
const STATUS = { paid: "Платени", ordered: "Поръчани при доставчик", shipped: "Изпратени", cancelled: "Отказани" };

const pct = (cur, prev) => (prev > 0 ? Math.round(((cur - prev) / prev) * 100) : null);

function Delta({ cur, prev }) {
  const d = pct(cur, prev);
  if (d === null) return <span className="muted">няма сравнение</span>;
  return <span className={d >= 0 ? "up" : "down"}>{d >= 0 ? "▲" : "▼"} {Math.abs(d)}% спрямо предишния период</span>;
}

export default async function Stats({ searchParams }) {
  requireAdmin();
  const range = RANGES[searchParams.range] ? searchParams.range : "30";
  const defaultBy = range === "7" || range === "30" ? "day" : range === "90" ? "week" : "month";
  const by = BYS[searchParams.by] ? searchParams.by : defaultBy;

  const client = db();
  const [{ data: orders }, { data: products }] = await Promise.all([
    client.from("orders").select("id, created_at, amount_cents, status, items, product_id, product_title, quantity, shipping_address").order("created_at").limit(5000),
    client.from("products").select("id, title, source, supplier_cost_cents, price_cents"),
  ]);

  const s = computeStats({
    orders: orders || [], products: products || [],
    range: range === "all" ? null : parseInt(range, 10), by,
  });
  const t = s.totals;
  const href = (r, b) => `/admin/stats?range=${r}&by=${b}`;

  return (
    <>
      <AdminNav />
      <div className="row" style={{ alignItems: "flex-end", flexWrap: "wrap", marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 26 }}>Статистика</h1>
        <div className="filters-row">
          <div className="pills">
            {Object.entries(RANGES).map(([k, v]) => (
              <Link key={k} href={href(k, by)} className={"pill-link" + (k === range ? " on" : "")}>{v}</Link>
            ))}
          </div>
          <div className="pills">
            {Object.entries(BYS).map(([k, v]) => (
              <Link key={k} href={href(range, k)} className={"pill-link" + (k === by ? " on" : "")}>{v}</Link>
            ))}
          </div>
        </div>
      </div>

      <div className="viz-root">
        <div className="kpis">
          <div className="tile hero-tile">
            <span className="tl">Приходи</span>
            <span className="tv big">{eur(t.revenue)}</span>
            {s.prev && <small><Delta cur={t.revenue} prev={s.prev.revenue} /></small>}
          </div>
          <div className="tile">
            <span className="tl">Поръчки</span>
            <span className="tv">{t.orders}</span>
            {s.prev && <small><Delta cur={t.orders} prev={s.prev.orders} /></small>}
          </div>
          <div className="tile">
            <span className="tl">Продадени бройки</span>
            <span className="tv">{t.units}</span>
          </div>
          <div className="tile">
            <span className="tl">Средна поръчка</span>
            <span className="tv">{t.orders ? eur(Math.round(t.revenue / t.orders)) : "—"}</span>
          </div>
          <div className="tile">
            <span className="tl">Печалба</span>
            <span className="tv">{eur(t.profit)}</span>
            <small className="muted">{t.profitCovered ? "без такси на Stripe" : "само за продукти с въведена цена при доставчика"}</small>
          </div>
        </div>

        <section className="chart-card">
          <h2>Развитие във времето</h2>
          <p className="muted sub">{BYS[by]} · {s.start} до {s.today} · отказаните поръчки не се броят</p>
          <TimeChart buckets={s.buckets} />
        </section>

        <div className="two-col">
          <section className="chart-card">
            <h2>Приходи по продукт</h2>
            <HBars
              rows={s.products.map((p) => ({
                label: p.title, value: p.revenue,
                detail: `${p.qty} бр. · ${p.orders} поръчки · печалба ${eur(p.profit)}`,
              }))}
            />
          </section>
          <section className="chart-card">
            <h2>Приходи по магазин (Etsy / Temu)</h2>
            <HBars
              rows={s.sources.map((x) => ({
                label: SOURCE[x.key]?.label || x.key, value: x.revenue, color: SOURCE[x.key]?.color,
                detail: `${x.qty} бр. · ${x.orders} поръчки · печалба ${eur(x.profit)}`,
              }))}
            />
          </section>
        </div>

        <div className="two-col">
          <section className="chart-card">
            <h2>Поръчки по държава</h2>
            <HBars format="count" rows={s.countries.map((c) => ({ label: c.label, value: c.orders, detail: `${eur(c.revenue)} приходи` }))} />
          </section>
          <section className="chart-card">
            <h2>Статус на поръчките</h2>
            <HBars format="count" rows={Object.entries(STATUS).map(([k, v]) => ({ label: v, value: s.statuses[k] || 0 })).filter((r) => r.value > 0)} />
          </section>
        </div>

        <section className="chart-card">
          <h2>Продукти в детайл</h2>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Продукт</th><th>Магазин</th><th>Бройки</th><th>Поръчки</th><th>Приходи</th><th>Печалба</th><th>Дял</th></tr></thead>
              <tbody>
                {s.products.map((p) => (
                  <tr key={p.title}>
                    <td>{p.title}</td>
                    <td>{SOURCE[p.source]?.label || p.source}</td>
                    <td>{p.qty}</td>
                    <td>{p.orders}</td>
                    <td>{eur(p.revenue)}</td>
                    <td>{p.hasCost ? eur(p.profit) : "—"}</td>
                    <td>{t.revenue ? Math.round((p.revenue / t.revenue) * 100) + "%" : "—"}</td>
                  </tr>
                ))}
                {!s.products.length && <tr><td colSpan={7} className="muted">Още няма поръчки в този период.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}

// Изчисляване на статистики от поръчките (ден / седмица / месец, продукти, източници, държави)

const TZ = process.env.SITE_TZ || "Europe/Sofia";
const dayFmt = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });

export const dayKey = (d) => dayFmt.format(d); // YYYY-MM-DD в часовата зона на магазина

function addDays(key, n) {
  const d = new Date(key + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function bucketKey(day, by) {
  if (by === "month") return day.slice(0, 7);
  if (by === "week") {
    const wd = (new Date(day + "T00:00:00Z").getUTCDay() + 6) % 7; // понеделник = 0
    return addDays(day, -wd);
  }
  return day;
}

function labelFor(key, by) {
  const d = new Date((by === "month" ? key + "-01" : key) + "T00:00:00Z");
  const opts = by === "month" ? { month: "short", year: "numeric" } : { day: "numeric", month: "short" };
  const text = new Intl.DateTimeFormat("bg-BG", { timeZone: "UTC", ...opts }).format(d);
  return by === "week" ? "седм. от " + text : text;
}

function itemsOf(o) {
  if (o.items?.length) return o.items;
  return [{
    product_id: o.product_id,
    title: o.product_title,
    quantity: o.quantity || 1,
    unit_cents: Math.round((o.amount_cents || 0) / (o.quantity || 1)),
  }];
}

export function computeStats({ orders, products, range, by }) {
  const prodById = Object.fromEntries(products.map((p) => [p.id, p]));
  const today = dayKey(new Date());

  const dayOf = (o) => dayKey(new Date(o.created_at));
  let start;
  if (range) start = addDays(today, -(range - 1));
  else {
    const first = orders.map(dayOf).sort()[0];
    start = first || addDays(today, -29);
  }

  // Празни кофи за непрекъсната ос
  const buckets = new Map();
  for (let d = start; d <= today; d = addDays(d, 1)) {
    const k = bucketKey(d, by);
    if (!buckets.has(k)) buckets.set(k, { key: k, label: labelFor(k, by), revenue: 0, orders: 0, units: 0, profit: 0 });
  }

  const inRange = orders.filter((o) => dayOf(o) >= start);
  const live = inRange.filter((o) => o.status !== "cancelled");

  const products_ = new Map();
  const sources = new Map();
  const countries = new Map();
  const totals = { revenue: 0, orders: live.length, units: 0, profit: 0, profitCovered: true };

  for (const o of live) {
    const b = buckets.get(bucketKey(dayOf(o), by));
    totals.revenue += o.amount_cents || 0;
    if (b) { b.revenue += o.amount_cents || 0; b.orders += 1; }

    const country = o.shipping_address?.country || "—";
    const c = countries.get(country) || { label: country, orders: 0, revenue: 0 };
    c.orders += 1; c.revenue += o.amount_cents || 0;
    countries.set(country, c);

    const seenSources = new Set();
    for (const it of itemsOf(o)) {
      const p = prodById[it.product_id];
      const qty = it.quantity || 1;
      const unit = it.unit_cents ?? p?.price_cents ?? 0;
      const rev = unit * qty;
      const hasCost = p?.supplier_cost_cents != null;
      const profit = hasCost ? rev - p.supplier_cost_cents * qty : 0;
      if (!hasCost) totals.profitCovered = false;

      totals.units += qty;
      totals.profit += profit;
      if (b) { b.units += qty; b.profit += profit; }

      const pk = it.product_id || it.title;
      const ps = products_.get(pk) || { title: p?.title || it.title, source: p?.source || "other", qty: 0, revenue: 0, profit: 0, hasCost, orders: 0 };
      ps.qty += qty; ps.revenue += rev; ps.profit += profit; ps.orders += 1;
      products_.set(pk, ps);

      const sk = p?.source || "other";
      const ss = sources.get(sk) || { key: sk, qty: 0, revenue: 0, orders: 0, profit: 0 };
      ss.qty += qty; ss.revenue += rev; ss.profit += profit;
      if (!seenSources.has(sk)) { ss.orders += 1; seenSources.add(sk); }
      sources.set(sk, ss);
    }
  }

  // Предишен период със същата дължина (само при ограничен период)
  let prev = null;
  if (range) {
    const prevStart = addDays(start, -range);
    const prevOrders = orders.filter((o) => { const d = dayOf(o); return d >= prevStart && d < start && o.status !== "cancelled"; });
    prev = { revenue: prevOrders.reduce((n, o) => n + (o.amount_cents || 0), 0), orders: prevOrders.length };
  }

  const statuses = {};
  for (const o of inRange) statuses[o.status] = (statuses[o.status] || 0) + 1;

  return {
    start, today, totals, prev, statuses,
    buckets: [...buckets.values()],
    products: [...products_.values()].sort((a, b) => b.revenue - a.revenue),
    sources: [...sources.values()].sort((a, b) => b.revenue - a.revenue),
    countries: [...countries.values()].sort((a, b) => b.revenue - a.revenue),
  };
}

"use client";
import { useState } from "react";

// Ръчно форматиране (без Intl), за да няма разлика между сървъра и браузъра при хидратация
const fmtNum = (n, dec = 2) => {
  const [i, d] = Math.abs(n).toFixed(dec).split(".");
  return (n < 0 ? "-" : "") + i.replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0") + (d ? "," + d : "");
};
const money = (c) => fmtNum((c || 0) / 100) + "\u00a0€";
const moneyShort = (c) => {
  const e = (c || 0) / 100;
  if (e >= 1000) return fmtNum(e / 1000, e % 1000 === 0 ? 0 : 1) + "K\u00a0€";
  return fmtNum(e, e % 1 === 0 ? 0 : 2) + "\u00a0€";
};

function niceTop(max, ticks = 4) {
  if (max <= 0) return { top: 1, step: 1 / ticks };
  const raw = max / ticks;
  const p = 10 ** Math.floor(Math.log10(raw));
  const f = raw / p;
  const step = (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p;
  return { top: step * Math.ceil(max / step), step };
}

const METRICS = {
  revenue: { label: "Приходи", fmt: money, short: moneyShort, money: true },
  profit: { label: "Печалба", fmt: money, short: moneyShort, money: true },
  orders: { label: "Поръчки", fmt: (v) => String(v), short: (v) => String(v), money: false },
};

export function TimeChart({ buckets }) {
  const [metric, setMetric] = useState("revenue");
  const [hover, setHover] = useState(null);
  const m = METRICS[metric];

  const W = 760, H = 260, L = 56, R = 8, T = 12, B = 30;
  const pw = W - L - R, ph = H - T - B;
  const vals = buckets.map((b) => Math.max(0, b[metric]));
  const { top, step } = niceTop(Math.max(...vals, 0));
  const band = pw / Math.max(buckets.length, 1);
  const bw = Math.min(24, band * 0.7);
  const every = Math.ceil(buckets.length / 8);
  const ticks = [];
  for (let v = 0; v <= top + 1e-9; v += step) ticks.push(v);

  const barPath = (x, h) => {
    const y = T + ph - h, r = Math.min(4, h);
    return `M${x},${T + ph} V${y + r} Q${x},${y} ${x + r},${y} H${x + bw - r} Q${x + bw},${y} ${x + bw},${y + r} V${T + ph} Z`;
  };

  const hb = hover != null ? buckets[hover] : null;

  return (
    <div>
      <div className="seg" role="tablist" aria-label="Показател">
        {Object.entries(METRICS).map(([k, v]) => (
          <button key={k} role="tab" aria-selected={metric === k} className={metric === k ? "on" : ""} onClick={() => setMetric(k)}>
            {v.label}
          </button>
        ))}
      </div>

      <div className="chart-wrap" onMouseLeave={() => setHover(null)}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`${m.label} по период`}>
          {ticks.map((v) => {
            const y = T + ph - (v / top) * ph;
            return (
              <g key={v}>
                <line x1={L} x2={W - R} y1={y} y2={y} stroke="var(--grid)" strokeWidth="1" />
                <text x={L - 8} y={y + 4} textAnchor="end" fontSize="11" fill="var(--muted-ink)">{m.short(v)}</text>
              </g>
            );
          })}
          <line x1={L} x2={W - R} y1={T + ph} y2={T + ph} stroke="var(--axis)" strokeWidth="1" />

          {buckets.map((b, i) => {
            const x = L + i * band + (band - bw) / 2;
            const h = (Math.max(0, b[metric]) / top) * ph;
            return (
              <g key={b.key}>
                {h > 0 && <path d={barPath(x, h)} fill={hover === i ? "var(--series-1-hover)" : "var(--series-1)"} />}
                {i % every === 0 && (
                  <text x={x + bw / 2} y={H - 10} textAnchor="middle" fontSize="11" fill="var(--muted-ink)">{b.label.replace("седм. от ", "")}</text>
                )}
                <rect x={L + i * band} y={T} width={band} height={ph} fill="transparent" onMouseEnter={() => setHover(i)} onTouchStart={() => setHover(i)} />
              </g>
            );
          })}
        </svg>

        {hb && (
          <div className="tip" style={{ left: `${((L + hover * band + band / 2) / W) * 100}%` }}>
            <b>{hb.label}</b>
            <div>Приходи: {money(hb.revenue)}</div>
            <div>Поръчки: {hb.orders}</div>
            <div>Бройки: {hb.units}</div>
            <div>Печалба: {money(hb.profit)}</div>
          </div>
        )}
      </div>

      <details className="table-view">
        <summary>Покажи като таблица</summary>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Период</th><th>Приходи</th><th>Поръчки</th><th>Бройки</th><th>Печалба</th></tr></thead>
            <tbody>
              {buckets.map((b) => (
                <tr key={b.key}><td>{b.label}</td><td>{money(b.revenue)}</td><td>{b.orders}</td><td>{b.units}</td><td>{money(b.profit)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}

// Хоризонтални ленти: rows = [{ label, value, color, detail }]
export function HBars({ rows, format = "money", empty = "Още няма данни." }) {
  const [hover, setHover] = useState(null);
  if (!rows.length) return <p className="muted">{empty}</p>;
  const max = Math.max(...rows.map((r) => r.value), 1);
  const fmt = format === "money" ? money : (v) => String(v);
  return (
    <div className="hbars">
      {rows.map((r, i) => (
        <div key={r.label} className="hrow" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onTouchStart={() => setHover(i)}>
          <div className="hlabel">{r.label}</div>
          <div className="htrack">
            <div className="hbar" style={{ width: `${Math.max((r.value / max) * 100, r.value > 0 ? 1 : 0)}%`, background: r.color || "var(--series-1)" }} />
            <span className="hval">{fmt(r.value)}</span>
          </div>
          {hover === i && r.detail && <div className="tip tip-row"><b>{r.label}</b><div>{r.detail}</div></div>}
        </div>
      ))}
    </div>
  );
}

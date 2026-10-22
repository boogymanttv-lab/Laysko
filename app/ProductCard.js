import Link from "next/link";
import { eur } from "@/lib/format";
import { Arrow } from "./Icons";

export default function ProductCard({ p }) {
  const off = p.compare_at_cents > p.price_cents
    ? Math.round((1 - p.price_cents / p.compare_at_cents) * 100) : 0;
  return (
    <Link href={`/product/${p.slug}`} className="card">
      <div className="imgw">
        {p.images?.[0] ? <img src={p.images[0]} alt={p.title} /> : <div className="ph" />}
        {off > 0 && <span className="tag">-{off}%</span>}
      </div>
      <div className="body">
        {p.category && <span className="muted" style={{ fontSize: 13 }}>{p.category}</span>}
        <div className="title">{p.title}</div>
        <div className="foot">
          <div className="price">
            {eur(p.price_cents)}
            {off > 0 && <span className="old">{eur(p.compare_at_cents)}</span>}
          </div>
          <span className="go"><Arrow /></span>
        </div>
      </div>
    </Link>
  );
}

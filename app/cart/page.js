"use client";
import { useState } from "react";
import Link from "next/link";
import { useCart } from "../CartProvider";
import { Arrow, Shield } from "../Icons";

const eur = (c) =>
  new Intl.NumberFormat("bg-BG", { style: "currency", currency: "EUR" }).format((c || 0) / 100);

export default function CartPage() {
  const { items, ready, setQty, remove, total, count } = useCart();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function checkout() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: items.map((i) => ({ slug: i.slug, quantity: i.qty })) }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Грешка при плащането");
      window.location.href = data.url;
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  }

  return (
    <div className="container" style={{ paddingBottom: 80 }}>
      <div className="crumbs"><Link href="/">Начало</Link> / Кошница</div>
      <h1 style={{ fontSize: 36, margin: "0 0 24px" }}>Твоята кошница</h1>

      {!ready ? null : !items.length ? (
        <div className="empty">
          <h3 style={{ margin: "0 0 6px" }}>Кошницата е празна</h3>
          <p className="muted" style={{ margin: "0 0 20px" }}>Разгледай продуктите и добави нещо, което харесваш.</p>
          <Link href="/products" className="btn primary">Към продуктите <Arrow /></Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-list">
            {items.map((i) => (
              <div key={i.slug} className="cart-item">
                <Link href={`/product/${i.slug}`}>
                  {i.image ? <img src={i.image} alt={i.title} /> : <div className="ph" />}
                </Link>
                <div className="info">
                  <Link href={`/product/${i.slug}`} className="t">{i.title}</Link>
                  <span className="muted">{eur(i.price_cents)} / бр.</span>
                  <button className="link-btn" onClick={() => remove(i.slug)}>Премахни</button>
                </div>
                <div className="stepper">
                  <button type="button" aria-label="Намали" onClick={() => setQty(i.slug, i.qty - 1)}>−</button>
                  <span>{i.qty}</span>
                  <button type="button" aria-label="Увеличи" onClick={() => setQty(i.slug, i.qty + 1)}>+</button>
                </div>
                <div className="line-total">{eur(i.price_cents * i.qty)}</div>
              </div>
            ))}
          </div>

          <aside className="summary">
            <h3 style={{ margin: "0 0 16px" }}>Обобщение</h3>
            <div className="sum-row"><span>Артикули ({count})</span><span>{eur(total)}</span></div>
            <div className="sum-row muted"><span>Доставка</span><span>Включена</span></div>
            <div className="sum-row sum-total"><span>Общо</span><b>{eur(total)}</b></div>
            <button className="btn primary lg block" onClick={checkout} disabled={busy}>
              {busy ? "Зареждане..." : "Към плащане"}
            </button>
            {error && <p className="err" style={{ margin: "12px 0 0" }}>{error}</p>}
            <p className="muted" style={{ fontSize: 13, display: "flex", gap: 8, alignItems: "center", margin: "16px 0 0" }}>
              <Shield width={18} height={18} /> Поръчваш като гост. Не е нужна регистрация.
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}

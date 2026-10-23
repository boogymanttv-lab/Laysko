"use client";
import { useState } from "react";
import { Shield, Truck, Check, Bag } from "../../Icons";
import { useCart } from "../../CartProvider";

const eur = (c) =>
  new Intl.NumberFormat("bg-BG", { style: "currency", currency: "EUR" }).format((c || 0) / 100);

export default function BuyBox({ slug, title, image, priceCents, compareAtCents }) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const off = compareAtCents > priceCents ? Math.round((1 - priceCents / compareAtCents) * 100) : 0;

  function addToCart() {
    add({ slug, title, image: image || "", price_cents: priceCents }, qty);
  }

  async function buyNow() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: [{ slug, quantity: qty }] }),
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
    <>
      <div className="price">
        {eur(priceCents)}
        {off > 0 && <span className="old">{eur(compareAtCents)}</span>}
        {off > 0 && <span className="save">-{off}%</span>}
      </div>

      <div className="panel">
        <div className="qtyrow">
          <strong>Количество</strong>
          <div className="stepper">
            <button type="button" aria-label="Намали" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
            <span>{qty}</span>
            <button type="button" aria-label="Увеличи" onClick={() => setQty((q) => Math.min(10, q + 1))}>+</button>
          </div>
        </div>
        <div className="total"><span>Общо</span><b>{eur(priceCents * qty)}</b></div>
        <button className="btn primary lg block" onClick={addToCart}>
          <Bag width={20} height={20} /> Добави в кошницата
        </button>
        <button className="btn ghost lg block" style={{ marginTop: 10 }} onClick={buyNow} disabled={busy}>
          {busy ? "Зареждане..." : "Купи сега"}
        </button>
        {error && <p className="err" style={{ margin: "12px 0 0" }}>{error}</p>}
      </div>

      <ul className="perks">
        <li><Shield width={18} height={18} /> Сигурно плащане със Stripe</li>
        <li><Truck width={18} height={18} /> Доставка до адреса ти за 1–3 работни дни</li>
        <li><Check /> Поръчка като гост, без регистрация</li>
      </ul>
    </>
  );
}

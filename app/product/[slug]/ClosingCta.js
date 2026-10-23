"use client";
import { useCart } from "../../CartProvider";
import { Bag } from "../../Icons";

const eur = (c) =>
  new Intl.NumberFormat("bg-BG", { style: "currency", currency: "EUR" }).format((c || 0) / 100);

export default function ClosingCta({ slug, title, image, priceCents, compareAtCents }) {
  const { add } = useCart();
  return (
    <div className="closing">
      <div>
        <h2>{title}</h2>
        <div className="price" style={{ fontSize: 30 }}>
          {eur(priceCents)}
          {compareAtCents > priceCents && <span className="old" style={{ color: "#c9c9ff" }}>{eur(compareAtCents)}</span>}
        </div>
        <p>Сигурно плащане със Stripe · Доставка до адреса ти за 1–3 работни дни</p>
      </div>
      <button className="btn lg" onClick={() => add({ slug, title, image: image || "", price_cents: priceCents }, 1)}>
        <Bag width={20} height={20} /> Добави в кошницата
      </button>
    </div>
  );
}

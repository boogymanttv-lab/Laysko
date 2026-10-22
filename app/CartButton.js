"use client";
import Link from "next/link";
import { useCart } from "./CartProvider";
import { Bag } from "./Icons";

export default function CartButton() {
  const { count, ready } = useCart();
  return (
    <Link href="/cart" className="cart-btn" aria-label="Кошница">
      <Bag />
      {ready && count > 0 && <span className="count">{count}</span>}
    </Link>
  );
}

"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "./CartProvider";
import { Bag, Home, Store } from "./Icons";

export default function MobileNav() {
  const path = usePathname() || "/";
  const { count, ready } = useCart();
  if (path.startsWith("/admin")) return null;
  const on = (p) => (p === "/" ? path === "/" : path.startsWith(p));
  return (
    <nav className="mnav" aria-label="Навигация">
      <Link href="/" className={on("/") ? "on" : ""}><Home /><span>Начало</span></Link>
      <Link href="/products" className={on("/products") || on("/product") ? "on" : ""}><Store /><span>Магазин</span></Link>
      <Link href="/cart" className={on("/cart") ? "on" : ""}>
        <span className="mi"><Bag />{ready && count > 0 && <i>{count}</i>}</span><span>Количка</span>
      </Link>
    </nav>
  );
}

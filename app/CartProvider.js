"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

const KEY = "cart_v1";
const Ctx = createContext(null);

export const useCart = () => useContext(Ctx);

export default function CartProvider({ children }) {
  const [items, setItems] = useState([]); // [{slug,title,price_cents,image,qty}]
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState(null);
  const timer = useRef(null);

  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
      if (Array.isArray(raw)) setItems(raw);
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch {}
  }, [items, ready]);

  const add = useCallback((p, qty = 1) => {
    setItems((cur) => {
      const found = cur.find((i) => i.slug === p.slug);
      if (found) return cur.map((i) => (i.slug === p.slug ? { ...i, ...p, qty: Math.min(10, i.qty + qty) } : i));
      return [...cur, { ...p, qty: Math.min(10, qty) }];
    });
    setToast(p.title);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  const setQty = useCallback((slug, qty) => {
    setItems((cur) =>
      cur.map((i) => (i.slug === slug ? { ...i, qty: Math.max(1, Math.min(10, qty)) } : i))
    );
  }, []);
  const remove = useCallback((slug) => setItems((cur) => cur.filter((i) => i.slug !== slug)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(() => ({
    items, ready, add, setQty, remove, clear,
    count: items.reduce((n, i) => n + i.qty, 0),
    total: items.reduce((n, i) => n + i.qty * i.price_cents, 0),
  }), [items, ready, add, setQty, remove, clear]);

  return (
    <Ctx.Provider value={value}>
      {children}
      {toast && (
        <div className="toast" role="status">
          <span>✓ Добавено: <b>{toast}</b></span>
          <Link href="/cart" className="btn sm" onClick={() => setToast(null)}>Към кошницата</Link>
        </div>
      )}
    </Ctx.Provider>
  );
}

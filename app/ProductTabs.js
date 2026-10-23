"use client";
import { useState } from "react";
import Link from "next/link";
import ProductCard from "./ProductCard";

export default function ProductTabs({ title, best, fresh }) {
  const [tab, setTab] = useState(best.length ? "best" : "new");
  const list = tab === "best" ? best : fresh;
  return (
    <div>
      <div className="tabs-head">
        <h2 className="sec-title left" style={{ margin: 0 }}>{title}</h2>
        <Link href="/products" className="link-arrow">Всички продукти →</Link>
      </div>
      {best.length > 0 && (
        <div className="tabs" role="tablist">
          <button role="tab" aria-selected={tab === "best"} className={tab === "best" ? "on" : ""} onClick={() => setTab("best")}>Бестселъри</button>
          <button role="tab" aria-selected={tab === "new"} className={tab === "new" ? "on" : ""} onClick={() => setTab("new")}>Нови продукти</button>
        </div>
      )}
      <div className="grid shop-grid">{list.map((p) => <ProductCard key={p.id} p={p} />)}</div>
    </div>
  );
}

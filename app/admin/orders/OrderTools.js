"use client";
import { useState } from "react";

function CopyBtn({ label, text, primary }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const t = document.createElement("textarea");
      t.value = text; document.body.appendChild(t); t.select();
      try { document.execCommand("copy"); } catch {}
      t.remove();
    }
    setDone(true);
    setTimeout(() => setDone(false), 1600);
  };
  return (
    <button type="button" onClick={copy} className={"btn sm " + (primary ? "primary" : "ghost")} disabled={!text}>
      {done ? "Копирано ✓" : label}
    </button>
  );
}

// Бързи действия за ръчно поръчване при доставчика: копиране на данните и отваряне на линковете
export default function OrderTools({ name, phone, email, addressLine, fullBlock, links }) {
  return (
    <div className="order-tools">
      <div className="ot-row">
        <CopyBtn primary label="Копирай всички данни за доставка" text={fullBlock} />
        <CopyBtn label="Име" text={name} />
        <CopyBtn label="Адрес" text={addressLine} />
        <CopyBtn label="Телефон" text={phone} />
        <CopyBtn label="Имейл" text={email} />
      </div>
      {links.length > 0 && (
        <div className="ot-row">
          {links.map((l, i) => (
            <a key={i} href={l.url} target="_blank" rel="noreferrer" className="btn sm">
              Отвори при доставчика{links.length > 1 ? `: ${l.title}` : ""} ↗
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

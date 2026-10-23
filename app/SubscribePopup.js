"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const WEEK = 7 * 24 * 3600 * 1000;

export default function SubscribePopup({ enabled, delay, percent, title, text }) {
  const path = usePathname() || "/";
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [res, setRes] = useState(null);
  const [copied, setCopied] = useState(false);

  const blocked = /^\/(admin|cart|success)/.test(path);

  useEffect(() => {
    if (!enabled || blocked) return;
    try {
      if (localStorage.getItem("sub_done")) return;
      const closed = Number(localStorage.getItem("sub_closed") || 0);
      if (closed && Date.now() - closed < WEEK) return;
    } catch {}
    const t = setTimeout(() => setOpen(true), Math.max(3, delay) * 1000);
    return () => clearTimeout(t);
  }, [enabled, delay, blocked]);

  useEffect(() => {
    if (!open) return;
    const k = (e) => e.key === "Escape" && close();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
    // eslint-disable-next-line
  }, [open]);

  function close() {
    setOpen(false);
    try { if (!res) localStorage.setItem("sub_closed", String(Date.now())); } catch {}
  }

  async function submit(e) {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      const r = await fetch("/api/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, consent }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Грешка");
      setRes(d);
      try {
        localStorage.setItem("sub_done", "1");
        if (d.code) localStorage.setItem("disc_code", d.code);
      } catch {}
    } catch (x) { setErr(x.message); }
    setBusy(false);
  }

  if (!open) return null;
  return (
    <div className="sub-back" onClick={close}>
      <div className="sub-box" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <button className="sub-x" aria-label="Затвори" onClick={close}>×</button>
        <div className="sub-paw">🐾</div>
        {!res ? (
          <>
            <h2>{title}</h2>
            <p>{text}</p>
            <form onSubmit={submit}>
              <input type="email" required placeholder="Твоят имейл" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
              <label className="sub-consent">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                <span>Съгласен съм да получавам имейли с новини и промоции. Мога да се отпиша по всяко време.</span>
              </label>
              {err && <p className="err" style={{ margin: "0 0 8px", fontSize: 13 }}>{err}</p>}
              <button className="btn lg block" disabled={busy || !consent}>{busy ? "Момент..." : `Искам ${percent}% отстъпка`}</button>
            </form>
            <button className="sub-skip" onClick={close}>Не, благодаря</button>
          </>
        ) : res.existing ? (
          <>
            <h2>Вече си абониран</h2>
            <p>{res.used ? "Кодът за отстъпка за този имейл вече е използван." : "Този имейл вече е абониран. Изпратихме ти кода отново – провери пощата си."}</p>
            <button className="btn lg block" onClick={() => setOpen(false)}>Към магазина</button>
          </>
        ) : (
          <>
            <h2>Благодарим ти! 🎉</h2>
            <p>Ето личния ти код за {res.percent}% отстъпка (еднократен):</p>
            <div className="sub-code">{res.code}</div>
            <p className="sub-note">{res.emailed ? "Изпратихме го и на имейла ти. " : ""}Кодът се прилага автоматично в кошницата.</p>
            <button className="btn ghost sm" onClick={() => { try { navigator.clipboard.writeText(res.code); setCopied(true); } catch {} }}>{copied ? "Копирано ✓" : "Копирай кода"}</button>{" "}
            <button className="btn sm" onClick={() => setOpen(false)}>Към магазина</button>
          </>
        )}
      </div>
    </div>
  );
}

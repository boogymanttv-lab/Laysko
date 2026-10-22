"use client";
import { useEffect, useState } from "react";

export default function CookieBar() {
  const [show, setShow] = useState(false);
  useEffect(() => { try { if (!localStorage.getItem("cookie_ok")) setShow(true); } catch {} }, []);
  if (!show) return null;
  const close = (v) => { try { localStorage.setItem("cookie_ok", v); } catch {} setShow(false); };
  return (
    <div className="cookie" role="dialog" aria-label="Бисквитки">
      <p>Използваме само необходими бисквитки – за кошницата и за сигурното плащане.</p>
      <div><button className="btn ghost sm" onClick={() => close("no")}>Отхвърли</button> <button className="btn sm" onClick={() => close("yes")}>Приемам</button></div>
    </div>
  );
}

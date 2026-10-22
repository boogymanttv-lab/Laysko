"use client";
import { useState } from "react";
import { useFormState } from "react-dom";
import { saveHero } from "../actions";

function Slot({ n, current }) {
  const [preview, setPreview] = useState(null);
  const shown = preview || current;
  return (
    <div style={{ padding: "8px 0 4px" }}>
      <h3 style={{ margin: "16px 0 4px", fontSize: 16 }}>Снимка {n} {n === 1 ? "(голямата, горе вдясно)" : "(малката, долу вляво)"}</h3>
      <div style={{ width: 160, height: 160, borderRadius: 16, overflow: "hidden", background: "var(--soft)", border: "1px solid var(--line)" }}>
        {shown ? <img src={shown} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (
          <div className="muted" style={{ display: "grid", placeItems: "center", height: "100%", fontSize: 13 }}>Няма снимка</div>
        )}
      </div>
      <label htmlFor={`file${n}`}>Качи от компютъра (до 4 MB)</label>
      <input id={`file${n}`} name={`file${n}`} type="file" accept="image/*"
        onChange={(e) => { const f = e.target.files?.[0]; setPreview(f ? URL.createObjectURL(f) : null); }} />
      <label htmlFor={`url${n}`}>…или постави линк към снимка</label>
      <input id={`url${n}`} name={`url${n}`} type="url" placeholder="https://..." />
      {current && (
        <label style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 400 }}>
          <input type="checkbox" name={`clear${n}`} style={{ width: "auto" }} />
          Премахни тази снимка (ще се ползва снимката на продукта)
        </label>
      )}
    </div>
  );
}

export default function HeroForm({ hero1, hero2 }) {
  const [state, action] = useFormState(saveHero, null);
  return (
    <form action={action} className="form-card">
      <Slot n={1} current={hero1} />
      <hr style={{ border: 0, borderTop: "1px solid var(--line)", margin: "20px 0 0" }} />
      <Slot n={2} current={hero2} />
      {state?.error && <p className="err">{state.error}</p>}
      {state?.ok && <p className="ok">{state.ok}</p>}
      <div style={{ marginTop: 16 }}><button className="btn primary">Запази</button></div>
    </form>
  );
}

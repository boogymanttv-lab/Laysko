"use client";
import { shrink } from "./shrink";

let counter = 0;
export const rid = () => `c${++counter}${Math.random().toString(36).slice(2, 6)}`;

// Превръща записаното съдържание във вид за редактиране
export function contentToState(c = {}) {
  return {
    bullets: (c.bullets || []).join("\n"),
    sections: (c.sections || []).map((s) => ({ id: rid(), title: s.title || "", text: s.text || "", url: s.image || "", file: null, preview: null })),
    features: (c.features || []).map((f) => ({ id: rid(), title: f.title || "", text: f.text || "" })),
    faq: (c.faq || []).map((f) => ({ id: rid(), q: f.q || "", a: f.a || "" })),
    specs: (c.specs || []).map((s) => ({ id: rid(), k: s.k || "", v: s.v || "" })),
  };
}

export default function ContentEditor({ value, onChange }) {
  const set = (patch) => onChange({ ...value, ...patch });
  const upd = (key, id, patch) => set({ [key]: value[key].map((r) => (r.id === id ? { ...r, ...patch } : r)) });
  const del = (key, id) => set({ [key]: value[key].filter((r) => r.id !== id) });
  const add = (key, row) => set({ [key]: [...value[key], { id: rid(), ...row }] });
  const move = (key, id, dir) => {
    const list = [...value[key]];
    const i = list.findIndex((r) => r.id === id);
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    set({ [key]: list });
  };

  async function pickFile(id, e) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    const small = await shrink(f);
    upd("sections", id, { file: small, preview: URL.createObjectURL(small), url: "" });
  }

  const Bar = ({ k, id, label }) => (
    <div className="row-tools">
      <strong>{label}</strong>
      <span>
        <button type="button" onClick={() => move(k, id, -1)} aria-label="Нагоре">↑</button>
        <button type="button" onClick={() => move(k, id, 1)} aria-label="Надолу">↓</button>
        <button type="button" className="rm" onClick={() => del(k, id)}>Махни</button>
      </span>
    </div>
  );

  return (
    <div className="content-editor">
      <h3>Съдържание на продуктовата страница</h3>
      <p className="muted" style={{ fontSize: 13, margin: "0 0 4px" }}>
        Всичко е по избор. Празните части не се показват в магазина.
      </p>

      <label htmlFor="bullets">Кратки предимства под цената (по едно на ред)</label>
      <textarea id="bullets" style={{ minHeight: 90 }} value={value.bullets} onChange={(e) => set({ bullets: e.target.value })}
        placeholder={"Лесно за използване\nМного трайно\nПодходящо за подарък"} />

      <div className="ce-group">
        <div className="ce-head"><h4>Секции с текст и снимка</h4>
          <button type="button" className="btn ghost sm" onClick={() => add("sections", { title: "", text: "", url: "", file: null, preview: null })}>+ Секция</button></div>
        {value.sections.map((s, i) => (
          <div key={s.id} className="ce-card">
            <Bar k="sections" id={s.id} label={`Секция ${i + 1}`} />
            <label>Заглавие (например проблемът или предимството)</label>
            <input value={s.title} onChange={(e) => upd("sections", s.id, { title: e.target.value })} />
            <label>Текст</label>
            <textarea value={s.text} onChange={(e) => upd("sections", s.id, { text: e.target.value })} />
            <label>Снимка</label>
            {(s.preview || s.url) && <img className="ce-img" src={s.preview || s.url} alt="" />}
            <input type="file" accept="image/*" onChange={(e) => pickFile(s.id, e)} />
            <input style={{ marginTop: 6 }} placeholder="…или линк към снимка (https://...)" value={s.file ? "" : s.url}
              onChange={(e) => upd("sections", s.id, { url: e.target.value, file: null, preview: null })} />
          </div>
        ))}
      </div>

      <div className="ce-group">
        <div className="ce-head"><h4>Решетка с предимства (малки карти)</h4>
          <button type="button" className="btn ghost sm" onClick={() => add("features", { title: "", text: "" })}>+ Предимство</button></div>
        {value.features.map((f, i) => (
          <div key={f.id} className="ce-card">
            <Bar k="features" id={f.id} label={`Предимство ${i + 1}`} />
            <input placeholder="Заглавие" value={f.title} onChange={(e) => upd("features", f.id, { title: e.target.value })} />
            <textarea style={{ minHeight: 70, marginTop: 6 }} placeholder="Кратко описание" value={f.text}
              onChange={(e) => upd("features", f.id, { text: e.target.value })} />
          </div>
        ))}
      </div>

      <div className="ce-group">
        <div className="ce-head"><h4>Характеристики (таблица)</h4>
          <button type="button" className="btn ghost sm" onClick={() => add("specs", { k: "", v: "" })}>+ Ред</button></div>
        {value.specs.map((s) => (
          <div key={s.id} className="ce-inline">
            <input placeholder="Например: Материал" value={s.k} onChange={(e) => upd("specs", s.id, { k: e.target.value })} />
            <input placeholder="Например: Неръждаема стомана" value={s.v} onChange={(e) => upd("specs", s.id, { v: e.target.value })} />
            <button type="button" className="rm" onClick={() => del("specs", s.id)}>✕</button>
          </div>
        ))}
      </div>

      <div className="ce-group">
        <div className="ce-head"><h4>Често задавани въпроси</h4>
          <button type="button" className="btn ghost sm" onClick={() => add("faq", { q: "", a: "" })}>+ Въпрос</button></div>
        {value.faq.map((f, i) => (
          <div key={f.id} className="ce-card">
            <Bar k="faq" id={f.id} label={`Въпрос ${i + 1}`} />
            <input placeholder="Въпрос" value={f.q} onChange={(e) => upd("faq", f.id, { q: e.target.value })} />
            <textarea style={{ minHeight: 70, marginTop: 6 }} placeholder="Отговор" value={f.a}
              onChange={(e) => upd("faq", f.id, { a: e.target.value })} />
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";
import { useEffect, useRef, useState } from "react";
import { useFormState } from "react-dom";
import { saveProduct } from "../actions";
import { shrink } from "./shrink";
import ContentEditor, { contentToState } from "./ContentEditor";

let uid = 0;
const nid = () => `i${++uid}`;

export default function ProductForm({ product, categories = [] }) {
  const p = product || {};
  const [state, action] = useFormState(saveProduct, null);
  const errRef = useRef(null);

  const [sourceUrl, setSourceUrl] = useState(p.source_url || "");
  const [source, setSource] = useState(p.source || "other");
  const [title, setTitle] = useState(p.title || "");
  const [description, setDescription] = useState(p.description || "");
  const [supplierCost, setSupplierCost] = useState(p.supplier_cost_cents != null ? (p.supplier_cost_cents / 100).toFixed(2) : "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [pending, setPending] = useState(false);

  // Снимки: [{ id, url } | { id, file, preview }]
  const [items, setItems] = useState((p.images || []).map((url) => ({ id: nid(), url })));
  const [urlInput, setUrlInput] = useState("");
  const [imgErr, setImgErr] = useState("");
  const [content, setContent] = useState(() => contentToState(p.content));
  const [submitErr, setSubmitErr] = useState("");

  useEffect(() => {
    if (state?.error) {
      setPending(false);
      errRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [state]);

  const fileItems = items.filter((i) => i.file);
  const layout = JSON.stringify(
    items.map((i) => (i.file ? { f: fileItems.indexOf(i) } : { u: i.url }))
  );

  const secFiles = content.sections.filter((x) => x.file);
  const contentJson = JSON.stringify({
    bullets: content.bullets.split("\n").map((x) => x.trim()).filter(Boolean),
    sections: content.sections.map((x) => ({
      title: x.title, text: x.text,
      image: x.file ? { f: secFiles.indexOf(x) } : { u: x.url },
    })),
    features: content.features.map(({ title, text }) => ({ title, text })),
    faq: content.faq.map(({ q, a }) => ({ q, a })),
    specs: content.specs.map(({ k, v }) => ({ k, v })),
  });

  async function addFiles(e) {
    setImgErr("");
    const picked = [...(e.target.files || [])];
    e.target.value = "";
    const added = [];
    for (const f of picked) {
      const small = await shrink(f);
      added.push({ id: nid(), file: small, preview: URL.createObjectURL(small) });
    }
    setItems((cur) => {
      const next = [...cur, ...added];
      const total = next.filter((i) => i.file).reduce((n, i) => n + i.file.size, 0);
      if (total > 4.2 * 1024 * 1024) {
        setImgErr("Снимките са твърде големи наведнъж. Качи по-малко снимки на веднъж.");
        return cur;
      }
      return next;
    });
  }

  function addUrl() {
    const u = urlInput.trim();
    if (!/^https?:\/\//.test(u)) { setImgErr("Линкът трябва да започва с https://"); return; }
    setImgErr("");
    setItems((cur) => [...cur, { id: nid(), url: u }]);
    setUrlInput("");
  }

  const remove = (id) => setItems((cur) => cur.filter((i) => i.id !== id));
  const makeMain = (id) => setItems((cur) => {
    const it = cur.find((i) => i.id === id);
    return [it, ...cur.filter((i) => i.id !== id)];
  });

  async function importFromUrl() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: sourceUrl }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Грешка");
      if (d.title) setTitle(d.title);
      if (d.description) setDescription(d.description);
      if (d.images?.length) setItems(d.images.map((url) => ({ id: nid(), url })));
      if (d.source) setSource(d.source);
      if (d.supplierPrice && (!d.supplierCurrency || d.supplierCurrency === "EUR")) setSupplierCost(String(d.supplierPrice));
      setMsg({ ok: true, text: "Данните са заредени – прегледай ги и задай своята цена." +
        (d.supplierPrice ? ` Цена при доставчика: ${d.supplierPrice} ${d.supplierCurrency || ""}` : "") });
    } catch (e) {
      setMsg({ ok: false, text: e.message });
    }
    setBusy(false);
  }

  // Добавя новите файлове към формата при изпращане
  function submit(fd) {
    const total = [...fileItems, ...secFiles].reduce((n, i) => n + i.file.size, 0);
    if (total > 4.2 * 1024 * 1024) {
      setSubmitErr("Новите снимки са твърде големи наведнъж. Запази първо част от тях, после добави останалите.");
      return;
    }
    setSubmitErr("");
    fileItems.forEach((i) => fd.append("files", i.file));
    secFiles.forEach((i) => fd.append("secfiles", i.file));
    setPending(true);
    action(fd);
  }

  return (
    <form action={submit} className="form-card">
      {p.id && <input type="hidden" name="id" value={p.id} />}
      <input type="hidden" name="layout" value={layout} />

      <div ref={errRef}>
        {state?.error && <div className="banner-err">⚠ {state.error}</div>}
      </div>

      <label htmlFor="source_url">Линк към продукта (Etsy / Temu)</label>
      <div style={{ display: "flex", gap: 8 }}>
        <input id="source_url" name="source_url" type="url" value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://www.etsy.com/listing/..." />
        <button type="button" className="btn ghost" onClick={importFromUrl} disabled={busy || !sourceUrl}>
          {busy ? "..." : "Дръпни"}
        </button>
      </div>
      {msg && <p className={msg.ok ? "ok" : "err"} style={{ fontSize: 14 }}>{msg.text}</p>}

      <label htmlFor="source">Източник</label>
      <select id="source" name="source" value={source} onChange={(e) => setSource(e.target.value)}>
        <option value="etsy">Etsy</option>
        <option value="temu">Temu</option>
        <option value="other">Друг</option>
      </select>

      <label htmlFor="title">Заглавие</label>
      <input id="title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} required />

      <label htmlFor="category">Категория</label>
      <select id="category" name="category" defaultValue={p.category || ""}>
        <option value="">— без категория —</option>
        {p.category && !categories.includes(p.category) && <option value={p.category}>{p.category}</option>}
        {categories.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
      <p className="muted" style={{ margin: "4px 0 0", fontSize: 13 }}>
        Категориите се създават първо от <a href="/admin/categories" style={{ textDecoration: "underline" }}>Админ → Категории</a>.
      </p>

      <label htmlFor="description">Описание</label>
      <textarea id="description" name="description" value={description} onChange={(e) => setDescription(e.target.value)} />

      <label>Снимки</label>
      <p className="muted" style={{ fontSize: 13, margin: "0 0 8px" }}>
        Първата снимка е главната и се показва в магазина. Добавяй, махай и подреждай свободно.
      </p>
      {items.length > 0 ? (
        <div className="imgs">
          {items.map((it, idx) => (
            <div key={it.id} className="img-tile">
              <img src={it.preview || it.url} alt="" />
              {idx === 0 && <span className="main-badge">Главна</span>}
              {it.file && <span className="new-badge">Нова</span>}
              <div className="img-actions">
                {idx !== 0 && <button type="button" onClick={() => makeMain(it.id)}>Главна</button>}
                <button type="button" onClick={() => remove(it.id)}>Махни</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="muted" style={{ fontSize: 14 }}>Още няма снимки.</p>
      )}
      <label htmlFor="files" style={{ marginTop: 12 }}>Качи снимки от компютъра</label>
      <input id="files" type="file" accept="image/*" multiple onChange={addFiles} />
      <label htmlFor="urlInput">…или добави снимка с линк</label>
      <div style={{ display: "flex", gap: 8 }}>
        <input id="urlInput" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder="https://..."
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addUrl(); } }} />
        <button type="button" className="btn ghost" onClick={addUrl}>Добави</button>
      </div>
      {imgErr && <p className="err" style={{ fontSize: 14 }}>{imgErr}</p>}

      <div className="two">
        <div>
          <label htmlFor="price">Твоя цена (EUR)</label>
          <input id="price" name="price" inputMode="decimal" required defaultValue={p.price_cents != null ? (p.price_cents / 100).toFixed(2) : ""} />
        </div>
        <div>
          <label htmlFor="compare_at">Зачеркната цена (по избор)</label>
          <input id="compare_at" name="compare_at" inputMode="decimal" defaultValue={p.compare_at_cents != null ? (p.compare_at_cents / 100).toFixed(2) : ""} />
        </div>
      </div>

      <div className="two">
        <div>
          <label htmlFor="supplier_cost">Цена при доставчика (EUR, само за теб)</label>
          <input id="supplier_cost" name="supplier_cost" inputMode="decimal" value={supplierCost} onChange={(e) => setSupplierCost(e.target.value)} />
        </div>
        <div>
          <label htmlFor="slug">Адрес (slug, по избор)</label>
          <input id="slug" name="slug" defaultValue={p.slug || ""} placeholder="генерира се автоматично" />
        </div>
      </div>

      <input type="hidden" name="content" value={contentJson} />
      <ContentEditor value={content} onChange={setContent} />

      <label style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 400 }}>
        <input type="checkbox" name="active" style={{ width: "auto" }} defaultChecked={p.active ?? true} />
        Показвай в магазина
      </label>
      {!p.id && (
        <label style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 400 }}>
          <input type="checkbox" name="notify" style={{ width: "auto" }} defaultChecked />
          Изпрати имейл за този продукт на абонатите
        </label>
      )}

      {submitErr && <div className="banner-err" style={{ marginTop: 16 }}>⚠ {submitErr}</div>}
      {state?.error && <div className="banner-err" style={{ marginTop: 16 }}>⚠ {state.error}</div>}
      <div style={{ marginTop: 16 }}>
        <button className="btn primary" disabled={pending}>{pending ? "Запазване..." : "Запази"}</button>
      </div>
    </form>
  );
}

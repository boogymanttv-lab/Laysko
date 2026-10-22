"use client";
import { useState, useTransition } from "react";
import { useFormState } from "react-dom";
import { saveHome } from "../actions";
import { shrink } from "../products/shrink";

function T({ label, value, onChange, area, ph }) {
  return (
    <>
      <label>{label}</label>
      {area ? <textarea rows={3} value={value} placeholder={ph} onChange={(e) => onChange(e.target.value)} />
            : <input value={value} placeholder={ph} onChange={(e) => onChange(e.target.value)} />}
    </>
  );
}

function Img({ label, value, onUrl, onFile, preview }) {
  const shown = preview || value;
  return (
    <div style={{ marginTop: 8 }}>
      <label>{label}</label>
      <div style={{ width: 140, height: 105, borderRadius: 12, overflow: "hidden", background: "var(--soft)", border: "1px solid var(--line)" }}>
        {shown ? <img src={shown} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null}
      </div>
      <input type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0] || null)} />
      <input type="url" placeholder="…или линк към снимка https://" value={value.startsWith("blob:") ? "" : value} onChange={(e) => onUrl(e.target.value)} />
    </div>
  );
}

const Sec = ({ title, hint, children }) => (
  <section style={{ borderTop: "1px solid var(--line)", marginTop: 22, paddingTop: 6 }}>
    <h3 style={{ margin: "14px 0 2px", fontSize: 17 }}>{title}</h3>
    {hint && <p className="muted" style={{ margin: "0 0 4px", fontSize: 13 }}>{hint}</p>}
    {children}
  </section>
);

export default function HomeForm({ initial, categories }) {
  const [c, setC] = useState(initial);
  const [files, setFiles] = useState({});
  const [previews, setPreviews] = useState({});
  const [state, action] = useFormState(saveHome, null);
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState(false);

  const set = (path, v) => setC((cur) => {
    const n = JSON.parse(JSON.stringify(cur));
    let o = n; const ks = path.split(".");
    ks.slice(0, -1).forEach((k) => (o = o[k]));
    o[ks[ks.length - 1]] = v;
    return n;
  });
  const pickFile = async (key, f) => {
    if (!f) { setFiles((s) => ({ ...s, [key]: null })); setPreviews((s) => ({ ...s, [key]: null })); return; }
    const small = key === "logo" ? f : await shrink(f); // логото не се смалява (запазва прозрачността)
    setFiles((s) => ({ ...s, [key]: small }));
    setPreviews((s) => ({ ...s, [key]: URL.createObjectURL(small) }));
  };

  const submit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.set("cfg", JSON.stringify(c));
    let total = 0;
    for (const k of Object.keys(files)) if (files[k]) { fd.set(`img_${k}`, files[k]); total += files[k].size; }
    if (total > 4.2 * 1024 * 1024) { alert("Снимките са над 4 MB общо. Качи по-малко наведнъж или ползвай линкове."); return; }
    setBusy(true);
    start(() => { action(fd); setFiles({}); setBusy(false); });
  };

  return (
    <form onSubmit={submit} className="form-card" style={{ maxWidth: 820 }}>
      <Sec title="Лого" hint="Качи логото си (PNG с прозрачен фон или SVG, до 4 MB). Ако не качиш, се показва логото Laysko с котенцето, което е по подразбиране.">
        <Img label="Лого" value={c.images.logo} preview={previews.logo} onUrl={(v) => set("images.logo", v)} onFile={(f) => pickFile("logo", f)} />
        {c.images.logo && <button type="button" className="btn ghost sm" style={{ marginTop: 8 }} onClick={() => { set("images.logo", ""); setPreviews((s) => ({ ...s, logo: null })); setFiles((s) => ({ ...s, logo: null })); }}>Върни логото по подразбиране</button>}
      </Sec>

      <Sec title="Бягаща лента най-горе" hint="Всеки ред е отделно съобщение. Лентата се върти сама.">
        <textarea rows={3} value={c.marquee} onChange={(e) => set("marquee", e.target.value)} />
      </Sec>

      <Sec title="Начало (hero)">
        <T label="Малък надпис над заглавието" value={c.hero.eyebrow} onChange={(v) => set("hero.eyebrow", v)} />
        <T label="Заглавие" value={c.hero.title} onChange={(v) => set("hero.title", v)} />
        <T label="Подзаглавие" area value={c.hero.sub} onChange={(v) => set("hero.sub", v)} />
        <T label="Бутон 1" value={c.hero.btn1} onChange={(v) => set("hero.btn1", v)} />
        <T label="Бутон 2 (към категориите)" value={c.hero.btn2} onChange={(v) => set("hero.btn2", v)} />
        <Img label="Снимка" value={c.images.hero} preview={previews.hero} onUrl={(v) => set("images.hero", v)} onFile={(f) => pickFile("hero", f)} />
      </Sec>

      <Sec title="Четирите значки под hero-то">
        {c.badges.map((b, i) => (
          <div key={i} className="ce-inline" style={{ gridTemplateColumns: "1fr 1.4fr" }}>
            <input value={b.t} placeholder="Заглавие" onChange={(e) => set(`badges.${i}.t`, e.target.value)} />
            <input value={b.s} placeholder="Подзаглавие" onChange={(e) => set(`badges.${i}.s`, e.target.value)} />
          </div>
        ))}
      </Sec>

      <Sec title="Категории" hint="Плочките се правят автоматично от категориите на продуктите.">
        <T label="Заглавие на секцията" value={c.catsTitle} onChange={(v) => set("catsTitle", v)} />
      </Sec>

      <Sec title="Промо блок (снимка + продукти от категория)" hint="Показва се само ако избереш категория.">
        <T label="Малък надпис" value={c.promo.eyebrow} onChange={(v) => set("promo.eyebrow", v)} />
        <T label="Заглавие" value={c.promo.title} onChange={(v) => set("promo.title", v)} />
        <T label="Бутон" value={c.promo.btn} onChange={(v) => set("promo.btn", v)} />
        <label>Категория</label>
        <select value={c.promo.category} onChange={(e) => set("promo.category", e.target.value)}>
          <option value="">— скрий блока —</option>
          {categories.map((x) => <option key={x} value={x}>{x}</option>)}
        </select>
        <Img label="Снимка" value={c.images.promo} preview={previews.promo} onUrl={(v) => set("images.promo", v)} onFile={(f) => pickFile("promo", f)} />
      </Sec>

      <Sec title="Продукти (раздели Бестселъри / Нови)">
        <T label="Заглавие" value={c.tabsTitle} onChange={(v) => set("tabsTitle", v)} />
      </Sec>

      <Sec title="Нашата история">
        <T label="Малък надпис" value={c.story.eyebrow} onChange={(v) => set("story.eyebrow", v)} />
        <T label="Заглавие" value={c.story.title} onChange={(v) => set("story.title", v)} />
        <T label="Текст" area value={c.story.text} onChange={(v) => set("story.text", v)} />
        <T label="Бутон (към Контакти)" value={c.story.btn} onChange={(v) => set("story.btn", v)} />
        <Img label="Снимка" value={c.images.story} preview={previews.story} onUrl={(v) => set("images.story", v)} onFile={(f) => pickFile("story", f)} />
      </Sec>

      <Sec title="Клипове / видео" hint="Постави линк към YouTube (и Shorts), Vimeo или директен .mp4 файл. Секцията се показва само ако има поне един клип.">
        <T label="Заглавие на секцията" value={c.videosTitle} onChange={(v) => set("videosTitle", v)} />
        {c.videos.map((v, i) => (
          <div key={i} className="ce-inline" style={{ gridTemplateColumns: "1fr 1.6fr" }}>
            <input value={v.title} placeholder={`Клип ${i + 1}: надпис`} onChange={(e) => set(`videos.${i}.title`, e.target.value)} />
            <input value={v.url} placeholder="https://youtube.com/shorts/… или .mp4" onChange={(e) => set(`videos.${i}.url`, e.target.value)} />
          </div>
        ))}
      </Sec>

      <Sec title="Доставка, плащане и връщане">
        <T label="Заглавие" value={c.delivery.title} onChange={(v) => set("delivery.title", v)} />
        <T label="Доставка" area value={c.delivery.ship} onChange={(v) => set("delivery.ship", v)} />
        <T label="Плащане" area value={c.delivery.pay} onChange={(v) => set("delivery.pay", v)} />
        <T label="Връщане" area value={c.delivery.ret} onChange={(v) => set("delivery.ret", v)} />
      </Sec>

      <Sec title="Футър и контакти">
        <T label="Кратко описание" area value={c.footer.about} onChange={(v) => set("footer.about", v)} />
        <T label="Имейл" value={c.footer.email} onChange={(v) => set("footer.email", v)} />
        <T label="Телефон" value={c.footer.phone} onChange={(v) => set("footer.phone", v)} />
        <T label="Адрес" value={c.footer.address} onChange={(v) => set("footer.address", v)} />
      </Sec>

      {state?.error && <p className="err">{state.error}</p>}
      {state?.ok && <p className="ok">{state.ok}</p>}
      <div style={{ marginTop: 16 }}><button className="btn primary" disabled={pending || busy}>{pending ? "Запазвам…" : "Запази"}</button></div>
    </form>
  );
}

import { Check } from "../../Icons";

export function Bullets({ items }) {
  if (!items?.length) return null;
  return (
    <ul className="bullets">
      {items.map((b, i) => (
        <li key={i}><span className="tick"><Check width={14} height={14} /></span>{b}</li>
      ))}
    </ul>
  );
}

export function Story({ sections }) {
  if (!sections?.length) return null;
  return (
    <section className="story">
      {sections.map((s, i) => (
        <div key={i} className={"story-row" + (i % 2 ? " flip" : "") + (s.image ? "" : " no-img")}>
          {s.image && <img src={s.image} alt={s.title || ""} loading="lazy" />}
          <div>
            {s.title && <h2>{s.title}</h2>}
            {s.text && <p>{s.text}</p>}
          </div>
        </div>
      ))}
    </section>
  );
}

export function Features({ items }) {
  if (!items?.length) return null;
  return (
    <section className="feat-grid">
      {items.map((f, i) => (
        <div key={i} className="feat">
          <span className="tick lg"><Check width={20} height={20} /></span>
          {f.title && <h3>{f.title}</h3>}
          {f.text && <p>{f.text}</p>}
        </div>
      ))}
    </section>
  );
}

export function Specs({ items }) {
  if (!items?.length) return null;
  return (
    <section className="block">
      <h2>Характеристики</h2>
      <table className="spec-table">
        <tbody>
          {items.map((s, i) => (
            <tr key={i}><th>{s.k}</th><td>{s.v}</td></tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export function Faq({ items }) {
  if (!items?.length) return null;
  return (
    <section className="block">
      <h2>Често задавани въпроси</h2>
      <div className="faq">
        {items.map((f, i) => (
          <details key={i}>
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

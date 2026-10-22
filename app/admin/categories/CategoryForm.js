"use client";
import { useRef } from "react";
import { useFormState } from "react-dom";
import { createCategory } from "../actions";

export default function CategoryForm() {
  const [state, action] = useFormState(createCategory, null);
  const ref = useRef(null);
  return (
    <form ref={ref} action={async (fd) => { await action(fd); ref.current?.reset(); }} className="form-card" style={{ maxWidth: 520 }}>
      <label htmlFor="cname">Име на новата категория</label>
      <input id="cname" name="name" placeholder="напр. Дом" required maxLength={60} />
      <label htmlFor="cimg">Снимка за плочката (по избор, до 4 MB)</label>
      <input id="cimg" name="image" type="file" accept="image/*" />
      {state?.error && <p className="err">{state.error}</p>}
      {state?.ok && <p className="ok">{state.ok}</p>}
      <div style={{ marginTop: 14 }}><button className="btn primary">Създай категория</button></div>
    </form>
  );
}

"use client";
import { useFormState } from "react-dom";
import { login } from "../actions";

export default function LoginPage() {
  const [state, action] = useFormState(login, null);
  return (
    <div className="form-card" style={{ margin: "40px auto" }}>
      <h1 style={{ marginTop: 16 }}>Админ вход</h1>
      <form action={action}>
        <label htmlFor="password">Парола</label>
        <input id="password" name="password" type="password" autoFocus required />
        {state?.error && <p className="err">{state.error}</p>}
        <div style={{ marginTop: 16 }}><button className="btn">Вход</button></div>
      </form>
    </div>
  );
}

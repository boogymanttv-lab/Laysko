"use client";
import { deleteSubscriber } from "../actions";

export default function DeleteButton({ id, email }) {
  return (
    <form action={deleteSubscriber} onSubmit={(e) => { if (!confirm(`Да премахна ${email}? Кодът му също ще бъде изтрит.`)) e.preventDefault(); }}>
      <input type="hidden" name="id" value={id} />
      <button className="btn ghost sm" style={{ color: "#b3261e", width: "auto" }}>Премахни</button>
    </form>
  );
}

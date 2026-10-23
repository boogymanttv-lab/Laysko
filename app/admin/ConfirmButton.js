"use client";

// Бутон с потвърждение. action = server action, fields = скрити полета
export default function ConfirmButton({ action, fields = {}, label, message, danger = true, className = "btn ghost sm" }) {
  return (
    <form action={action} onSubmit={(e) => { if (!confirm(message)) e.preventDefault(); }} style={{ display: "inline-block" }}>
      {Object.entries(fields).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      <button className={className} style={{ width: "auto", ...(danger ? { color: "#b3261e" } : {}) }}>{label}</button>
    </form>
  );
}

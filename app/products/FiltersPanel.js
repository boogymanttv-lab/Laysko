"use client";
import { useState } from "react";

// Търсенето/филтрите са скрити зад бутон; отворени са само ако вече има приложен филтър
export default function FiltersPanel({ open: initial, children }) {
  const [open, setOpen] = useState(initial);
  return (
    <div className="fpanel">
      <button type="button" className="btn ghost fbtn" aria-expanded={open} onClick={() => setOpen(!open)}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
        Търсене и филтри {open ? "▴" : "▾"}
      </button>
      {open && children}
    </div>
  );
}

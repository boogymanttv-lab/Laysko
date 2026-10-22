export function eur(cents) {
  return new Intl.NumberFormat("bg-BG", { style: "currency", currency: "EUR" }).format(
    (cents || 0) / 100
  );
}

const MAP = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ж: "zh", з: "z", и: "i", й: "y",
  к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u",
  ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sht", ъ: "a", ь: "y", ю: "yu", я: "ya",
};

export function slugify(text) {
  const s = (text || "")
    .toLowerCase()
    .split("")
    .map((c) => MAP[c] ?? c)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return s || "produkt-" + Math.random().toString(36).slice(2, 8);
}

export function toCents(value) {
  const n = parseFloat(String(value ?? "").replace(",", "."));
  return Number.isFinite(n) ? Math.round(n * 100) : null;
}

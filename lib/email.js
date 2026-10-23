// Изпращане на имейл през Resend (без допълнителен пакет). Ако няма ключ – просто не праща.
export async function sendEmail({ to, subject, html }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, reason: "no_key" };
  const from = process.env.RESEND_FROM || "Laysko <onboarding@resend.dev>";
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], subject, html }),
    });
    if (!res.ok) { console.error("Resend:", res.status, await res.text()); return { ok: false, reason: "api" }; }
    return { ok: true };
  } catch (e) { console.error(e); return { ok: false, reason: "net" }; }
}

export function codeEmail({ code, percent, site }) {
  const base = (process.env.SITE_URL || "").replace(/\/$/, "");
  return `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#fff8f3;padding:28px;border-radius:16px;color:#3d2c3a">
  <h2 style="margin:0 0 8px">Добре дошъл в ${site}! 🐾</h2>
  <p>Благодарим ти, че се абонира. Ето личния ти код за <b>${percent}% отстъпка</b> от първата поръчка:</p>
  <p style="font-size:26px;letter-spacing:2px;font-weight:bold;background:#fdeaee;color:#c04a68;padding:14px;text-align:center;border-radius:12px">${code}</p>
  <p style="font-size:14px">Кодът е еднократен. Въведи го в кошницата, в полето „Имаш код?“.</p>
  ${base ? `<p><a href="${base}/products" style="color:#c04a68">Към магазина →</a></p>` : ""}
  </div>`;
}

const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const eurS = (c) => new Intl.NumberFormat("bg-BG", { style: "currency", currency: "EUR" }).format((c || 0) / 100);
const siteUrl = () => (process.env.SITE_URL || "").replace(/\/$/, "");
const wrap = (inner, foot = "") => `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#fff8f3;padding:28px;border-radius:16px;color:#3d2c3a">${inner}${foot ? `<p style="font-size:12px;color:#8a7a86;margin-top:24px">${foot}</p>` : ""}</div>`;

// Пращане до много получатели (Resend batch, до 100 на заявка). messages: [{to, subject, html}]
export async function sendBatch(messages) {
  const key = process.env.RESEND_API_KEY;
  if (!key || !messages.length) return { sent: 0 };
  const from = process.env.RESEND_FROM || "Laysko <onboarding@resend.dev>";
  let sent = 0;
  for (let i = 0; i < messages.length; i += 100) {
    const chunk = messages.slice(i, i + 100).map((m) => ({ from, to: [m.to], subject: m.subject, html: m.html }));
    try {
      const res = await fetch("https://api.resend.com/emails/batch", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify(chunk),
      });
      if (res.ok) sent += chunk.length; else console.error("Resend batch:", res.status, await res.text());
    } catch (e) { console.error(e); }
  }
  return { sent };
}

export function orderEmail({ items, total, name, address, site }) {
  const rows = items.map((i) => `<tr><td style="padding:6px 0">${esc(i.title)} × ${i.quantity}</td><td style="padding:6px 0;text-align:right">${i.unit_cents != null ? eurS(i.unit_cents * i.quantity) : ""}</td></tr>`).join("");
  const a = address || {};
  const addr = [a.line1, a.line2, [a.postal_code, a.city].filter(Boolean).join(" "), a.country].filter(Boolean).map(esc).join(", ");
  return wrap(`<h2 style="margin:0 0 8px">Благодарим за поръчката! 🐾</h2>
  <p>${name ? `Здравей, ${esc(name)}! ` : ""}Получихме плащането ти. Ето обобщение:</p>
  <table style="width:100%;border-collapse:collapse;font-size:15px">${rows}<tr><td style="padding-top:10px;border-top:1px solid #e8d8dc"><b>Общо</b></td><td style="padding-top:10px;border-top:1px solid #e8d8dc;text-align:right"><b>${eurS(total)}</b></td></tr></table>
  ${addr ? `<p style="font-size:14px"><b>Адрес за доставка:</b><br>${addr}</p>` : ""}
  <p style="font-size:14px">Очаквай пратката до 1–3 работни дни. Когато я изпратим, ще получиш номер за проследяване.</p>`,
  `${esc(site)} · Ако имаш въпроси, просто отговори на този имейл.`);
}

export function productEmail({ product, unsubUrl, site }) {
  const base = siteUrl();
  const link = `${base}/product/${product.slug}`;
  const img = product.images?.find((u) => /^https:\/\//.test(u));
  return wrap(`${img ? `<img src="${esc(img)}" alt="" style="width:100%;border-radius:12px;margin-bottom:14px">` : ""}
  <p style="margin:0;color:#c04a68;font-weight:bold;font-size:13px;letter-spacing:1px">НОВО В ${esc(site).toUpperCase()}</p>
  <h2 style="margin:4px 0 6px">${esc(product.title)}</h2>
  <p style="font-size:20px;margin:0 0 16px"><b>${eurS(product.price_cents)}</b></p>
  <a href="${link}" style="display:inline-block;background:#c04a68;color:#fff;text-decoration:none;padding:12px 24px;border-radius:999px;font-weight:bold">Виж продукта</a>`,
  `Получаваш този имейл, защото се абонира в ${esc(site)}. <a href="${unsubUrl}" style="color:#8a7a86">Отпиши се</a>`);
}

export const unsubLink = (id) => `${siteUrl()}/unsubscribe?t=${id}`;

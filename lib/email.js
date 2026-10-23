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

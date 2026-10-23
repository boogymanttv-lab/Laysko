import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { getHome } from "@/lib/settings";
import { sendEmail, codeEmail, emailLogo } from "@/lib/email";

const RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const SITE = process.env.NEXT_PUBLIC_SITE_NAME || "Laysko";

function makeCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (const b of crypto.randomBytes(6)) s += chars[b % chars.length];
  return "LAYSKO-" + s;
}

export async function POST(req) {
  try {
    const { email, consent } = await req.json();
    const mail = String(email || "").trim().toLowerCase().slice(0, 200);
    if (!RE.test(mail)) return NextResponse.json({ error: "Моля, въведи валиден имейл." }, { status: 400 });
    if (!consent) return NextResponse.json({ error: "Моля, потвърди съгласието си." }, { status: 400 });

    const home = await getHome();
    if (home.popup.enabled !== "1") return NextResponse.json({ error: "Абонирането е спряно." }, { status: 400 });
    const percent = Math.max(1, Math.min(50, parseInt(home.popup.percent, 10) || 10));

    const client = db();
    const logo = await emailLogo();
    const { data: ex } = await client.from("subscribers").select("code, percent, used_at, unsubscribed_at").eq("email", mail).maybeSingle();
    if (ex) {
      if (ex.unsubscribed_at) await client.from("subscribers").update({ unsubscribed_at: null }).eq("email", mail);
      // Не показваме чужд код на екрана – само го пращаме на имейла (ако не е използван)
      if (!ex.used_at) await sendEmail({ to: mail, subject: `Твоят код за ${ex.percent}% отстъпка`, html: codeEmail({ code: ex.code, percent: ex.percent, site: SITE, logo }) });
      return NextResponse.json({ existing: true, used: !!ex.used_at });
    }

    let code = makeCode(), error;
    for (let i = 0; i < 3; i++) {
      ({ error } = await client.from("subscribers").insert({ email: mail, code, percent }));
      if (!error) break;
      if (/subscribers_email/.test(error.message || "") || error.code === "23505" && /email/.test(error.message || "")) {
        return NextResponse.json({ existing: true });
      }
      code = makeCode();
    }
    if (error) {
      console.error(error);
      return NextResponse.json({ error: /subscribers/.test(error.message) ? "Липсва таблицата subscribers. Изпълни supabase/migration-subscribers.sql." : "Нещо се обърка. Опитай пак." }, { status: 500 });
    }
    const sent = await sendEmail({ to: mail, subject: `Твоят код за ${percent}% отстъпка`, html: codeEmail({ code, percent, site: SITE, logo }) });
    return NextResponse.json({ code, percent, emailed: sent.ok });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Нещо се обърка. Опитай пак." }, { status: 500 });
  }
}

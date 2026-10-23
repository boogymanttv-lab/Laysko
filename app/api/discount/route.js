import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req) {
  try {
    const { code } = await req.json();
    const c = String(code || "").trim().toUpperCase().slice(0, 40);
    if (!c) return NextResponse.json({ error: "Въведи код." }, { status: 400 });
    const { data } = await db().from("subscribers").select("percent, used_at").eq("code", c).maybeSingle();
    if (!data) return NextResponse.json({ error: "Невалиден код." }, { status: 404 });
    if (data.used_at) return NextResponse.json({ error: "Този код вече е използван." }, { status: 410 });
    return NextResponse.json({ code: c, percent: data.percent });
  } catch {
    return NextResponse.json({ error: "Грешка. Опитай пак." }, { status: 500 });
  }
}

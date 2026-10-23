import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  requireAdmin();
  const { data } = await db().from("subscribers").select("*").order("created_at", { ascending: false });
  const rows = [["email", "code", "percent", "created_at", "used_at"],
    ...(data || []).map((s) => [s.email, s.code, s.percent, s.created_at, s.used_at || ""])];
  const csv = "﻿" + rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
  return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="subscribers.csv"' } });
}

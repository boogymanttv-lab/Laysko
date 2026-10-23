import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import AdminNav from "../AdminNav";
import DeleteButton from "./DeleteButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Абонати" };

export default async function Subscribers() {
  requireAdmin();
  const { data, error } = await db().from("subscribers").select("*").order("created_at", { ascending: false });
  const list = data || [];
  const used = list.filter((s) => s.used_at).length;
  return (
    <>
      <AdminNav />
      <h1 style={{ fontSize: 24 }}>Абонати</h1>
      {error && <p className="err">Липсва таблицата subscribers. Изпълни supabase/migration-subscribers.sql в Supabase.</p>}
      <p className="muted">Общо {list.length} · използвали кода: {used} · <a href="/admin/subscribers/export" style={{ color: "var(--accent)" }}>Изтегли CSV</a></p>
      {!list.length && !error && <p className="muted">Още няма абонати.</p>}
      <div style={{ overflowX: "auto" }}>
        <table className="spec-table" style={{ width: "100%" }}>
          <thead><tr><th>Имейл</th><th>Код</th><th>%</th><th>Дата</th><th>Използван</th><th></th></tr></thead>
          <tbody>
            {list.map((s) => (
              <tr key={s.id}>
                <td>{s.email}</td><td>{s.code}</td><td>{s.percent}</td>
                <td>{new Date(s.created_at).toLocaleDateString("bg-BG")}</td>
                <td>{s.used_at ? new Date(s.used_at).toLocaleDateString("bg-BG") : "—"}</td>
                <td><DeleteButton id={s.id} email={s.email} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

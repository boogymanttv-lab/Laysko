import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Отписване", robots: { index: false } };

export default async function Unsub({ searchParams }) {
  const t = String(searchParams?.t || "");
  let ok = false;
  if (/^[0-9a-f-]{36}$/i.test(t)) {
    const { data } = await db().from("subscribers").update({ unsubscribed_at: new Date().toISOString() }).eq("id", t).select("id");
    ok = !!data?.length;
  }
  return (
    <div className="container page-narrow" style={{ textAlign: "center", padding: "60px 0" }}>
      <h1>{ok ? "Отписа се успешно" : "Невалиден линк"}</h1>
      <p className="lead">{ok ? "Няма повече да получаваш имейли с новини от нас." : "Линкът за отписване не е валиден."}</p>
    </div>
  );
}

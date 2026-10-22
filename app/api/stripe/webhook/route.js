import Stripe from "stripe";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers.get("stripe-signature");
  const body = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const s = event.data.object;
    if (s.payment_status === "paid") {
      const ship = s.shipping_details || s.collected_information?.shipping_details || null;

      // Продукти от метаданните (нов формат) или стария формат с един продукт
      let wanted = [];
      try { wanted = JSON.parse(s.metadata?.items || "[]"); } catch {}
      if (!wanted.length && s.metadata?.product_id) {
        wanted = [{ id: s.metadata.product_id, q: parseInt(s.metadata.quantity || "1", 10) }];
      }

      const { data: prods } = await db()
        .from("products")
        .select("id, title, price_cents")
        .in("id", wanted.map((w) => w.id));
      const byId = Object.fromEntries((prods || []).map((p) => [p.id, p]));

      // Реалните единични цени от Stripe (същия ред като line_items)
      let lines = [];
      try { lines = (await stripe.checkout.sessions.listLineItems(s.id, { limit: 20 })).data; } catch {}

      const items = wanted.map((w, idx) => ({
        product_id: w.id,
        title: byId[w.id]?.title || lines[idx]?.description || "Продукт",
        quantity: w.q,
        unit_cents: lines[idx]?.price?.unit_amount ?? byId[w.id]?.price_cents ?? null,
      }));

      const { error } = await db().from("orders").upsert(
        {
          stripe_session_id: s.id,
          product_id: items[0]?.product_id || null,
          product_title: items.map((i) => `${i.title} × ${i.quantity}`).join(", ") || "Поръчка",
          quantity: items.reduce((n, i) => n + i.quantity, 0) || 1,
          items,
          amount_cents: s.amount_total,
          status: "paid",
          customer_name: ship?.name || s.customer_details?.name || null,
          customer_email: s.customer_details?.email || null,
          customer_phone: s.customer_details?.phone || null,
          shipping_address: ship?.address || s.customer_details?.address || null,
        },
        { onConflict: "stripe_session_id", ignoreDuplicates: true }
      );
      if (error) {
        console.error(error);
        return NextResponse.json({ error: "db" }, { status: 500 });
      }
    }
  }
  return NextResponse.json({ received: true });
}

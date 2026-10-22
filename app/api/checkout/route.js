import Stripe from "stripe";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const clamp = (v) => Math.max(1, Math.min(10, parseInt(v, 10) || 1));

export async function POST(req) {
  try {
    const body = await req.json();

    // Поддържа и стария формат { slug, quantity }
    const raw = Array.isArray(body.items) ? body.items : [{ slug: body.slug, quantity: body.quantity }];
    const wanted = new Map();
    for (const i of raw.slice(0, 8)) {
      if (!i?.slug) continue;
      wanted.set(String(i.slug), clamp((wanted.get(String(i.slug)) || 0) + clamp(i.quantity)));
    }
    if (!wanted.size) return NextResponse.json({ error: "Кошницата е празна" }, { status: 400 });

    const { data: products } = await db()
      .from("products")
      .select("id, slug, title, price_cents, images, active")
      .in("slug", [...wanted.keys()]);
    const active = (products || []).filter((p) => p.active);
    if (active.length !== wanted.size) {
      return NextResponse.json(
        { error: "Някой от продуктите вече не е наличен. Обнови кошницата." },
        { status: 409 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const site = process.env.SITE_URL || new URL(req.url).origin;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: active.map((p) => {
        const image = p.images?.find((u) => u.startsWith("https://"));
        return {
          quantity: wanted.get(p.slug),
          price_data: {
            currency: "eur",
            unit_amount: p.price_cents,
            product_data: { name: p.title, ...(image ? { images: [image] } : {}) },
          },
        };
      }),
      shipping_address_collection: {
        allowed_countries: ["BG", "RO", "GR", "DE", "FR", "IT", "ES", "AT", "NL", "BE", "PL", "CZ", "HR", "GB"],
      },
      phone_number_collection: { enabled: true },
      metadata: { items: JSON.stringify(active.map((p) => ({ id: p.id, q: wanted.get(p.slug) }))) },
      success_url: `${site}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${site}/cart`,
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Неуспешно стартиране на плащането" }, { status: 500 });
  }
}

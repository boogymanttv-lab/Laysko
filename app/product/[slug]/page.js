import Link from "next/link";
import { notFound } from "next/navigation";
import { db, PUBLIC_COLS } from "@/lib/db";
import Gallery from "./Gallery";
import BuyBox from "./BuyBox";
import ClosingCta from "./ClosingCta";
import { Bullets, Story, Features, Specs, Faq } from "./ContentBlocks";
import ProductCard from "../../ProductCard";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { data: p } = await db().from("products").select("title, description").eq("slug", params.slug).eq("active", true).maybeSingle();
  return p ? { title: p.title, description: p.description?.slice(0, 160) } : {};
}

async function loadProduct(slug) {
  // Първо с дългото съдържание; ако колоната още не е създадена, продължава без него
  let res = await db().from("products").select(PUBLIC_COLS + ", content").eq("slug", slug).eq("active", true).maybeSingle();
  if (res.error) {
    res = await db().from("products").select(PUBLIC_COLS).eq("slug", slug).eq("active", true).maybeSingle();
  }
  return res.data;
}

export default async function ProductPage({ params }) {
  const p = await loadProduct(params.slug);
  if (!p) notFound();
  const c = p.content || {};

  // Препоръчани: първо от същата категория, после останалите (най-новите)
  const { data: others } = await db()
    .from("products")
    .select(PUBLIC_COLS)
    .eq("active", true)
    .neq("id", p.id)
    .order("created_at", { ascending: false });
  const same = p.category ? (others || []).filter((o) => o.category === p.category) : [];
  const rest = (others || []).filter((o) => !same.includes(o));
  const related = [...same, ...rest].slice(0, 4);

  const cta = {
    slug: p.slug, title: p.title, image: p.images?.[0] || "",
    priceCents: p.price_cents, compareAtCents: p.compare_at_cents,
  };

  return (
    <div className="container">
      <div className="crumbs">
        <Link href="/">Начало</Link> / <Link href="/products">Продукти</Link> / {p.title}
      </div>
      <div className="product">
        <Gallery images={p.images || []} alt={p.title} />
        <div className="buy">
          <span className="pill">✦ Налично</span>
          <h1>{p.title}</h1>
          <Bullets items={c.bullets} />
          <BuyBox
            slug={p.slug}
            title={p.title}
            image={p.images?.[0] || ""}
            priceCents={p.price_cents}
            compareAtCents={p.compare_at_cents}
          />
          {p.description && (
            <>
              <h3>Описание</h3>
              <p className="desc">{p.description}</p>
            </>
          )}
        </div>
      </div>

      <Story sections={c.sections} />
      <Features items={c.features} />
      <Specs items={c.specs} />
      <ClosingCta {...cta} />
      <Faq items={c.faq} />

      {related.length > 0 && (
        <section className="reco">
          <h2>{same.length ? "Подобни продукти" : "Може да ти хареса"}</h2>
          <div className="grid shop-grid">
            {related.map((r) => <ProductCard key={r.id} p={r} />)}
          </div>
        </section>
      )}
    </div>
  );
}

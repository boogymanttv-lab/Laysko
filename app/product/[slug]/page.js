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
  const { data: p } = await db().from("products").select("title, description, images, slug").eq("slug", params.slug).eq("active", true).maybeSingle();
  if (!p) return {};
  const desc = (p.description || "").replace(/\s+/g, " ").trim().slice(0, 200) || undefined;
  const img = p.images?.[0];
  return {
    title: p.title,
    description: desc,
    alternates: { canonical: `/product/${p.slug}` },
    openGraph: {
      type: "website",
      title: p.title,
      description: desc,
      url: `/product/${p.slug}`,
      ...(img ? { images: [{ url: img, alt: p.title }] } : {}),
    },
    twitter: { card: img ? "summary_large_image" : "summary", title: p.title, description: desc, ...(img ? { images: [img] } : {}) },
  };
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

  const base = (process.env.SITE_URL || "https://www.laysko.com").replace(/\/$/, "");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.title,
    description: (p.description || "").replace(/\s+/g, " ").trim().slice(0, 500) || undefined,
    image: (p.images || []).slice(0, 5),
    url: `${base}/product/${p.slug}`,
    ...(p.category ? { category: p.category } : {}),
    offers: {
      "@type": "Offer",
      url: `${base}/product/${p.slug}`,
      priceCurrency: "EUR",
      price: (p.price_cents / 100).toFixed(2),
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  return (
    <div className="container">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
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

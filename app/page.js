import Link from "next/link";
import { db, PUBLIC_COLS } from "@/lib/db";
import { getHome, getSettings } from "@/lib/settings";
import { Shield, Truck, Undo, Chat, Arrow, Check, Bag, Card } from "./Icons";
import { getCategories } from "@/lib/categories";
import ProductCard from "./ProductCard";
import { eur } from "@/lib/format";
import ProductTabs from "./ProductTabs";
import VideoBlock from "./VideoBlock";

export const dynamic = "force-dynamic";

async function bestSellerIds() {
  try {
    const { data } = await db().from("orders").select("items").limit(500);
    const n = {};
    for (const o of data || []) for (const it of o.items || []) if (it.product_id) n[it.product_id] = (n[it.product_id] || 0) + (it.quantity || 1);
    return Object.entries(n).sort((a, b) => b[1] - a[1]).map(([id]) => id);
  } catch { return []; }
}

export default async function Home() {
  const { data: products } = await db()
    .from("products").select(PUBLIC_COLS).eq("active", true).order("created_at", { ascending: false });
  const list = products || [];
  const h = await getHome();
  const heroProd = list.find((x) => x.id === h.hero.product);
  const heroImg = heroProd?.images?.[0] || h.images.hero || list[0]?.images?.[0];
  const storyImg = h.images.story || list[1]?.images?.[0] || heroImg;

  const cats = (await getCategories()).map((c) => ({ name: c.name, img: c.image }));

  const ids = await bestSellerIds();
  const best = ids.map((id) => list.find((p) => p.id === id)).filter(Boolean).slice(0, 4);
  const fresh = list.slice(0, 8);

  const promoList = h.promo.category ? list.filter((p) => p.category === h.promo.category).slice(0, 5) : [];
  const promoImg = h.images.promo || promoList[0]?.images?.[0];
  const icons = [Truck, Undo, Shield, Chat];

  return (
    <>
      <section className="fhero">
        <div className="container">
          <div className="fhero-text">
            {h.hero.eyebrow && <span className="eyebrow">{h.hero.eyebrow}</span>}
            <h1>{h.hero.title}</h1>
            <p>{h.hero.sub}</p>
            <div className="cta">
              {h.hero.btn1 && <Link href="/products" className="btn lg">{h.hero.btn1}</Link>}
              {h.hero.btn2 && cats.length > 0 && <Link href="#categories" className="btn ghost lg">{h.hero.btn2}</Link>}
            </div>
          </div>
          <div className="fhero-img">
            {heroProd ? (
              <Link href={`/product/${heroProd.slug}`} aria-label={heroProd.title}>
                {heroImg ? <img src={heroImg} alt={heroProd.title} /> : <div className="ph" />}
              </Link>
            ) : (heroImg ? <img src={heroImg} alt="" /> : <div className="ph" />)}
            {heroProd ? (
              <Link href={`/product/${heroProd.slug}`} className="fl fl1 fl-prod">
                <span>{heroProd.title}</span><b>{eur(heroProd.price_cents)}</b>
              </Link>
            ) : (
              <div className="fl fl1"><Truck width={18} height={18} /> Безплатна доставка над 100 €</div>
            )}
            <div className="fl fl2"><Shield width={18} height={18} /> Сигурно плащане</div>
          </div>
        </div>
      </section>

      <section className="badges">
        <div className="container">
          {h.badges.map((b, i) => { const I = icons[i]; return (
            <div className="t" key={i}><div className="ic"><I /></div><div><b>{b.t}</b><span>{b.s}</span></div></div>
          ); })}
        </div>
      </section>

      {cats.length > 0 && (
        <section className="section" id="categories">
          <div className="container">
            <h2 className="sec-title">{h.catsTitle}</h2>
            <div className="cat-tiles">
              {cats.map((c) => (
                <Link key={c.name} href={`/products?category=${encodeURIComponent(c.name)}`} className="cat-tile">
                  <div className="cat-img">{c.img ? <img src={c.img} alt="" /> : <div className="ph" />}</div>
                  <span>{c.name}</span>
                </Link>
              ))}
            </div>
            <div className="center"><Link href="/products" className="link-arrow">Вижте всички категории <Arrow /></Link></div>
          </div>
        </section>
      )}

      {promoList.length > 0 && (
        <section className="section soft">
          <div className="container promo">
            <div className="promo-img">{promoImg ? <img src={promoImg} alt="" /> : <div className="ph" />}</div>
            <div>
              {h.promo.eyebrow && <span className="eyebrow">{h.promo.eyebrow}</span>}
              <h2 className="sec-title left">{h.promo.title}</h2>
              <Link href={`/products?category=${encodeURIComponent(h.promo.category)}`} className="btn">{h.promo.btn}</Link>
              <div className="promo-list">
                {promoList.map((p) => (
                  <Link key={p.id} href={`/product/${p.slug}`} className="mini">
                    {p.images?.[0] ? <img src={p.images[0]} alt="" /> : <div className="ph" />}
                    <span>{p.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="section" id="products">
        <div className="container">
          {list.length ? <ProductTabs title={h.tabsTitle} best={best} fresh={fresh.length ? fresh : list} />
            : <p className="center" style={{ color: "var(--muted)" }}>Скоро добавяме продукти.</p>}
        </div>
      </section>




      <VideoBlock title={h.videosTitle} videos={h.videos} />



      <section className="section">
        <div className="container brand-story">
          <div className="bs-img">{storyImg ? <img src={storyImg} alt="" /> : <div className="ph" />}</div>
          <div>
            {h.story.eyebrow && <span className="eyebrow">{h.story.eyebrow}</span>}
            <h2 className="sec-title left">{h.story.title}</h2>
            <p>{h.story.text}</p>
            {h.story.btn && <Link href="/contact" className="btn">{h.story.btn}</Link>}
          </div>
        </div>
      </section>
    </>
  );
}

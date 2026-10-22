import Link from "next/link";
import { db, PUBLIC_COLS } from "@/lib/db";
import { getHome, getSettings } from "@/lib/settings";
import { Shield, Truck, Undo, Chat, Arrow, Check, Bag } from "./Icons";
import { getCategories } from "@/lib/categories";
import ProductCard from "./ProductCard";
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
  const heroImg = h.images.hero || list[0]?.images?.[0];
  const storyImg = h.images.story || list[1]?.images?.[0] || heroImg;

  const cats = (await getCategories()).map((c) => ({ name: c.name, img: c.image }));

  const ids = await bestSellerIds();
  const best = ids.map((id) => list.find((p) => p.id === id)).filter(Boolean).slice(0, 4);
  const fresh = list.slice(0, 4);

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
            {heroImg ? <img src={heroImg} alt="" /> : <div className="ph" />}
            <div className="fl fl1"><Truck width={18} height={18} /> Безплатна доставка над 100 €</div>
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


      <section className="section soft" id="how">
        <div className="container">
          <span className="eyebrow center-eyebrow">Лесно е</span>
          <h2 className="sec-title">Как работи поръчката</h2>
          <div className="steps3">
            <div className="st"><div className="n">1</div><h3>Избираш продукт</h3><p>Разгледай снимките и описанието, избери количество и го добави в кошницата.</p></div>
            <div className="st"><div className="n">2</div><h3>Плащаш сигурно</h3><p>Въвеждаш адрес и плащаш с карта. Не се иска регистрация.</p></div>
            <div className="st"><div className="n">3</div><h3>Получаваш пратката</h3><p>Изпращаме до адреса ти и ти даваме номер за проследяване.</p></div>
          </div>
        </div>
      </section>

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

      <VideoBlock title={h.videosTitle} videos={h.videos} />


      <section className="section">
        <div className="container faq-wrap">
          <h2 className="sec-title">Често задавани въпроси</h2>
          <div className="faq">
            <details><summary>Колко време отнема доставката?</summary><p>Обикновено 7–21 работни дни до адреса ти. След изпращане получаваш номер за проследяване.</p></details>
            <details><summary>Кога доставката е безплатна?</summary><p>За поръчки над 100 € доставката е безплатна.</p></details>
            <details><summary>Как мога да платя?</summary><p>С банкова карта (Visa, Mastercard) през Stripe. Данните на картата не минават през нашия сайт.</p></details>
            <details><summary>Мога ли да върна продукт?</summary><p>Да, в рамките на 14 дни от получаването, без да посочваш причина. Пиши ни през страницата за контакти.</p></details>
            <details><summary>Трябва ли ми регистрация?</summary><p>Не. Поръчваш като гост – само адрес за доставка и имейл.</p></details>
          </div>
        </div>
      </section>

      {list.length > 4 && (
        <section className="section">
          <div className="container">
            <h2 className="sec-title">Нови продукти</h2>
            <div className="grid shop-grid">{list.slice(0, 4).map((p) => <ProductCard key={p.id} p={p} />)}</div>
          </div>
        </section>
      )}

      <section className="section soft">
        <div className="container">
          <h2 className="sec-title">{h.delivery.title}</h2>
          <div className="info3">
            <div><h3>Доставка</h3><p>{h.delivery.ship}</p></div>
            <div><h3>Плащане</h3><p>{h.delivery.pay}</p><p className="paybadges"><b>VISA</b><b>Mastercard</b></p></div>
            <div><h3>Връщане и поддръжка</h3><p>{h.delivery.ret}</p><Link href="/contact" className="link-arrow">Свържи се с нас <Arrow /></Link></div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cta-band2">
            <div><h2>Готов ли си да поръчаш?</h2><p>Разгледай продуктите и поръчай за минута – без регистрация.</p></div>
            <Link href="/products" className="btn lg"><Bag width={20} height={20} /> Към магазина</Link>
          </div>
        </div>
      </section>
    </>
  );
}

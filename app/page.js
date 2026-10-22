import Link from "next/link";
import { db, PUBLIC_COLS } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { Shield, Truck, Pin, Chat, Arrow } from "./Icons";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { data: products } = await db()
    .from("products")
    .select(PUBLIC_COLS)
    .eq("active", true)
    .order("created_at", { ascending: true });

  const list = products || [];
  const s = await getSettings();
  const img1 = s.hero_1 || list[0]?.images?.[0];
  const img2 = s.hero_2 || list[1]?.images?.[0] || img1;

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="container">
          <div>
            <span className="pill">✦ Нова селекция</span>
            <h1>Продукти, които <span className="grad">ще обикнеш</span></h1>
            <p className="sub">
              Внимателно подбрани артикули с отлично качество. Поръчваш за минута, плащаш сигурно, а ние
              изпращаме директно до вратата ти.
            </p>
            <div className="cta">
              <Link href="/products" className="btn primary lg">Разгледай продуктите <Arrow /></Link>
              <Link href="/#how" className="btn ghost lg">Как работи</Link>
            </div>
            <div className="stats">
              <div><b>100%</b><span>Сигурно плащане</span></div>
              <div><b>7–21</b><span>Дни доставка</span></div>
              <div><b>24/7</b><span>Онлайн поръчка</span></div>
            </div>
          </div>
          <div className="collage">
            <div className="c c1">{img1 ? <img src={img1} alt="" /> : null}</div>
            <div className="c c2">{img2 ? <img src={img2} alt="" /> : null}</div>
            <div className="float f1"><span className="dot" /> Налично в момента</div>
            <div className="float f2">🔒 Плащане със Stripe</div>
          </div>
        </div>
      </section>

      {/* ПРЕДИМСТВА */}
      <section className="trust">
        <div className="container">
          <div className="t"><div className="ic"><Shield /></div><div><b>Сигурно плащане</b><span>Криптирано през Stripe</span></div></div>
          <div className="t"><div className="ic"><Truck /></div><div><b>Доставка до врата</b><span>Директно на твоя адрес</span></div></div>
          <div className="t"><div className="ic"><Pin /></div><div><b>Проследяване</b><span>Номер за следене на пратката</span></div></div>
          <div className="t"><div className="ic"><Chat /></div><div><b>Поддръжка</b><span>Отговаряме на имейл</span></div></div>
        </div>
      </section>

      {/* КАК РАБОТИ */}
      <section className="section soft" id="how">
        <div className="container">
          <div className="eyebrow">Лесно е</div>
          <h2>Как работи поръчката</h2>
          <p className="lead">Три стъпки от избора до вратата ти.</p>
          <div className="steps">
            <div className="step"><div className="n">1</div><h3>Избираш продукт</h3><p>Разгледай снимките и описанието, избери количество.</p></div>
            <div className="step"><div className="n">2</div><h3>Плащаш сигурно</h3><p>Въвеждаш адрес и плащаш с карта през Stripe.</p></div>
            <div className="step"><div className="n">3</div><h3>Получаваш пратката</h3><p>Изпращаме до адреса ти и ти даваме номер за проследяване.</p></div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container">
          <div className="cta-band">
            <h2>Готов ли си да поръчаш?</h2>
            <p>Разгледай продуктите и поръчай само за минута.</p>
            <Link href="/products" className="btn lg">Към продуктите <Arrow /></Link>
          </div>
        </div>
      </section>
    </>
  );
}

import "./globals.css";
import Link from "next/link";
import CartProvider from "./CartProvider";
import CartButton from "./CartButton";
import { getCategories } from "@/lib/categories";
import { Search } from "./Icons";
import { getHome } from "@/lib/settings";
import Brand from "./Brand";
import MobileNav from "./MobileNav";
import CookieBar from "./CookieBar";

const SITE = process.env.NEXT_PUBLIC_SITE_NAME || "Laysko";
export const dynamic = "force-dynamic";

export const metadata = {
  title: { default: SITE, template: `%s · ${SITE}` },
  description: "Внимателно подбрани продукти със сигурно плащане и доставка до адреса ти.",
};

export default async function RootLayout({ children }) {
  const cats = (await getCategories()).map((c) => c.name);
  const home = await getHome();
  const EMAIL = home.footer.email || process.env.NEXT_PUBLIC_CONTACT_EMAIL || "";
  const msgs = home.marquee.split("\n").map((x) => x.trim()).filter(Boolean);
  const strip = msgs.length ? Array.from({ length: Math.max(2, Math.ceil(12 / msgs.length)) }).flatMap(() => msgs) : [];
  return (
    <html lang="bg">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap&subset=cyrillic" rel="stylesheet" />
      </head>
      <body>
        <CartProvider>
        {strip.length > 0 && (
          <div className="topbar"><div className="marquee">{[...strip, ...strip].map((m, i) => <span key={i}>{m}</span>)}</div></div>
        )}
        <header className="site-header">
          <div className="container row">
            <Brand logo={home.images.logo} name={SITE} />
            <nav className="main-nav">
              <Link href="/">Начало</Link>
              <Link href="/products">Магазин</Link>
              {cats.length > 0 && (
                <div className="dd">
                  <Link href="/products">Категории ▾</Link>
                  <div className="dd-menu">
                    {cats.map((c) => <Link key={c} href={`/products?category=${encodeURIComponent(c)}`}>{c}</Link>)}
                  </div>
                </div>
              )}
              <Link href="/contact">Контакти</Link>
            </nav>
            <div className="tools">
              <form action="/products" className="search">
                <input name="q" placeholder="Търси продукт…" aria-label="Търсене" />
                <button aria-label="Търси"><Search width={18} height={18} /></button>
              </form>
              <CartButton />
            </div>
          </div>
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          <div className="container">
            <div className="cols">
              <div>
                <Brand logo={home.images.logo} name={SITE} plain />
                <p style={{ maxWidth: 340, margin: "10px 0 0" }}>{home.footer.about}</p>
              </div>
              <div>
                <h4>Контакти</h4>
                {EMAIL && <a href={`mailto:${EMAIL}`}>{EMAIL}</a>}
                {home.footer.phone && <a href={`tel:${home.footer.phone.replace(/\s/g, "")}`}>{home.footer.phone}</a>}
                {home.footer.address && <span style={{ display: "block" }}>{home.footer.address}</span>}
                <Link href="/contact">Пиши ни</Link>
              </div>
              <div>
                <h4>Важна информация</h4>
                <Link href="/info/delivery">Доставка и плащане</Link>
                <Link href="/info/returns">Връщане и замяна</Link>
                <Link href="/contact">Контакти</Link>
              </div>
            </div>
            <div className="copy">
              <span>© {new Date().getFullYear()} {SITE}. Всички права запазени.</span>
              <Link href="/admin" style={{ display: "inline", margin: 0, opacity: 0.4 }}>Админ</Link>
            </div>
          </div>
        </footer>
        <MobileNav />
        <CookieBar />
        </CartProvider>
      </body>
    </html>
  );
}

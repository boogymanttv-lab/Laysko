import "./globals.css";
import Link from "next/link";
import CartProvider from "./CartProvider";
import CartButton from "./CartButton";

const SITE = process.env.NEXT_PUBLIC_SITE_NAME || "Моят магазин";

export const metadata = {
  title: { default: SITE, template: `%s · ${SITE}` },
  description: "Внимателно подбрани продукти със сигурно плащане и доставка до адреса ти.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="bg">
      <body>
        <CartProvider>
        <div className="topbar">Сигурно плащане със Stripe · Доставка до адреса ти · Проследяване на пратката</div>
        <header className="site-header">
          <div className="container row">
            <Link href="/" className="brand">
              <span className="logo">{SITE.charAt(0).toUpperCase()}</span>
              {SITE}
            </Link>
            <nav>
              <Link href="/products">Продукти</Link>
              <Link href="/#how">Как работи</Link>
              <Link href="/products" className="btn sm primary">Разгледай</Link>
              <CartButton />
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          <div className="container">
            <div className="cols">
              <div>
                <div className="brand"><span className="logo">{SITE.charAt(0).toUpperCase()}</span>{SITE}</div>
                <p style={{ maxWidth: 360, margin: 0 }}>
                  Избрани продукти, подбрани внимателно за теб. Поръчваш лесно, ние се грижим за останалото.
                </p>
              </div>
              <div>
                <h4>Магазин</h4>
                <Link href="/products">Продукти</Link>
                <Link href="/#how">Как работи</Link>
              </div>
              <div>
                <h4>Информация</h4>
                <span>Доставка: 7–21 работни дни</span>
                <span style={{ display: "block" }}>Плащане: карта през Stripe</span>
              </div>
            </div>
            <div className="copy">
              <span>© {new Date().getFullYear()} {SITE}. Всички права запазени.</span>
              <Link href="/admin" style={{ display: "inline", margin: 0, opacity: 0.4 }}>Админ</Link>
            </div>
          </div>
        </footer>
        </CartProvider>
      </body>
    </html>
  );
}

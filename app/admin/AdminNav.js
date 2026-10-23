import Link from "next/link";
import { logout } from "./actions";

export default function AdminNav() {
  return (
    <div className="admin-nav">
      <Link href="/admin">Продукти</Link>
      <Link href="/admin/categories">Категории</Link>
      <Link href="/admin/orders">Поръчки</Link>
      <Link href="/admin/subscribers">Абонати</Link>
      <Link href="/admin/stats">Статистика</Link>
      <Link href="/admin/settings">Начална страница</Link>
      <Link href="/" className="muted">Към сайта ↗</Link>
      <form action={logout} style={{ marginLeft: "auto" }}>
        <button className="btn ghost sm">Изход</button>
      </form>
    </div>
  );
}

export const metadata = { title: "Админ", robots: { index: false, follow: false } };

export default function AdminLayout({ children }) {
  return <div className="container admin-wrap">{children}</div>;
}

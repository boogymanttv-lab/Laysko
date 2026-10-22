import { getHome } from "@/lib/settings";
export const dynamic = "force-dynamic";
export const metadata = { title: "Контакти" };
export default async function Contact() {
  const h = await getHome();
  const EMAIL = h.footer.email || process.env.NEXT_PUBLIC_CONTACT_EMAIL || "";
  return (
    <div className="container page-narrow">
      <h1>Контакти</h1>
      <p className="lead">Имаш въпрос за продукт или поръчка? Пиши ни и ще ти отговорим възможно най-бързо.</p>
      {EMAIL ? <p><a className="btn" href={`mailto:${EMAIL}`}>{EMAIL}</a></p> : <p>Имейлът за контакт ще бъде добавен скоро.</p>}
      {h.footer.phone && <p className="lead">Телефон: <a href={`tel:${h.footer.phone.replace(/\s/g, "")}`}>{h.footer.phone}</a></p>}
      {h.footer.address && <p className="lead">Адрес: {h.footer.address}</p>}
    </div>
  );
}

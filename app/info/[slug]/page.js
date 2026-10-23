import { notFound } from "next/navigation";
const PAGES = {
  delivery: { title: "Доставка и плащане", body: [
    "Доставяме до адреса, който посочиш при поръчката. Срокът е 1–3 работни дни. Доставката е включена в цената.",
    "След изпращане получаваш номер за проследяване на пратката.",
    "Плащането е с банкова карта през Stripe. Данните на картата ти не минават през нашия сайт." ] },
  returns: { title: "Връщане и замяна", body: [
    "Можеш да върнеш продукта в рамките на 14 дни от получаването му, без да посочваш причина.",
    "Пиши ни през страницата за контакти с номера на поръчката и ще ти обясним как да го върнеш." ] },
};
export function generateMetadata({ params }) { return { title: PAGES[params.slug]?.title }; }
export default function Info({ params }) {
  const p = PAGES[params.slug];
  if (!p) notFound();
  return (
    <div className="container page-narrow">
      <h1>{p.title}</h1>
      {p.body.map((t, i) => <p key={i} className="lead">{t}</p>)}
    </div>
  );
}

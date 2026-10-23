// Съдържание на началната страница (редактира се от админ панела). Без зависимости – ползва се и в клиента.
export const HOME_DEFAULTS = {
  marquee: "БЕЗПЛАТНА ДОСТАВКА НАД 100 €",
  hero: {
    eyebrow: "Подбрано с любов",
    title: "Грижим се за теб като никой друг",
    sub: "Внимателно подбрани продукти с високо качество, доставени директно до адреса ти.",
    btn1: "Пазарувай",
    btn2: "Категории",
    product: "",
  },
  badges: [
    { t: "Безплатна доставка над 100 €", s: "1–3 работни дни до адреса ти" },
    { t: "Лесно връщане", s: "14 дни, без да посочваш причина" },
    { t: "Сигурно плащане", s: "С карта през Stripe" },
    { t: "Хора, не ботове", s: "Отговаряме на всеки имейл" },
  ],
  catsTitle: "Какво търсиш днес?",
  promo: { eyebrow: "Специално за теб", title: "Открий нещо, което ще обикнеш", btn: "Виж продуктите", category: "" },
  tabsTitle: "Нашите продукти",
  story: {
    eyebrow: "Нашата история",
    title: "Тестваме и подбираме всеки продукт",
    text: "Всеки продукт в магазина е избран заради качеството и полезността си. Ако не бихме го ползвали сами, не го предлагаме.",
    btn: "Контакти",
  },
  videosTitle: "Виж ги в действие",
  videos: [{ title: "", url: "" }, { title: "", url: "" }, { title: "", url: "" }, { title: "", url: "" }],
  delivery: {
    title: "Доставка, плащане и връщане",
    ship: "Безплатна доставка за поръчки над 100 €. Срок 1–3 работни дни до адреса ти. Получаваш номер за проследяване.",
    pay: "С банкова карта (Visa, Mastercard) през Stripe. Данните на картата не минават през нашия сайт.",
    ret: "14 дни за връщане на продукта, без да посочваш причина.",
  },
  footer: { about: "Избрани продукти, подбрани внимателно за теб. Поръчваш лесно, ние се грижим за останалото.", phone: "", email: "", address: "" },
  images: { hero: "", promo: "", story: "", logo: "" },
};

const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);
export function mergeHome(base, over) {
  if (Array.isArray(base)) {
    if (!Array.isArray(over)) return base;
    return base.map((b, i) => (isObj(b) && isObj(over[i]) ? mergeHome(b, over[i]) : b));
  }
  if (isObj(base)) {
    const out = {};
    for (const k of Object.keys(base)) out[k] = mergeHome(base[k], isObj(over) ? over[k] : undefined);
    return out;
  }
  return typeof over === "string" ? over : base;
}

export function parseHome(raw) {
  let o = {};
  try { o = JSON.parse(raw || "{}"); } catch {}
  return mergeHome(HOME_DEFAULTS, o);
}

// Разпознава YouTube / Vimeo / директен видео файл
export function videoKind(url) {
  const u = String(url || "").trim();
  if (!/^https?:\/\//.test(u)) return null;
  let m = u.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/);
  if (m) return { type: "iframe", src: `https://www.youtube-nocookie.com/embed/${m[1]}?rel=0` };
  m = u.match(/vimeo\.com\/(\d+)/);
  if (m) return { type: "iframe", src: `https://player.vimeo.com/video/${m[1]}` };
  if (/\.(mp4|webm|mov)(\?|$)/i.test(u)) return { type: "file", src: u };
  return null;
}

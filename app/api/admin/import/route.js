import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";

const ALLOWED = [/(^|\.)etsy\.com$/i, /(^|\.)temu\.com$/i, /(^|\.)temu\.to$/i];

function hostOk(u) {
  try {
    const url = new URL(u);
    return url.protocol === "https:" && ALLOWED.some((r) => r.test(url.hostname));
  } catch {
    return false;
  }
}

function meta(html, prop) {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${prop}["'][^>]*content=["']([^"']*)["']|<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${prop}["']`,
    "i"
  );
  const m = html.match(re);
  return m ? decode(m[1] ?? m[2]) : "";
}

function decode(s) {
  return (s || "")
    .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}

function jsonLdProduct(html) {
  const out = [];
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    try {
      const data = JSON.parse(m[1]);
      const list = Array.isArray(data) ? data : data["@graph"] ? data["@graph"] : [data];
      for (const d of list) if (d && /product/i.test(String(d["@type"]))) out.push(d);
    } catch {}
  }
  return out[0] || null;
}

export async function POST(req) {
  if (!isAdmin()) return NextResponse.json({ error: "Не си влязъл" }, { status: 401 });

  const { url } = await req.json();
  if (!hostOk(url)) {
    return NextResponse.json({ error: "Позволени са само линкове от Etsy и Temu (https)." }, { status: 400 });
  }

  let html = "";
  try {
    const res = await fetch(url, {
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(12000),
    });
    if (!hostOk(res.url)) throw new Error("redirect");
    if (!res.ok) throw new Error("status " + res.status);
    html = (await res.text()).slice(0, 2_000_000);
  } catch {
    return NextResponse.json(
      {
        error:
          "Сайтът блокира автоматичното дърпане (Etsy/Temu често го правят). Попълни данните ръчно – линкът ще се запази.",
      },
      { status: 502 }
    );
  }

  const ld = jsonLdProduct(html);
  const title = decode(ld?.name) || meta(html, "og:title") || "";
  const description = decode(ld?.description) || meta(html, "og:description") || "";

  let images = [];
  if (ld?.image) images = (Array.isArray(ld.image) ? ld.image : [ld.image]).map((i) => (typeof i === "string" ? i : i?.url)).filter(Boolean);
  const og = meta(html, "og:image");
  if (og && !images.includes(og)) images.unshift(og);

  const offer = Array.isArray(ld?.offers) ? ld.offers[0] : ld?.offers;
  const price = offer?.price || offer?.lowPrice || meta(html, "product:price:amount") || "";
  const currency = offer?.priceCurrency || meta(html, "product:price:currency") || "";

  if (!title && !images.length) {
    return NextResponse.json({ error: "Не успях да намеря данни за продукта. Попълни ръчно." }, { status: 422 });
  }

  return NextResponse.json({
    title, description, images: images.slice(0, 8),
    supplierPrice: price, supplierCurrency: currency,
    source: /temu/i.test(new URL(url).hostname) ? "temu" : "etsy",
  });
}

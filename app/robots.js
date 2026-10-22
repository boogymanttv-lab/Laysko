export default function robots() {
  const base = process.env.SITE_URL || "https://www.laysko.com";
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/cart", "/success"] }],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}

import crypto from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE = "admin_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 дни

function sign(value) {
  return crypto
    .createHmac("sha256", process.env.ADMIN_SECRET || "")
    .update(value)
    .digest("hex");
}

export function checkPassword(input) {
  const expected = process.env.ADMIN_PASSWORD || "";
  if (!expected || !input) return false;
  const a = Buffer.from(String(input));
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function createSession() {
  const exp = String(Math.floor(Date.now() / 1000) + MAX_AGE);
  cookies().set(COOKIE, `${exp}.${sign(exp)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export function destroySession() {
  cookies().delete(COOKIE);
}

export function isAdmin() {
  if (!process.env.ADMIN_SECRET) return false;
  const v = cookies().get(COOKIE)?.value;
  if (!v) return false;
  const [exp, sig] = v.split(".");
  if (!exp || !sig) return false;
  const good = sign(exp);
  if (sig.length !== good.length) return false;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(good))) return false;
  return Number(exp) > Date.now() / 1000;
}

// Извиквай в началото на всяка админ страница, action и API route.
export function requireAdmin() {
  if (!isAdmin()) redirect("/admin/login");
}

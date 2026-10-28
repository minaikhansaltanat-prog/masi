import crypto from "node:crypto";

const COOKIE = "gm_session";
const TTL = 7 * 24 * 3600;

const hmac = (v) => crypto.createHmac("sha256", process.env.SESSION_SECRET || "").update(v).digest("base64url");
const sha = (v) => crypto.createHash("sha256").update(String(v)).digest();

export function checkPassword(pw) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !process.env.SESSION_SECRET) return false;
  return crypto.timingSafeEqual(sha(pw), sha(expected));
}

export function makeSession() {
  const v = Math.floor(Date.now() / 1000) + TTL + "." + crypto.randomBytes(8).toString("base64url");
  return v + "." + hmac(v);
}

export function isAuthed(req) {
  if (!process.env.SESSION_SECRET) return false;
  const m = /(?:^|;\s*)gm_session=([^;]+)/.exec(req.headers.cookie || "");
  if (!m) return false;
  const [exp, nonce, sig] = m[1].split(".");
  if (!exp || !nonce || !sig || Number(exp) < Date.now() / 1000) return false;
  const want = Buffer.from(hmac(exp + "." + nonce));
  const got = Buffer.from(sig);
  return want.length === got.length && crypto.timingSafeEqual(want, got);
}

export function sessionCookie(req, value, maxAge = TTL) {
  const secure = req.headers["x-forwarded-proto"] === "https" || !!process.env.VERCEL;
  return `${COOKIE}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure ? "; Secure" : ""}`;
}

/** Reject cross-site writes: browsers always send Origin on non-GET fetches. */
export function sameOrigin(req) {
  const o = req.headers.origin;
  if (!o) return true;
  try { return new URL(o).host === req.headers.host; } catch { return false; }
}

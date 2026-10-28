import { handleUpload } from "@vercel/blob/client";
import { checkPassword, makeSession, isAuthed, sessionCookie, sameOrigin } from "../lib/auth.js";
import { latest, listVersions, readVersion, publish, validate, listMedia, deleteMedia } from "../lib/store.js";
import { translate } from "../lib/translate.js";

const MEDIA_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "video/webm", "video/quicktime", "audio/mpeg", "audio/mp4", "audio/aac", "audio/ogg", "audio/wav", "audio/webm", "audio/x-m4a"];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default async function handler(req, res) {
  const route = new URL(req.url, "http://x").pathname.replace(/^\/api\//, "").replace(/\/$/, "");
  try {
    if (route === "content" && req.method === "GET") return await publicContent(res);
    if (route === "login" && req.method === "POST") return await login(req, res);
    if (route === "logout" && req.method === "POST") {
      res.setHeader("Set-Cookie", sessionCookie(req, "", 0));
      return res.status(200).json({ ok: true });
    }
    if (route === "session") return res.status(isAuthed(req) ? 200 : 401).json({ ok: isAuthed(req) });

    if (!route.startsWith("admin/")) return res.status(404).json({ error: "not found" });
    if (!isAuthed(req)) return res.status(401).json({ error: "unauthorized" });
    if (req.method !== "GET" && !sameOrigin(req)) return res.status(403).json({ error: "bad origin" });

    switch (route) {
      case "admin/content":
        if (req.method === "GET") {
          const cur = await latest({ fresh: true });
          return res.status(200).json(cur ? { version: cur.version, content: cur.content } : { version: null, content: null });
        }
        if (req.method === "PUT") return await save(req, res);
        break;
      case "admin/history":
        if (req.method === "GET") {
          const id = new URL(req.url, "http://x").searchParams.get("id");
          if (id) return res.status(200).json(await readVersion(id));
          return res.status(200).json(await listVersions());
        }
        break;
      case "admin/media":
        if (req.method === "GET") return res.status(200).json(await listMedia());
        if (req.method === "DELETE") {
          const ok = await deleteMedia(String((req.body || {}).url || ""));
          return res.status(ok ? 200 : 404).json({ ok });
        }
        break;
      case "admin/upload":
        if (req.method === "POST") return res.status(200).json(await handleUpload({
          body: req.body,
          request: req,
          onBeforeGenerateToken: async (pathname) => {
            if (!/^media\/[\w.\-]{1,120}$/.test(pathname)) throw new Error("bad pathname");
            return { allowedContentTypes: MEDIA_TYPES, maximumSizeInBytes: 150 * 1024 * 1024, addRandomSuffix: true, cacheControlMaxAge: 31536000 };
          },
        }));
        break;
      case "admin/translate":
        if (req.method === "POST") return await doTranslate(req, res);
        break;
    }
    return res.status(405).json({ error: "method not allowed" });
  } catch (e) {
    const status = e.status || 500;
    if (status === 500) console.error(route, e);
    return res.status(status).json({ error: e.message, current: e.current });
  }
}

async function publicContent(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "public, s-maxage=20, stale-while-revalidate=300");
  const cur = await latest();
  return res.status(200).json(cur ? cur.content : { empty: true });
}

async function login(req, res) {
  if (!sameOrigin(req)) return res.status(403).json({ error: "bad origin" });
  const pw = String((req.body || {}).password || "");
  if (!checkPassword(pw)) {
    await sleep(800);
    return res.status(401).json({ error: "wrong password" });
  }
  res.setHeader("Set-Cookie", sessionCookie(req, makeSession()));
  return res.status(200).json({ ok: true });
}

async function save(req, res) {
  const { content, baseVersion } = req.body || {};
  const errs = validate(content);
  if (errs.length) return res.status(400).json({ error: errs.join("; ") });
  if (JSON.stringify(content).length > 2_000_000) return res.status(413).json({ error: "content too large" });
  return res.status(200).json(await publish(content, baseVersion || null));
}

async function doTranslate(req, res) {
  const { items, from, to } = req.body || {};
  if (!Array.isArray(items) || !items.length || items.length > 40 || !/^[a-z-]{2,8}$/i.test(from || "") || !/^[a-z-]{2,8}$/i.test(to || "")) {
    return res.status(400).json({ error: "bad request" });
  }
  const clean = items.map((i) => ({ text: String(i.text || "").slice(0, 2000) }));
  const { engine, out } = await translate(clean, from, to);
  return res.status(200).json({ engine, out });
}

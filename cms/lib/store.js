import { put, list, del } from "@vercel/blob";

const VPREFIX = "content/v/";
const KEEP = 40;
const ID_RE = /^content\/v\/(\d{8}T\d{9}Z)\.json$/;

export const idOf = (pathname) => (ID_RE.exec(pathname) || [])[1] || null;

async function listAll(prefix) {
  const out = [];
  let cursor;
  do {
    const r = await list({ prefix, cursor, limit: 1000 });
    out.push(...r.blobs);
    cursor = r.hasMore ? r.cursor : undefined;
  } while (cursor);
  return out;
}

/** Versions are immutable files, newest first; this sidesteps CDN caching of overwritten blobs. */
export async function listVersions() {
  const blobs = (await listAll(VPREFIX)).filter((b) => idOf(b.pathname));
  return blobs.sort((a, b) => (a.pathname < b.pathname ? 1 : -1))
    .map((b) => ({ id: idOf(b.pathname), url: b.url, size: b.size, uploadedAt: b.uploadedAt }));
}

let memo = { at: 0, value: null };

export async function latest({ fresh = false } = {}) {
  if (!fresh && Date.now() - memo.at < 5000) return memo.value;
  const versions = await listVersions();
  let value = null;
  if (versions.length) {
    const r = await fetch(versions[0].url);
    if (!r.ok) throw new Error("Cannot read version " + versions[0].id);
    value = { version: versions[0].id, content: await r.json() };
  }
  memo = { at: Date.now(), value };
  return value;
}

export async function readVersion(id) {
  if (!/^\d{8}T\d{9}Z$/.test(id)) throw new Error("bad id");
  const v = (await listVersions()).find((x) => x.id === id);
  if (!v) return null;
  return (await fetch(v.url)).json();
}

const ID_PATTERN = /^[A-Za-z0-9_-]{1,40}$/;
const LANG_PATTERN = /^[a-z]{2,3}(-[A-Za-z0-9]{2,8})?$/;
const URL_PATTERN = /^(assets\/|https:\/\/)/;

export function validate(c) {
  const errs = [];
  const isObj = (x) => x && typeof x === "object" && !Array.isArray(x);
  if (!isObj(c) || c.schema !== 2) return ["schema must be 2"];
  if (!Array.isArray(c.languages) || !c.languages.length) errs.push("languages missing");
  const codes = (c.languages || []).map((l) => l && l.code);
  if (codes.some((x) => !LANG_PATTERN.test(x || ""))) errs.push("bad language code");
  if (new Set(codes).size !== codes.length) errs.push("duplicate language code");
  if (!codes.includes(c.defaultLang)) errs.push("defaultLang must be one of languages");
  if (!isObj(c.texts) || !isObj(c.settings)) errs.push("texts/settings missing");
  for (const k of ["marquee", "colors", "categories", "customOrders", "aboutFeatures", "gallery", "testimonials"]) {
    if (!Array.isArray(c[k])) errs.push(k + " must be an array");
  }
  if (!c.hero || !Array.isArray(c.hero.slides)) errs.push("hero.slides missing");
  if (errs.length) return errs;
  for (const x of [...c.categories, ...c.customOrders]) {
    if (!ID_PATTERN.test(x.id || "")) errs.push("bad card id: " + x.id);
    for (const s of x.slides || []) if (!URL_PATTERN.test(s.src || "")) errs.push("bad slide url in " + x.id);
  }
  if (new Set(c.categories.map((x) => x.id)).size !== c.categories.length) errs.push("duplicate category id");
  if (new Set(c.customOrders.map((x) => x.id)).size !== c.customOrders.length) errs.push("duplicate custom order id");
  for (const x of c.colors) if (!ID_PATTERN.test(x.key || "")) errs.push("bad color key: " + x.key);
  for (const g of c.gallery) if (!URL_PATTERN.test(g.src || "")) errs.push("bad gallery url");
  for (const s of c.hero.slides) if (!URL_PATTERN.test(s || "")) errs.push("bad hero url");
  return errs.slice(0, 10);
}

export async function publish(content, baseVersion) {
  const current = (await listVersions())[0];
  if (current && current.id !== baseVersion) {
    const err = new Error("conflict");
    err.status = 409;
    err.current = current.id;
    throw err;
  }
  const now = new Date();
  const id = now.toISOString().replace(/[-:.]/g, "");
  const doc = { ...content, version: id, updatedAt: now.toISOString() };
  await put(VPREFIX + id + ".json", JSON.stringify(doc), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: false,
    cacheControlMaxAge: 31536000,
  });
  const all = await listVersions();
  const old = all.slice(KEEP);
  if (old.length) await del(old.map((v) => v.url));
  memo = { at: 0, value: null };
  return { version: id, updatedAt: doc.updatedAt };
}

export async function listMedia() {
  const blobs = await listAll("media/");
  return blobs.map((b) => ({ url: b.url, pathname: b.pathname, size: b.size, uploadedAt: b.uploadedAt }))
    .sort((a, b) => (a.uploadedAt < b.uploadedAt ? 1 : -1));
}

export async function deleteMedia(url) {
  const known = (await listMedia()).find((m) => m.url === url);
  if (!known) return false;
  await del(url);
  return true;
}

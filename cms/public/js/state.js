/* Shared mutable state. Edits write straight into S.draft; app.js listens through `hooks`. */

export const S = {
  draft: null,        // content being edited
  liveJson: "",       // JSON of the last published/seed content, to detect unsaved changes
  baseVersion: null,  // version id the draft is based on (null = never published)
  hasPublished: false,
  publishedAt: null,
  focusLang: "all",
  page: "overview",
  site: "",
  open: new Set(),    // ids of expanded list items
};

export const hooks = { changed() {}, rerender() {}, navigate() {}, publish() {} };
export const navigate = (page) => hooks.navigate(page);
export const changed = () => hooks.changed();
export const rerender = () => hooks.rerender();

export const defLang = () => S.draft.defaultLang;
export const langDef = (code) => S.draft.languages.find((l) => l.code === code);
export const isDirty = () => JSON.stringify(S.draft) !== S.liveJson;

export function isOpen(id, dflt = false) { return S.open.has(id) || (dflt && !S.open.has("-" + id)); }
export function setOpen(id, on) { on ? (S.open.add(id), S.open.delete("-" + id)) : (S.open.delete(id), S.open.add("-" + id)); }

/** Relative site paths (assets/...) are served by the public site, not by the admin host. */
export function mediaUrl(src) {
  if (!src) return "";
  if (/^(https?:|data:|blob:)/.test(src)) return src;
  return S.site.replace(/\/$/, "") + "/" + src.replace(/^\//, "");
}

export function mediaType(src) {
  const ext = (String(src).split("?")[0].match(/\.([a-z0-9]+)$/i) || [])[1] || "";
  if (/^(mp4|webm|mov|m4v)$/i.test(ext)) return "video";
  if (/^(mp3|m4a|aac|ogg|wav)$/i.test(ext)) return "audio";
  return "image";
}

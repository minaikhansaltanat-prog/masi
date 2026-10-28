/* Reusable form widgets. They mutate the content objects they are given and call changed(). */
import { h, icon, toast } from "./util.js";
import { S, changed as globalChanged, changed, defLang, isOpen, setOpen, mediaUrl, mediaType } from "./state.js";
import { pickMedia } from "./media.js";
import { runTranslate } from "./translate.js";

const fit = (el) => { el.style.height = "auto"; el.style.height = Math.min(el.scrollHeight + 2, 340) + "px"; };

/** One text, one input per language (filtered by the language focus at the top of the page). */
export function tField(map, { label = "", long = false, hint = "", translatable = true } = {}) {
  const def = defLang();
  const focus = S.focusLang;
  const codes = focus === "all" ? S.draft.languages.map((l) => l.code) : [...new Set([def, focus])];
  const rows = codes.map((code) => {
    const ld = S.draft.languages.find((l) => l.code === code);
    const ref = focus !== "all" && focus !== def && code === def;
    const el = h(long ? "textarea" : "input", { type: long ? null : "text", dir: ld.dir, lang: code, readonly: ref, rows: long ? 2 : null, "aria-label": `${label} (${ld.name})` });
    el.value = map[code] || "";
    const row = h("div", { class: "tf-row" + (ref ? " ref" : "") }, h("span", { class: "lc" + (code === def ? " def" : ""), title: ld.name }, code), el);
    const flag = () => row.classList.toggle("missing", !ref && code !== def && !el.value.trim() && !!(map[def] || "").trim());
    flag();
    if (long) requestAnimationFrame(() => fit(el));
    if (!ref) el.addEventListener("input", () => { map[code] = el.value; if (long) fit(el); flag(); changed(); });
    return row;
  });
  const missing = codes.filter((c) => c !== def && !(map[c] || "").trim());
  const btn = translatable && missing.length && (map[def] || "").trim()
    ? h("button", { class: "mini", type: "button", title: "Бос тілдерге автоаударма", onClick: () => runTranslate([{ map }], missing) }, icon("wand", 14), "Аудару") : null;
  return h("div", { class: "tf" }, h("div", { class: "tf-head" }, h("span", { class: "tf-label" }, label), btn), hint ? h("small", { class: "hint" }, hint) : null, rows);
}

/** Plain single-value input bound to obj[key]. */
export function field(obj, key, { label, hint, type = "text", placeholder = "", mono = false, after } = {}) {
  const el = h("input", { type, placeholder, class: mono ? "mono" : null, autocomplete: "off" });
  el.value = obj[key] || "";
  el.addEventListener("input", () => { obj[key] = el.value; changed(); });
  if (after) el.addEventListener("blur", () => { el.value = obj[key] = after(el.value); changed(); });
  return h("label", { class: "fld" }, h("span", {}, label), el, hint ? h("small", { class: "hint" }, hint) : null);
}

export function toggle(checked, onChange, label, hint) {
  const input = h("input", { type: "checkbox", role: "switch" });
  input.checked = !!checked;
  input.addEventListener("change", () => { onChange(input.checked); changed(); });
  return h("label", { class: "switch" }, input, h("span", { class: "knob" }), h("span", { class: "sw-text" }, label, hint ? h("small", {}, hint) : null));
}

export function thumb(src) {
  const t = mediaType(src);
  if (t === "video") return h("video", { src: mediaUrl(src) + "#t=0.1", muted: true, preload: "metadata", playsinline: true });
  if (t === "audio") return h("div", { class: "audio-ph" }, icon("music", 24));
  return h("img", { src: mediaUrl(src), alt: "", loading: "lazy" });
}

/** A single image/video value (logo, QR code, review media…). */
export function mediaSlot(get, set, { label, hint = "", kinds = ["image"] } = {}) {
  const holder = h("div", { class: "mslot" });
  const draw = () => {
    const src = get();
    holder.replaceChildren(
      h("div", { class: "mslot-prev" }, src ? thumb(src) : h("span", { class: "ph" }, icon("image", 24))),
      h("div", { class: "mslot-body" }, h("b", {}, label), hint ? h("small", { class: "hint" }, hint) : null,
        h("div", { class: "row" },
          h("button", { class: "btn ghost sm", type: "button", onClick: async () => { const r = await pickMedia({ kinds }); if (r && r[0]) { set(r[0].url); draw(); changed(); } } }, icon("image", 15), src ? "Ауыстыру" : "Таңдау"),
          src ? h("button", { class: "btn ghost sm danger", type: "button", onClick: () => { set(""); draw(); changed(); } }, icon("trash", 15), "Алып тастау") : null)));
  };
  draw();
  return holder;
}

/** Ordered photo/video list with drag & drop, arrows and (optionally) a colour tag per slide. */
export function slidesEditor(slides, { colors = null, kinds = ["image", "video"], onChange } = {}) {
  const root = h("div", { class: "slides" });
  const changed = () => { if (onChange) onChange(slides); globalChanged(); };
  let dragFrom = null;
  const colorName = (key) => {
    const c = S.draft.colors.find((x) => x.key === key);
    return (c && (c.name[defLang()] || c.name[Object.keys(c.name)[0]])) || key;
  };
  const move = (i, d) => { const j = i + d; if (j < 0 || j >= slides.length) return; [slides[i], slides[j]] = [slides[j], slides[i]]; draw(); changed(); };

  const draw = () => {
    const tiles = slides.map((s, i) => {
      const t = h("div", { class: "stile", draggable: "true", "data-i": i },
        h("div", { class: "stile-media" }, thumb(s.src), s.type === "video" ? h("span", { class: "mbadge" }, icon("play", 11)) : null,
          h("span", { class: "snum" }, i + 1), h("span", { class: "grip", title: "Сүйреп ауыстыру" }, icon("grip", 16))),
        colors ? (() => {
          const sel = h("select", { "aria-label": "Слайд түсі" }, h("option", { value: "" }, "— түссіз —"),
            colors.map((c) => h("option", { value: c.key }, colorName(c.key))));
          sel.value = s.color || "";
          sel.addEventListener("change", () => { s.color = sel.value || null; changed(); });
          return sel;
        })() : null,
        h("div", { class: "stile-actions" },
          h("button", { class: "icon-btn", type: "button", title: "Солға", disabled: i === 0, onClick: () => move(i, -1) }, icon("left", 16)),
          h("button", { class: "icon-btn", type: "button", title: "Оңға", disabled: i === slides.length - 1, onClick: () => move(i, 1) }, icon("right", 16)),
          h("button", { class: "icon-btn", type: "button", title: "Ауыстыру", onClick: async () => {
            const r = await pickMedia({ kinds }); if (r && r[0]) { s.src = r[0].url; s.type = r[0].type; draw(); changed(); }
          } }, icon("image", 16)),
          h("button", { class: "icon-btn danger", type: "button", title: "Жою", onClick: () => { slides.splice(i, 1); draw(); changed(); } }, icon("trash", 16))));
      t.addEventListener("dragstart", (e) => { dragFrom = i; e.dataTransfer.effectAllowed = "move"; t.classList.add("drag"); });
      t.addEventListener("dragend", () => t.classList.remove("drag"));
      t.addEventListener("dragover", (e) => { if (dragFrom != null) { e.preventDefault(); t.classList.add("over"); } });
      t.addEventListener("dragleave", () => t.classList.remove("over"));
      t.addEventListener("drop", (e) => {
        e.preventDefault();
        if (dragFrom == null || dragFrom === i) return;
        const [m] = slides.splice(dragFrom, 1); slides.splice(i, 0, m); dragFrom = null; draw(); changed();
      });
      return t;
    });
    const add = h("button", { class: "stile add", type: "button", onClick: async () => {
      const r = await pickMedia({ kinds, multiple: true, title: "Слайдтарға файл қосу" });
      if (!r) return;
      r.forEach((m) => {
        const s = { type: m.type === "video" ? "video" : "image", src: m.url };
        if (colors) s.color = colors.length === 1 ? colors[0].key : null;
        slides.push(s);
      });
      draw(); changed();
    } }, icon("plus", 22), h("span", {}, "Фото / бейне қосу"));
    root.replaceChildren(...tiles, add);
  };
  draw();
  return root;
}

/** Collapsible list row with reorder / delete buttons. */
export function itemShell({ id, title, meta, onUp, onDown, onDelete, body, dflt = false }) {
  const stop = (fn) => (e) => { e.preventDefault(); e.stopPropagation(); fn(); };
  const d = h("details", { class: "item" },
    h("summary", {},
      h("span", { class: "chev" }, icon("down", 16)),
      h("span", { class: "item-title" }, title || "(атауы жоқ)"), meta ? h("span", { class: "item-meta" }, meta) : null,
      h("span", { class: "item-actions" },
        h("button", { class: "icon-btn", type: "button", title: "Жоғары", disabled: !onUp, onClick: stop(onUp || (() => {})) }, icon("up", 16)),
        h("button", { class: "icon-btn", type: "button", title: "Төмен", disabled: !onDown, onClick: stop(onDown || (() => {})) }, icon("down", 16)),
        h("button", { class: "icon-btn danger", type: "button", title: "Жою", onClick: stop(onDelete) }, icon("trash", 16)))),
    h("div", { class: "item-body" }, body));
  d.open = isOpen(id, dflt);
  d.addEventListener("toggle", () => setOpen(id, d.open));
  return d;
}

export function moveInArray(arr, i, d) {
  const j = i + d;
  if (j < 0 || j >= arr.length) return;
  [arr[i], arr[j]] = [arr[j], arr[i]];
}

export const card = (title, hint, ...kids) => h("section", { class: "card" }, title ? h("h2", {}, title) : null, hint ? h("p", { class: "card-hint" }, hint) : null, ...kids);

export const pageHead = (title, desc, ...actions) => h("div", { class: "page-head" }, h("div", {}, h("h1", {}, title), desc ? h("p", {}, desc) : null), actions.length ? h("div", { class: "page-actions" }, actions) : null);

export { toast };

/* Boot, login, shell, routing, live preview and publishing. */
import { h, $, icon, toast, modal, confirmDialog, clone, debounce, fmtDate } from "./util.js";
import { api, setUnauthorizedHandler } from "./api.js";
import { S, hooks, isDirty } from "./state.js";
import { collectFields, textLabel } from "./schema.js";
import { missingCount } from "./translate.js";
import * as pages from "./pages.js";

const NAV = [
  ["Басты", [["overview", "Шолу", "home"]]],
  ["Мазмұн", [["texts", "Мәтіндер", "type"], ["categories", "Өнім карточкалары", "grid"], ["custom", "Жеке тапсырыс", "sparkle"], ["gallery", "Галерея және слайдтар", "image"],
    ["about", "Шеберхана блогы", "award"], ["reviews", "Пікірлер", "chat"], ["colors", "Түстер", "palette"]]],
  ["Сайт", [["languages", "Тілдер", "globe"], ["settings", "Баптаулар", "gear"], ["media", "Медиа кітапхана", "folder"], ["history", "Тарих", "clock"]]],
];
const PAGES = { overview: pages.overview, texts: pages.texts, categories: pages.categories, custom: pages.custom, gallery: pages.gallery, about: pages.about,
  reviews: pages.reviews, colors: pages.colors, settings: pages.settings, languages: pages.languages, media: pages.mediaPage, history: pages.history };
const TITLES = Object.fromEntries(NAV.flatMap(([, items]) => items.map(([id, label]) => [id, label])));
const DRAFT_KEY = "gm_draft_v1";

const root = document.getElementById("root");
S.site = (new URLSearchParams(location.search).get("site") || (window.GUMYR_ADMIN || {}).siteUrl || "https://gumyr.kz").replace(/\/$/, "");
S.textGroup = "hero";
S.onlyMissing = false;

/* ---------------- login ---------------- */
function showLogin(message) {
  root.replaceChildren();
  document.body.classList.add("is-login");
  const pw = h("input", { type: "password", autocomplete: "current-password", placeholder: "Құпия сөз", required: true, "aria-label": "Құпия сөз", autofocus: true });
  const err = h("p", { class: "login-err", role: "alert" }, message || "");
  const btn = h("button", { class: "btn primary block", type: "submit" }, "Кіру");
  const form = h("form", { class: "login-card", onSubmit: async (e) => {
    e.preventDefault();
    btn.disabled = true; err.textContent = "";
    try {
      await api("login", { method: "POST", body: { password: pw.value } });
      document.body.classList.remove("is-login");
      await start();
    } catch (ex) {
      err.textContent = ex.status === 401 ? "Құпия сөз қате" : "Қате: " + ex.message;
      form.classList.remove("shake"); void form.offsetWidth; form.classList.add("shake");
      btn.disabled = false; pw.select();
    }
  } },
  h("img", { src: "/logo.png", alt: "GUMYR", class: "login-logo" }),
  h("h1", {}, "Басқару панелі"), h("p", {}, "Сайттың мәтіндерін, суреттерін және аудармаларын өзгерту"),
  h("input", { type: "text", name: "username", value: "admin", autocomplete: "username", hidden: true }),
  h("label", { class: "fld" }, h("span", {}, "Құпия сөз"), pw), err, btn);
  root.append(h("div", { class: "login" }, form, h("p", { class: "login-foot" }, "GUMYR · GUMIR.KZ")));
  setTimeout(() => pw.focus(), 50);
}

/* ---------------- data ---------------- */
function normalize(c) {
  delete c.version; delete c.updatedAt;
  c.settings.banner = c.settings.banner || { enabled: false, link: "" };
  c.settings.hiddenSections = c.settings.hiddenSections || [];
  c.texts["banner.text"] = c.texts["banner.text"] || {};
  for (const k of ["wa.greeting", "wa.product", "wa.sizing"]) c.texts[k] = c.texts[k] || {};
  c.languages.forEach((l) => { if (l.enabled === undefined) l.enabled = true; });
}

async function loadAll() {
  const r = await api("admin/content");
  let content;
  if (r.content) { content = r.content; S.baseVersion = r.version; S.hasPublished = true; S.publishedAt = r.content.updatedAt; }
  else { content = await (await fetch("/seed.json")).json(); S.baseVersion = null; S.hasPublished = false; S.publishedAt = null; }
  const seed = await (await fetch("/seed.json")).json();
  for (const k of Object.keys(seed.texts)) if (!content.texts[k]) content.texts[k] = seed.texts[k];
  normalize(content);
  S.draft = clone(content);
  S.liveJson = JSON.stringify(S.draft);
  S.focusLang = "all";

  try {
    const saved = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
    if (saved && saved.base === S.baseVersion && JSON.stringify(saved.draft) !== S.liveJson) {
      const restore = await confirmDialog("Сақталмаған жоба табылды", `Осы браузерде ${fmtDate(saved.at)} кезінде жарияланбаған өзгерістер қалған. Қалпына келтіресіз бе?`, "Қалпына келтіру");
      if (restore) S.draft = saved.draft; else localStorage.removeItem(DRAFT_KEY);
    }
  } catch { /* storage unavailable */ }
}

/* ---------------- shell ---------------- */
let statusEl, publishBtn, view, titleEl, previewApi;

function navigate(page) {
  S.page = PAGES[page] ? page : "overview";
  if (location.hash !== "#/" + S.page) history.replaceState(null, "", "#/" + S.page);
  renderPage();
  $(".side")?.classList.remove("open");
}

function renderPage() {
  titleEl.textContent = TITLES[S.page];
  document.querySelectorAll(".nav a").forEach((a) => a.classList.toggle("on", a.dataset.page === S.page));
  const keepScroll = window.scrollY;
  view.replaceChildren(PAGES[S.page]());
  view.classList.remove("in"); void view.offsetWidth; view.classList.add("in");
  window.scrollTo(0, keepScroll);
}

function refreshStatus() {
  const dirty = isDirty();
  statusEl.className = "status " + (dirty ? "dirty" : S.hasPublished ? "ok" : "new");
  statusEl.textContent = dirty ? "Жарияланбаған өзгерістер бар" : S.hasPublished ? "Жарияланған · " + fmtDate(S.publishedAt) : "Әлі жарияланбаған";
  publishBtn.disabled = !dirty && S.hasPublished;
}

const onChanged = debounce(() => {
  refreshStatus();
  try {
    if (isDirty()) localStorage.setItem(DRAFT_KEY, JSON.stringify({ base: S.baseVersion, at: new Date().toISOString(), draft: S.draft }));
    else localStorage.removeItem(DRAFT_KEY);
  } catch { /* storage full or blocked */ }
  previewApi && previewApi.push();
}, 250);

function buildShell() {
  document.body.classList.remove("is-login");
  statusEl = h("span", { class: "status" });
  publishBtn = h("button", { class: "btn primary", onClick: publish }, icon("upload", 16), "Жариялау");
  titleEl = h("h2", { class: "top-title" });
  view = h("main", { id: "view", class: "view" });
  previewApi = buildPreview();

  const nav = h("nav", { class: "nav", "aria-label": "Бөлімдер" }, NAV.map(([group, items]) => h("div", { class: "nav-group" }, h("span", {}, group),
    items.map(([id, label, ic]) => h("a", { href: "#/" + id, "data-page": id, onClick: (e) => { e.preventDefault(); navigate(id); } }, icon(ic, 18), label)))));
  const side = h("aside", { class: "side" },
    h("div", { class: "side-brand" }, h("img", { src: "/logo.png", alt: "GUMYR" }), h("span", {}, "Басқару панелі")), nav,
    h("div", { class: "side-foot" },
      h("a", { href: S.site, target: "_blank", rel: "noopener" }, icon("link", 16), "Сайтты ашу"),
      h("button", { type: "button", onClick: async () => { try { await api("logout", { method: "POST", body: {} }); } catch { /* already out */ } showLogin(); } }, icon("logout", 16), "Шығу")));

  root.replaceChildren(h("div", { class: "app" }, side, h("div", { class: "main" },
    h("header", { class: "top" },
      h("button", { class: "icon-btn burger", "aria-label": "Мәзір", onClick: () => side.classList.toggle("open") }, icon("menu", 20)),
      titleEl, statusEl,
      h("div", { class: "top-actions" },
        h("button", { class: "btn ghost", onClick: () => previewApi.toggle() }, icon("eye", 16), h("span", { class: "hide-sm" }, "Алдын ала қарау")), publishBtn)),
    view), previewApi.el));
}

/* ---------------- live preview ---------------- */
function buildPreview() {
  const origin = new URL(S.site).origin;
  let lang = null, ready = false, timer;
  const iframe = h("iframe", { title: "Сайтты алдын ала қарау", src: S.site + "/?cms-preview=1", loading: "lazy" });
  const note = h("p", { class: "pv-note" }, "Алдын ала қарау жаңартылған сайт файлдарын қажет етеді. Сайт GitHub-қа жарияланған соң жұмыс істейді.");
  const langs = h("div", { class: "pv-langs" });
  const el = h("aside", { class: "preview", "aria-label": "Алдын ала қарау" },
    h("header", {}, h("b", {}, "Алдын ала қарау"), h("small", {}, "жарияланбаған өзгерістермен"),
      h("button", { class: "icon-btn", "aria-label": "Жабу", onClick: () => api0.toggle(false) }, icon("x", 18))),
    langs, h("div", { class: "pv-frame" }, iframe), note);
  const drawLangs = () => langs.replaceChildren(...S.draft.languages.map((l) =>
    h("button", { class: "chip" + ((lang || S.draft.defaultLang) === l.code ? " on" : ""), onClick: () => { lang = l.code; drawLangs(); api0.push(); } }, l.code.toUpperCase())));
  const api0 = {
    el,
    push() {
      if (!el.classList.contains("open") || !iframe.contentWindow) return;
      if (langs.children.length !== S.draft.languages.length) drawLangs();
      iframe.contentWindow.postMessage({ type: "gumyr-preview", content: S.draft, lang: lang || S.draft.defaultLang }, origin);
    },
    toggle(force) {
      const on = force === undefined ? !el.classList.contains("open") : force;
      el.classList.toggle("open", on);
      document.body.classList.toggle("pv-open", on);
      if (on) {
        drawLangs(); note.hidden = true; clearTimeout(timer);
        if (!ready) timer = setTimeout(() => { if (!ready) note.hidden = false; }, 5000);
        api0.push();
      }
    },
  };
  window.addEventListener("message", (e) => {
    if (e.source === iframe.contentWindow && e.data && e.data.type === "gumyr-preview-ready") { ready = true; note.hidden = true; api0.push(); }
  });
  return api0;
}

/* ---------------- publish ---------------- */
async function publish() {
  const fields = collectFields(S.draft, textLabel).filter((f) => (f.map[S.draft.defaultLang] || "").trim());
  const gaps = S.draft.languages.filter((l) => l.enabled !== false && l.code !== S.draft.defaultLang).map((l) => [l.name, missingCount(fields, l.code)]).filter((x) => x[1]);
  const ok = await new Promise((resolve) => modal({
    title: "Сайтқа жариялау",
    body: h("div", {}, h("p", { class: "muted-p" }, "Өзгерістер gumyr.kz сайтында шамамен 20–30 секундта көрінеді. Алдыңғы нұсқа «Тарих» бетінде сақталады."),
      gaps.length ? h("div", { class: "callout warn" }, icon("alert", 16), h("div", {}, h("b", {}, "Аудармасы жоқ мәтіндер бар:"), h("ul", {}, gaps.map(([n, m]) => h("li", {}, `${n}: ${m}`))), h("small", {}, "Олар сайтта негізгі тілде көрінеді. «Тілдер» бетінде автоаудару бар."))) : null),
    onClose: (v) => resolve(v === true),
    actions: [{ label: "Бас тарту", value: false }, { label: "Жариялау", kind: "primary", value: true }],
  }));
  if (!ok) return;
  await doPublish(S.baseVersion);
}

async function doPublish(base) {
  publishBtn.disabled = true;
  try {
    const res = await api("admin/content", { method: "PUT", body: { content: S.draft, baseVersion: base } });
    S.baseVersion = res.version; S.hasPublished = true; S.publishedAt = res.updatedAt; S.liveJson = JSON.stringify(S.draft);
    try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
    refreshStatus();
    if (S.page === "overview" || S.page === "history") renderPage();
    toast("Жарияланды! Сайтта 20–30 секундта көрінеді.", "ok", 6000);
  } catch (e) {
    publishBtn.disabled = false;
    if (e.status === 409) {
      modal({
        title: "Басқа жерде жаңа нұсқа жарияланған",
        body: h("p", { class: "muted-p" }, "Сіз ашқаннан кейін бұл сайт басқа қойындыда немесе құрылғыда өзгертілген. Өз нұсқаңызбен ауыстыруға немесе беттегі жобаны сақтап, қайта жүктеуге болады."),
        actions: [{ label: "Бас тарту", value: false }, { label: "Менікімен ауыстыру", kind: "danger", onClick: (close) => { close(); doPublish(e.data.current); } }],
      });
    } else toast("Жарияланбады: " + e.message, "err", 8000);
  }
}

/* ---------------- start ---------------- */
hooks.changed = onChanged;
hooks.rerender = () => renderPage();
hooks.navigate = navigate;
setUnauthorizedHandler(() => showLogin("Сессия аяқталды — қайта кіріңіз"));
window.addEventListener("beforeunload", (e) => { if (S.draft && isDirty()) { e.preventDefault(); e.returnValue = ""; } });
window.addEventListener("hashchange", () => { const p = location.hash.replace("#/", ""); if (S.draft && PAGES[p] && p !== S.page) navigate(p); });

async function start() {
  root.replaceChildren(h("div", { class: "boot" }, h("i"), "Жүктелуде…"));
  try { await loadAll(); } catch (e) { if (e.status !== 401) root.replaceChildren(h("div", { class: "boot" }, "Қате: " + e.message)); return; }
  buildShell();
  refreshStatus();
  navigate(location.hash.replace("#/", "") || "overview");
}

(async () => {
  try { await api("session"); } catch { return showLogin(); }
  start();
})();

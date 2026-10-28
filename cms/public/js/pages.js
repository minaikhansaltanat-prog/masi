/* One function per admin page. Each returns a DOM node. */
import { h, icon, toast, modal, confirmDialog, clone, uid, slug, fmtBytes, fmtDate, versionDate } from "./util.js";
import { api } from "./api.js";
import { S, changed, rerender, navigate, defLang, mediaUrl, mediaType, isDirty } from "./state.js";
import { TEXT_GROUPS, SECTIONS, FEATURE_ICONS, LANG_PRESETS, REVIEW_TYPES, collectFields, textLabel } from "./schema.js";
import { tField, field, toggle, mediaSlot, slidesEditor, itemShell, moveInArray, card, pageHead, thumb } from "./fields.js";
import { missingCount, runTranslate } from "./translate.js";
import { loadUploaded, invalidateMedia, uploadFiles, tile } from "./media.js";

const dl = () => defLang();
const first = (map) => (map && (map[dl()] || map[Object.keys(map).find((k) => map[k])])) || "";

/* ---------------- shared ---------------- */
export function langBar() {
  const L = S.draft.languages;
  const chip = (code, label, title) => h("button", { class: "chip" + (S.focusLang === code ? " on" : ""), type: "button", title, onClick: () => { S.focusLang = code; rerender(); } }, label);
  return h("div", { class: "langbar" }, h("span", { class: "langbar-label" }, icon("globe", 15), "Тіл:"),
    chip("all", "Барлығы", "Барлық тілдерді көрсету"),
    L.map((l) => chip(l.code, l.code.toUpperCase(), l.name + (l.enabled === false ? " (сайтта өшірулі)" : ""))));
}

const newMap = () => ({});

/* ---------------- overview ---------------- */
function healthChecks() {
  const c = S.draft, out = [];
  const fields = collectFields(c, textLabel);
  if (!S.hasPublished) out.push({ lvl: "warn", text: "Админ панель әлі бірде-бір рет жарияланған жоқ. Сайт қазір өзінің бастапқы мәтіндерін көрсетіп тұр — алғашқы «Жариялау» басылғанда сайт осы панельге қосылады.", go: null });
  for (const l of c.languages) {
    if (l.code === c.defaultLang) continue;
    const m = missingCount(fields, l.code);
    if (m) out.push({ lvl: l.enabled === false ? "info" : "warn", text: `${l.name}: ${m} мәтіннің аудармасы жоқ — сайтта негізгі тілдегі мәтін көрінеді.`, go: "languages" });
  }
  if (String(c.settings.whatsapp || "").replace(/\D/g, "").length < 10) out.push({ lvl: "err", text: "WhatsApp нөмірі толық емес — сайттағы барлық WhatsApp батырмалары жұмыс істемейді.", go: "settings" });
  if (!c.hero.slides.length) out.push({ lvl: "warn", text: "Басты экранда фон суреті жоқ.", go: "gallery" });
  for (const x of c.categories) if (!x.slides.length) out.push({ lvl: "warn", text: `«${first(x.title) || x.id}» карточкасында сурет жоқ.`, go: "categories" });
  for (const x of c.customOrders) if (!x.slides.length) out.push({ lvl: "warn", text: `«${first(x.title) || x.id}» карточкасында сурет жоқ.`, go: "custom" });
  if (c.settings.banner && c.settings.banner.enabled && !(c.texts["banner.text"] || {})[c.defaultLang]) out.push({ lvl: "warn", text: "Ақпарат жолағы қосулы, бірақ мәтіні бос — ол көрінбейді.", go: "texts" });
  const noMedia = c.testimonials.filter((r) => r.type !== "text" && !r.media).length;
  if (noMedia) out.push({ lvl: "info", text: `${noMedia} видео/аудио пікірде файл жоқ — сайтта тек мәтін көрінеді. Файл қоссаңыз, ойнатқыш пайда болады.`, go: "reviews" });
  return out;
}

export function overview() {
  const c = S.draft;
  const fields = collectFields(c, textLabel).filter((f) => (f.map[c.defaultLang] || "").trim());
  const stat = (n, label, page, ic) => h("button", { class: "stat", type: "button", onClick: () => navigate(page) }, h("span", { class: "stat-ic" }, icon(ic, 20)), h("b", {}, n), h("span", {}, label));
  const checks = healthChecks();
  return h("div", {},
    pageHead("Шолу", "Сайттың жағдайы және не істеу керек екені."),
    h("div", { class: "stats" },
      stat(c.categories.length, "өнім карточкасы", "categories", "grid"), stat(c.customOrders.length, "жеке тапсырыс", "custom", "sparkle"),
      stat(c.gallery.length, "галерея файлы", "gallery", "image"), stat(c.testimonials.length, "пікір", "reviews", "chat"),
      stat(c.languages.filter((l) => l.enabled !== false).length, "сайттағы тіл", "languages", "globe")),
    card("Назар аударыңыз", checks.length ? "" : "", checks.length
      ? h("ul", { class: "checks" }, checks.map((k) => h("li", { class: k.lvl }, icon(k.lvl === "info" ? "check" : "alert", 16), h("span", {}, k.text), k.go ? h("button", { class: "btn ghost sm", onClick: () => navigate(k.go) }, "Ашу") : null)))
      : h("p", { class: "ok-p" }, icon("check", 16), " Барлығы дұрыс — ескертулер жоқ.")),
    card("Аудармалардың толымдылығы", `Негізгі тіл — ${c.languages.find((l) => l.code === c.defaultLang).name}. Қалған тілдердегі бос мәтіндер сайтта негізгі тілде көрінеді.`,
      h("div", { class: "cover" }, c.languages.map((l) => {
        const miss = l.code === c.defaultLang ? 0 : missingCount(fields, l.code);
        const pct = fields.length ? Math.round(((fields.length - miss) / fields.length) * 100) : 100;
        return h("div", { class: "cover-row" },
          h("span", { class: "lc" + (l.code === c.defaultLang ? " def" : "") }, l.code), h("b", {}, l.name),
          h("div", { class: "meter", title: pct + "%" }, h("i", { style: { transform: `scaleX(${pct / 100})` } })),
          h("span", { class: "pct" }, pct + "%"),
          miss ? h("button", { class: "btn ghost sm", onClick: () => runTranslate(fields, [l.code]) }, icon("wand", 14), `${miss} мәтінді аудару`) : h("span", { class: "done" }, l.code === c.defaultLang ? "негізгі" : "толық"));
      }))));
}

/* ---------------- texts ---------------- */
export function texts() {
  const c = S.draft;
  const known = new Set(TEXT_GROUPS.flatMap((g) => g.items.map((i) => i[0])));
  const orphans = Object.keys(c.texts).filter((k) => !known.has(k));
  const groups = TEXT_GROUPS.concat(orphans.length ? [{ id: "other", title: "Басқа мәтіндер", items: orphans.map((k) => [k, k]) }] : []);
  const live = groups.map((g) => ({ ...g, items: g.items.filter((i) => c.texts[i[0]]) }));
  const focusCodes = () => (S.focusLang === "all" ? c.languages.map((l) => l.code).filter((x) => x !== c.defaultLang) : S.focusLang === c.defaultLang ? [] : [S.focusLang]);
  const missing = (g) => g.items.filter((i) => focusCodes().some((code) => (c.texts[i[0]][c.defaultLang] || "").trim() && !(c.texts[i[0]][code] || "").trim())).length;
  if (!live.some((g) => g.id === S.textGroup)) S.textGroup = live[0].id;
  const g = live.find((x) => x.id === S.textGroup);
  const items = S.onlyMissing ? g.items.filter((i) => focusCodes().some((code) => (c.texts[i[0]][c.defaultLang] || "").trim() && !(c.texts[i[0]][code] || "").trim())) : g.items;

  return h("div", {},
    pageHead("Мәтіндер", "Сайттағы барлық жазулар. Әр мәтіннің астында әр тілдегі аудармасы тұр."),
    langBar(),
    h("div", { class: "subtabs" }, live.map((x) => {
      const m = missing(x);
      return h("button", { class: "subtab" + (x.id === g.id ? " on" : ""), type: "button", onClick: () => { S.textGroup = x.id; rerender(); } }, x.title, m ? h("em", {}, m) : null);
    })),
    h("div", { class: "filters" }, toggle(S.onlyMissing, (v) => { S.onlyMissing = v; rerender(); }, "Тек аудармасы жоқтарды көрсету")),
    card(g.title, g.hint, items.length ? items.map((i) => tField(c.texts[i[0]], { label: i[1], long: i[2] === "long" || (c.texts[i[0]][dl()] || "").length > 80, hint: i[0] === "wa.product" ? "{title} жазуын өзгертпеңіз — ол карточка атауымен ауысады." : "" }))
      : h("p", { class: "empty" }, "Бұл бөлімде аудармасы жоқ мәтін қалмады. 👍".replace(" 👍", ""))));
}

/* ---------------- product & custom cards ---------------- */
function cardsPage(kind) {
  const c = S.draft;
  const list = c[kind];
  const isCat = kind === "categories";
  const add = () => {
    const x = isCat ? { id: uid("c_"), title: newMap(), desc: newMap(), price: newMap(), showOtherColors: false, colors: [], slides: [] }
      : { id: uid("o_"), title: newMap(), desc: newMap(), price: newMap(), hasPrice: false, slides: [] };
    list.push(x); S.open.add(kind + x.id); changed(); rerender();
  };
  const del = async (i) => {
    if (!(await confirmDialog("Карточканы жою", `«${first(list[i].title) || list[i].id}» карточкасы сайттан жойылады. Жарияламайынша сайтқа әсер етпейді.`, "Жою", "danger"))) return;
    list.splice(i, 1); changed(); rerender();
  };

  const colorsEditor = (x) => {
    const wrap = h("div", { class: "colors-ed" });
    const draw = () => {
      wrap.replaceChildren(
        ...x.colors.map((col, ci) => {
          const sel = h("select", { "aria-label": "Түс" }, c.colors.map((k) => h("option", { value: k.key }, first(k.name) || k.key)));
          sel.value = col.key;
          sel.addEventListener("change", () => { const old = col.key; col.key = sel.value; x.slides.forEach((s) => { if (s.color === old) s.color = col.key; }); changed(); rerender(); });
          return h("div", { class: "color-row" }, h("div", { class: "swatch-prev" }, col.img ? thumb(col.img) : h("span", {})), sel,
            h("button", { class: "btn ghost sm", type: "button", onClick: async () => {
              const { pickMedia } = await import("./media.js"); const r = await pickMedia({ kinds: ["image"] }); if (r && r[0]) { col.img = r[0].url; draw(); changed(); }
            } }, icon("image", 14), "Түс суреті"),
            h("button", { class: "icon-btn danger", type: "button", title: "Алып тастау", onClick: () => { x.colors.splice(ci, 1); x.slides.forEach((s) => { if (s.color === col.key) s.color = null; }); changed(); rerender(); } }, icon("trash", 16)));
        }),
        h("button", { class: "btn ghost sm", type: "button", disabled: x.colors.length >= c.colors.length, onClick: () => {
          const free = c.colors.find((k) => !x.colors.some((cc) => cc.key === k.key));
          if (free) { x.colors.push({ key: free.key, img: (x.slides.find((s) => s.type === "image") || {}).src || "" }); changed(); rerender(); }
        } }, icon("plus", 14), "Түс қосу"));
    };
    draw();
    return wrap;
  };

  const rows = list.map((x, i) => itemShell({
    id: kind + x.id, title: first(x.title), meta: `${x.slides.length} слайд`, dflt: list.length === 1,
    onUp: i > 0 ? () => { moveInArray(list, i, -1); changed(); rerender(); } : null,
    onDown: i < list.length - 1 ? () => { moveInArray(list, i, 1); changed(); rerender(); } : null,
    onDelete: () => del(i),
    body: h("div", {},
      tField(x.title, { label: "Атауы" }), tField(x.desc, { label: "Сипаттамасы", long: true }),
      isCat ? tField(x.price, { label: "Бағасы", hint: "Мысалы: «12 000 – 15 000 ₸». Бос қалдырсаңыз, баға көрінбейді." })
        : h("div", {}, toggle(x.hasPrice, (v) => { x.hasPrice = v; rerender(); }, "Бағасын көрсету", "Өшірулі болса, «Баға — тапсырыс бойынша» жазуы шығады."), x.hasPrice ? tField(x.price, { label: "Бағасы" }) : null),
      isCat ? h("div", { class: "sub" }, h("h3", {}, "Түстер"), h("p", { class: "card-hint" }, "Клиент түс түймесін басқанда карусель сол түстің суретіне ауысады. Түстердің атауы «Түстер» бетінде."), colorsEditor(x),
        toggle(x.showOtherColors, (v) => { x.showOtherColors = v; }, "«Басқа түстер тапсырыс бойынша» жазуын көрсету")) : null,
      h("div", { class: "sub" }, h("h3", {}, "Фото және бейнелер"), h("p", { class: "card-hint" }, "Сүйреп ретін өзгертіңіз. Бірінші слайд карточканың мұқабасы болады."),
        slidesEditor(x.slides, { colors: isCat ? x.colors : null })))
  }));
  return h("div", {},
    pageHead(isCat ? "Өнім карточкалары" : "Жеке тапсырыс карточкалары", isCat ? "Ассортимент бөліміндегі карточкалар: атауы, бағасы, түстері, фото мен бейне." : "«Жеке арнайы тапсырыс» бөліміндегі карточкалар.",
      h("button", { class: "btn primary", onClick: add }, icon("plus", 16), "Карточка қосу")),
    langBar(), rows.length ? h("div", { class: "items" }, rows) : h("p", { class: "empty" }, "Карточка жоқ. «Карточка қосу» батырмасын басыңыз."));
}
export const categories = () => cardsPage("categories");
export const custom = () => cardsPage("customOrders");

/* ---------------- gallery & hero ---------------- */
export function gallery() {
  const c = S.draft;
  const heroTmp = c.hero.slides.map((src) => ({ type: "image", src }));
  return h("div", {},
    pageHead("Галерея және слайдтар", "Басты экрандағы фон суреттері мен галерея карусельі."),
    card("Басты экран — фон суреттері", "Бет ашылғанда ауысып тұратын үлкен фото. Көлденең, жарық сапасы жақсы суреттерді таңдаңыз.",
      slidesEditor(heroTmp, { kinds: ["image"], onChange: (arr) => { c.hero.slides = arr.map((s) => s.src); } })),
    card("Галерея", "«Видео және фото галерея» бөліміндегі сырғитын лента.", slidesEditor(c.gallery)));
}

/* ---------------- about features + marquee ---------------- */
export function about() {
  const c = S.draft;
  const iconPicker = (f) => {
    const wrap = h("div", { class: "icon-picker", role: "radiogroup", "aria-label": "Белгіше" });
    const draw = () => wrap.replaceChildren(...Object.keys(FEATURE_ICONS).map((k) => {
      const b = h("button", { class: "ic-opt" + (f.icon === k ? " on" : ""), type: "button", role: "radio", "aria-checked": String(f.icon === k), title: k, onClick: () => { f.icon = k; draw(); changed(); } });
      const svg = icon("star", 20); svg.innerHTML = FEATURE_ICONS[k]; b.append(svg); return b;
    }));
    draw(); return wrap;
  };
  const features = c.aboutFeatures.map((f, i) => itemShell({
    id: "f" + f.id, title: first(f.title), onUp: i > 0 ? () => { moveInArray(c.aboutFeatures, i, -1); changed(); rerender(); } : null,
    onDown: i < c.aboutFeatures.length - 1 ? () => { moveInArray(c.aboutFeatures, i, 1); changed(); rerender(); } : null,
    onDelete: async () => { if (await confirmDialog("Жою", "Бұл ерекшелік карточкасы жойылады.", "Жою", "danger")) { c.aboutFeatures.splice(i, 1); changed(); rerender(); } },
    body: h("div", {}, h("div", { class: "fld" }, h("span", {}, "Белгіше"), iconPicker(f)), tField(f.title, { label: "Атауы" }), tField(f.text, { label: "Мәтіні", long: true })),
  }));
  const marquee = c.marquee.map((m, i) => h("div", { class: "marq-row" }, tField(m.text, { label: `Жазу #${i + 1}` }),
    h("div", { class: "marq-actions" },
      h("button", { class: "icon-btn", type: "button", disabled: i === 0, onClick: () => { moveInArray(c.marquee, i, -1); changed(); rerender(); } }, icon("up", 16)),
      h("button", { class: "icon-btn", type: "button", disabled: i === c.marquee.length - 1, onClick: () => { moveInArray(c.marquee, i, 1); changed(); rerender(); } }, icon("down", 16)),
      h("button", { class: "icon-btn danger", type: "button", onClick: () => { c.marquee.splice(i, 1); changed(); rerender(); } }, icon("trash", 16)))));
  return h("div", {},
    pageHead("Шеберхана блогы", "Ерекшелік карточкалары және hero астындағы жүгіртпе жол."),
    langBar(),
    card("Шеберхана ерекшеліктері", "«Шеберхана» бөлімінің оң жағындағы карточкалар.",
      h("div", { class: "items" }, features), h("button", { class: "btn ghost", onClick: () => { const f = { id: uid("f_"), icon: "star", title: newMap(), text: newMap() }; c.aboutFeatures.push(f); S.open.add("f" + f.id); changed(); rerender(); } }, icon("plus", 16), "Ерекшелік қосу")),
    card("Жүгіртпе жол", "Басты экраннан кейін үздіксіз жүгіріп тұратын қысқа жазулар.",
      h("div", { class: "marq-list" }, marquee), h("button", { class: "btn ghost", onClick: () => { c.marquee.push({ id: uid("m_"), text: newMap() }); changed(); rerender(); } }, icon("plus", 16), "Жазу қосу")));
}

/* ---------------- reviews ---------------- */
export function reviews() {
  const c = S.draft;
  const rows = c.testimonials.map((r, i) => {
    const typeSel = h("select", { "aria-label": "Түрі" }, REVIEW_TYPES.map(([v, l]) => h("option", { value: v }, l)));
    typeSel.value = r.type;
    typeSel.addEventListener("change", () => { r.type = typeSel.value; changed(); rerender(); });
    return itemShell({
      id: "r" + r.id, title: first(r.name), meta: (REVIEW_TYPES.find((t) => t[0] === r.type) || [])[1],
      onUp: i > 0 ? () => { moveInArray(c.testimonials, i, -1); changed(); rerender(); } : null,
      onDown: i < c.testimonials.length - 1 ? () => { moveInArray(c.testimonials, i, 1); changed(); rerender(); } : null,
      onDelete: async () => { if (await confirmDialog("Пікірді жою", "Бұл пікір сайттан жойылады.", "Жою", "danger")) { c.testimonials.splice(i, 1); changed(); rerender(); } },
      body: h("div", {},
        h("label", { class: "fld" }, h("span", {}, "Пікір түрі"), typeSel),
        r.type !== "text" ? mediaSlot(() => r.media, (v) => { r.media = v; }, { label: r.type === "video" ? "Бейне-пікір файлы" : "Аудио-пікір файлы", kinds: [r.type], hint: "Файл қоссаңыз, сайтта ойнатқыш көрінеді. Қоспасаңыз — тек мәтін." }) : null,
        tField(r.name, { label: "Клиент аты" }), tField(r.role, { label: "Қаласы / рөлі" }), tField(r.text, { label: "Пікір мәтіні", long: true })),
    });
  });
  return h("div", {},
    pageHead("Пікірлер", "Клиенттердің жазбаша, видео және аудио пікірлері.", h("button", { class: "btn primary", onClick: () => { const r = { id: uid("r_"), type: "text", media: "", name: newMap(), role: newMap(), text: newMap() }; c.testimonials.push(r); S.open.add("r" + r.id); changed(); rerender(); } }, icon("plus", 16), "Пікір қосу")),
    langBar(), h("div", { class: "items" }, rows));
}

/* ---------------- colors ---------------- */
function promptKey() {
  return new Promise((resolve) => {
    const input = h("input", { type: "text", placeholder: "мысалы: burgundy", autocomplete: "off" });
    modal({
      title: "Жаңа түс", body: h("div", {}, h("p", { class: "muted-p" }, "Қысқа ағылшын атау (әріп, сан). Көрінетін атауын кейін барлық тілде жазасыз."), h("label", { class: "fld" }, h("span", {}, "Түс коды"), input)),
      onClose: (v) => resolve(v === true ? slug(input.value) : null),
      actions: [{ label: "Бас тарту", value: false }, { label: "Қосу", kind: "primary", value: true }],
    });
    setTimeout(() => input.focus(), 50);
  });
}

export function colors() {
  const c = S.draft;
  const rows = c.colors.map((k, i) => itemShell({
    id: "k" + k.key, title: first(k.name) || k.key, meta: k.key, dflt: true,
    onUp: i > 0 ? () => { moveInArray(c.colors, i, -1); changed(); rerender(); } : null,
    onDown: i < c.colors.length - 1 ? () => { moveInArray(c.colors, i, 1); changed(); rerender(); } : null,
    onDelete: async () => {
      if (!(await confirmDialog("Түсті жою", "Түс барлық карточкалардан да алынады, ал сол түске белгіленген слайдтар түссіз болып қалады.", "Жою", "danger"))) return;
      c.colors.splice(i, 1);
      c.categories.forEach((x) => { x.colors = x.colors.filter((cc) => cc.key !== k.key); x.slides.forEach((s) => { if (s.color === k.key) s.color = null; }); });
      changed(); rerender();
    },
    body: tField(k.name, { label: "Түстің атауы" }),
  }));
  return h("div", {},
    pageHead("Түстер", "Карточкалардағы түс түймелерінің атаулары (меңзегенде көрінеді).", h("button", { class: "btn primary", onClick: async () => {
      const key = await promptKey();
      if (!key) return;
      if (c.colors.some((k) => k.key === key)) { toast("Мұндай түс коды бар", "err"); return; }
      c.colors.push({ key, name: newMap() }); S.open.add("k" + key); changed(); rerender();
    } }, icon("plus", 16), "Түс қосу")),
    langBar(), h("div", { class: "items" }, rows));
}

/* ---------------- settings ---------------- */
export function settings() {
  const s = S.draft.settings;
  s.banner = s.banner || { enabled: false, link: "" };
  s.hiddenSections = s.hiddenSections || [];
  const waPreview = h("a", { class: "link-prev", target: "_blank", rel: "noopener" });
  const updWa = () => { const d = String(s.whatsapp || "").replace(/\D/g, ""); waPreview.textContent = d ? "wa.me/" + d : ""; waPreview.href = d ? "https://wa.me/" + d : "#"; };
  updWa();
  const waField = field(s, "whatsapp", { label: "WhatsApp нөмірі", hint: "Тек сандар, ел кодымен: 77089859284", mono: true, after: (v) => { const d = v.replace(/\D/g, ""); queueMicrotask(updWa); return d; } });
  waField.querySelector("input").addEventListener("input", updWa);
  return h("div", {},
    pageHead("Баптаулар", "Байланыс деректері, сілтемелер, логотип және бөлімдердің көрінуі."),
    card("Байланыс", "", h("div", { class: "grid2" },
      field(s, "phoneDisplay", { label: "Телефон (сайтта көрінетін түрі)", placeholder: "+7 708 985 9284" }),
      field(s, "phone", { label: "Телефон (қоңырау шалу үшін)", placeholder: "+77089859284", mono: true, after: (v) => v.replace(/[^\d+]/g, "") }),
      h("div", {}, waField, waPreview),
      field(s, "email", { label: "Электронды пошта", type: "email" }))),
    card("Сілтемелер", "Бос қалдырылған әлеуметтік желі түймесі сайттан жасырылады.", h("div", { class: "grid2" },
      field(s, "instagram", { label: "Instagram", placeholder: "https://www.instagram.com/…", mono: true }),
      field(s, "youtube", { label: "YouTube арнасы", placeholder: "https://www.youtube.com/@…", mono: true }),
      field(s, "videoGuide", { label: "Бейне-нұсқаулық сілтемесі", hint: "«Аяқ өлшемін алу» бөліміндегі батырма", mono: true }),
      field(s, "gis", { label: "2GIS сілтемесі", mono: true }))),
    card("Суреттер", "", h("div", { class: "mslots" },
      mediaSlot(() => s.logo, (v) => { s.logo = v; }, { label: "Логотип", hint: "Мәзірде, төменгі бөлікте және қойындыда. Мөлдір PNG жақсы." }),
      mediaSlot(() => s.wechatQr, (v) => { s.wechatQr = v; }, { label: "WeChat QR-коды", hint: "Бос болса, төменгі бөліктен жасырылады." }),
      mediaSlot(() => s.sizingLeg, (v) => { s.sizingLeg = v; }, { label: "Өлшем нұсқаулығы: балтыр" }),
      mediaSlot(() => s.sizingFoot, (v) => { s.sizingFoot = v; }, { label: "Өлшем нұсқаулығы: табан" }))),
    card("Бөлімдердің көрінуі", "Өшірілген бөлім мен оның мәзірдегі сілтемесі сайттан жасырылады (деректер сақталады).",
      h("div", { class: "switches" }, SECTIONS.map(([id, label]) => toggle(!s.hiddenSections.includes(id), (on) => {
        s.hiddenSections = s.hiddenSections.filter((x) => x !== id); if (!on) s.hiddenSections.push(id);
      }, label)))),
    card("Ақпарат жолағы", "Бет басындағы жіңішке хабарландыру: мерекелік жеңілдік, демалыс күндері, жаңа коллекция.",
      toggle(s.banner.enabled, (v) => { s.banner.enabled = v; }, "Жолақты сайтта көрсету"),
      field(s.banner, "link", { label: "Басқанда ашылатын сілтеме (міндетті емес)", placeholder: "https://…", mono: true }),
      langBar(), tField(S.draft.texts["banner.text"], { label: "Жолақтағы мәтін" })));
}

/* ---------------- languages ---------------- */
export function languages() {
  const c = S.draft;
  const fields = collectFields(c, textLabel).filter((f) => (f.map[c.defaultLang] || "").trim());
  const defName = c.languages.find((l) => l.code === c.defaultLang).name;

  const rows = c.languages.map((l, i) => {
    const isDef = l.code === c.defaultLang;
    const miss = isDef ? 0 : missingCount(fields, l.code);
    const name = h("input", { type: "text", value: l.name, "aria-label": "Тіл атауы", dir: l.dir });
    name.addEventListener("input", () => { l.name = name.value; changed(); });
    const dirSel = h("select", { "aria-label": "Жазу бағыты" }, h("option", { value: "ltr" }, "Солдан оңға"), h("option", { value: "rtl" }, "Оңнан солға (араб)"));
    dirSel.value = l.dir || "ltr";
    dirSel.addEventListener("change", () => { l.dir = dirSel.value; changed(); rerender(); });
    return h("div", { class: "lang-row" + (l.enabled === false ? " off" : "") },
      h("span", { class: "lc big" + (isDef ? " def" : "") }, l.code),
      h("div", { class: "lang-main" }, name, h("small", {}, isDef ? "Негізгі тіл — аудармалар осыдан алынады" : miss ? `${miss} мәтіннің аудармасы жоқ` : "Аударма толық")),
      dirSel,
      toggle(l.enabled !== false, (v) => { l.enabled = v; if (!v && isDef) l.enabled = true; rerender(); }, "Сайтта көрсету"),
      h("div", { class: "lang-actions" },
        miss ? h("button", { class: "btn ghost sm", onClick: () => runTranslate(fields, [l.code]) }, icon("wand", 14), "Автоаударма") : null,
        h("button", { class: "icon-btn", type: "button", disabled: i === 0, title: "Жоғары", onClick: () => { moveInArray(c.languages, i, -1); changed(); rerender(); } }, icon("up", 16)),
        h("button", { class: "icon-btn", type: "button", disabled: i === c.languages.length - 1, title: "Төмен", onClick: () => { moveInArray(c.languages, i, 1); changed(); rerender(); } }, icon("down", 16)),
        isDef ? null : h("button", { class: "icon-btn", type: "button", title: "Негізгі тіл ету", onClick: async () => {
          if (await confirmDialog("Негізгі тілді ауыстыру", `«${l.name}» негізгі тіл болады: бос аудармалар осы тілден алынады, ал автоаударма осы тілдің мәтінінен жасалады.`, "Ауыстыру")) { c.defaultLang = l.code; l.enabled = true; changed(); rerender(); }
        } }, icon("award", 16)),
        isDef ? null : h("button", { class: "icon-btn danger", type: "button", title: "Тілді жою", onClick: async () => {
          if (!(await confirmDialog("Тілді жою", `«${l.name}» тілі және оның барлық аудармалары жойылады. Қайтару үшін «Тарих» бетін қолдануға болады.`, "Жою", "danger"))) return;
          const strip = (m) => { if (m) delete m[l.code]; };
          collectFields(c).forEach((f) => strip(f.map));
          c.languages.splice(i, 1); if (S.focusLang === l.code) S.focusLang = "all"; changed(); rerender();
        } }, icon("trash", 16)),
      ));
  });

  const presetSel = h("select", { "aria-label": "Дайын тіл" }, h("option", { value: "" }, "Тізімнен таңдау…"),
    LANG_PRESETS.filter((p) => !c.languages.some((l) => l.code === p.code)).map((p) => h("option", { value: p.code }, `${p.name} (${p.code})`)));
  const code = h("input", { type: "text", placeholder: "код: de", maxlength: 8, "aria-label": "Тіл коды" });
  const name = h("input", { type: "text", placeholder: "атауы: Deutsch", "aria-label": "Тіл атауы" });
  const dir = h("select", { "aria-label": "Бағыты" }, h("option", { value: "ltr" }, "Солдан оңға"), h("option", { value: "rtl" }, "Оңнан солға"));
  presetSel.addEventListener("change", () => { const p = LANG_PRESETS.find((x) => x.code === presetSel.value); if (p) { code.value = p.code; name.value = p.name; dir.value = p.dir; } });
  const addLang = async (withTranslate) => {
    const cd = code.value.trim().toLowerCase();
    if (!/^[a-z]{2,3}(-[a-z0-9]{2,8})?$/.test(cd)) { toast("Тіл коды дұрыс емес (мысалы: de, fr, zh-tw)", "err"); return; }
    if (c.languages.some((l) => l.code === cd)) { toast("Бұл тіл тізімде бар", "err"); return; }
    if (!name.value.trim()) { toast("Тілдің өз атауын жазыңыз", "err"); return; }
    c.languages.push({ code: cd, name: name.value.trim(), dir: dir.value, enabled: true });
    changed(); rerender();
    if (withTranslate) await runTranslate(collectFields(c, textLabel), [cd]);
  };

  return h("div", {},
    pageHead("Тілдер", `Сайт қазір ${c.languages.filter((l) => l.enabled !== false).length} тілде. Негізгі тіл — ${defName}.`,
      h("button", { class: "btn ghost", onClick: () => { const all = c.languages.filter((l) => l.code !== c.defaultLang).map((l) => l.code); runTranslate(fields, all); } }, icon("wand", 16), "Барлық бос аудармаларды толтыру")),
    card("Сайттағы тілдер", "Өшірілген тіл тіл таңдау тізімінде көрінбейді, бірақ аудармалары сақталады.", h("div", { class: "lang-list" }, rows)),
    card("Жаңа тіл қосу", "Тілді қосқан соң автоаударма барлық мәтінді негізгі тілден аударады — кейін өзіңіз түзете аласыз.",
      h("div", { class: "grid3" }, h("label", { class: "fld" }, h("span", {}, "Дайын тізім"), presetSel), h("label", { class: "fld" }, h("span", {}, "Код"), code), h("label", { class: "fld" }, h("span", {}, "Тілдің өз атауы"), name), h("label", { class: "fld" }, h("span", {}, "Жазу бағыты"), dir)),
      h("div", { class: "row" }, h("button", { class: "btn primary", onClick: () => addLang(true) }, icon("plus", 16), "Қосу және автоаудару"), h("button", { class: "btn ghost", onClick: () => addLang(false) }, "Тек қосу (аударма кейін)"))));
}

/* ---------------- media library ---------------- */
function usedUrls() {
  const used = new Set();
  JSON.stringify(S.draft, (_, v) => { if (typeof v === "string" && /^https?:\/\//.test(v)) used.add(v); return v; });
  return used;
}

export function mediaPage() {
  const box = h("div", { class: "mgrid big" });
  const total = h("span", { class: "muted-p" });
  const input = h("input", { type: "file", multiple: true, hidden: true, accept: "image/*,video/*,audio/*" });
  const load = async () => {
    box.replaceChildren(h("p", { class: "empty" }, "Жүктелуде…"));
    try {
      const items = await loadUploaded();
      const used = usedUrls();
      total.textContent = `${items.length} файл · ${fmtBytes(items.reduce((a, b) => a + b.size, 0))}`;
      box.replaceChildren(...(items.length ? items.map((m) => {
        const t = tile(m, false, () => {});
        const inUse = used.has(m.url);
        t.append(h("span", { class: "muse " + (inUse ? "on" : "") }, inUse ? "қолданыста" : "қолданылмайды"));
        const wrap = h("div", { class: "mwrap" }, t, h("div", { class: "mwrap-actions" }, h("span", { class: "msize" }, fmtBytes(m.size)),
          h("button", { class: "icon-btn", type: "button", title: "Сілтемені көшіру", onClick: async () => { await navigator.clipboard.writeText(m.url); toast("Сілтеме көшірілді"); } }, icon("copy", 15)),
          h("button", { class: "icon-btn danger", type: "button", title: "Жою", onClick: async () => {
            if (!(await confirmDialog("Файлды жою", inUse ? "Бұл файл қазір сайтта қолданылады! Жойсаңыз, сурет жоғалады." : "Файл қоймадан біржола жойылады.", "Жою", "danger"))) return;
            try { await api("admin/media", { method: "DELETE", body: { url: m.url } }); invalidateMedia(); load(); } catch (e) { toast("Жойылмады: " + e.message, "err"); }
          } }, icon("trash", 15))));
        return wrap;
      }) : [h("p", { class: "empty" }, "Әзірге жүктелген файл жоқ.")]));
    } catch (e) { box.replaceChildren(h("p", { class: "empty" }, "Қате: " + e.message)); }
  };
  input.addEventListener("change", async () => { await uploadFiles([...input.files]); input.value = ""; invalidateMedia(); load(); });
  load();
  return h("div", {}, pageHead("Медиа кітапхана", "Админ панель арқылы жүктелген барлық фото мен бейне.", h("button", { class: "btn primary", onClick: () => input.click() }, icon("upload", 16), "Файл жүктеу")),
    input, card("", "", total, box));
}

/* ---------------- history & backup ---------------- */
export function history() {
  const list = h("div", { class: "hist" }, h("p", { class: "empty" }, "Жүктелуде…"));
  const file = h("input", { type: "file", accept: "application/json,.json", hidden: true });
  file.addEventListener("change", async () => {
    try {
      const data = JSON.parse(await file.files[0].text());
      if (data.schema !== 2 || !data.texts) throw new Error("Бұл GUMYR резервтік файлы емес");
      if (!(await confirmDialog("Файлдан қалпына келтіру", "Қазіргі жоба осы файлдағы мазмұнмен ауыстырылады (жарияламайынша сайт өзгермейді).", "Қалпына келтіру"))) return;
      replaceDraft(data);
    } catch (e) { toast("Файл оқылмады: " + e.message, "err"); }
    file.value = "";
  });
  (async () => {
    try {
      const versions = await api("admin/history");
      list.replaceChildren(...(versions.length ? versions.map((v, i) => h("div", { class: "hist-row" + (i === 0 ? " now" : "") },
        icon("clock", 18), h("div", {}, h("b", {}, fmtDate(versionDate(v.id))), h("small", {}, `${fmtBytes(v.size)}${i === 0 ? " · қазіргі жарияланған нұсқа" : ""}`)),
        h("div", { class: "hist-actions" },
          h("button", { class: "btn ghost sm", onClick: async () => {
            if (!(await confirmDialog("Нұсқаны қалпына келтіру", "Осы нұсқа жобаға жүктеледі. Сайт жарияламайынша өзгермейді, сондықтан алдымен қарап шығуға болады.", "Жүктеу"))) return;
            try { replaceDraft(await api("admin/history?id=" + v.id)); } catch (e) { toast("Жүктелмеді: " + e.message, "err"); }
          } }, icon("refresh", 14), "Жобаға жүктеу"),
          h("a", { class: "btn ghost sm", href: v.url, download: `gumyr-${v.id}.json`, target: "_blank", rel: "noopener" }, icon("download", 14), "JSON"))))
        : [h("p", { class: "empty" }, "Әзірге жарияланған нұсқа жоқ.")]));
    } catch (e) { list.replaceChildren(h("p", { class: "empty" }, "Қате: " + e.message)); }
  })();
  return h("div", {},
    pageHead("Тарих және резервтік көшірме", "Әр жариялау жеке нұсқа болып сақталады (соңғы 40). Қателессеңіз, ескі нұсқаны қайтара аласыз."),
    card("Жарияланған нұсқалар", "", list),
    card("Резервтік көшірме", "Қазіргі жобаны компьютерге сақтап қойыңыз немесе бұрын сақталған файлдан қайтарыңыз.",
      h("div", { class: "row" }, h("button", { class: "btn ghost", onClick: () => {
        const a = h("a", { href: URL.createObjectURL(new Blob([JSON.stringify(S.draft, null, 1)], { type: "application/json" })), download: `gumyr-backup-${new Date().toISOString().slice(0, 10)}.json` });
        document.body.append(a); a.click(); a.remove();
      } }, icon("download", 16), "Жобаны жүктеп алу (JSON)"), h("button", { class: "btn ghost", onClick: () => file.click() }, icon("upload", 16), "Файлдан қалпына келтіру"), file)));
}

function replaceDraft(content) {
  const keep = S.baseVersion;
  S.draft = clone(content);
  S.draft.schema = 2;
  S.baseVersion = keep;
  changed();
  navigate("overview");
  toast("Жоба жаңартылды. Сайтқа шығару үшін «Жариялау» батырмасын басыңыз.");
}

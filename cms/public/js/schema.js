/* What the admin knows about the site: text labels, icons, sections, languages. */

/** Every static text on the page, grouped the way the visitor scrolls through the site. */
export const TEXT_GROUPS = [
  { id: "seo", title: "Браузер және іздеу жүйесі", hint: "Қойынды атауы мен Google-да көрінетін сипаттама.", items: [
    ["meta.title", "Сайт атауы (қойынды тақырыбы)"], ["meta.desc", "Сайт сипаттамасы", "long"] ] },
  { id: "banner", title: "Ақпарат жолағы", hint: "Бет басындағы жіңішке жолақ (мерекелік жеңілдік, жабық күндер). Қосу/өшіру — «Баптаулар» бетінде.", items: [
    ["banner.text", "Жолақтағы мәтін"] ] },
  { id: "nav", title: "Жоғарғы мәзір", items: [
    ["nav.home", "Басты бет"], ["nav.catalog", "Ассортимент"], ["nav.workshop", "Шеберхана"], ["nav.gallery", "Галерея"],
    ["nav.reviews", "Пікірлер"], ["nav.contact", "Байланыс"], ["nav.order", "«Тапсырыс беру» батырмасы"] ] },
  { id: "hero", title: "Басты экран", items: [
    ["hero.eyebrow", "Үстіңгі шағын жазу"], ["hero.title1", "Тақырып — 1-жол"], ["hero.title2", "Тақырып — 2-жол (алтын түсті)"],
    ["hero.subtitle", "Қысқаша сипаттама", "long"], ["hero.cta1", "1-батырма"], ["hero.cta2", "2-батырма (WhatsApp)"],
    ["hero.stat1v", "1-көрсеткіш: сан"], ["hero.stat1l", "1-көрсеткіш: атауы"], ["hero.stat2v", "2-көрсеткіш: сан"], ["hero.stat2l", "2-көрсеткіш: атауы"],
    ["hero.stat3v", "3-көрсеткіш: сан"], ["hero.stat3l", "3-көрсеткіш: атауы"], ["hero.scroll", "«Төмен түсіңіз» жазуы"] ] },
  { id: "categories", title: "Ассортимент бөлімі", hint: "Бөлім тақырыбы. Карточкалардың өзі «Өнім карточкалары» бетінде.", items: [
    ["categories.eyebrow", "Үстіңгі шағын жазу"], ["categories.title", "Тақырып"], ["categories.subtitle", "Сипаттама", "long"],
    ["categories.colors_label", "«Түсін таңдаңыз» жазуы"], ["categories.other_colors", "«Басқа түстер…» жазуы"], ["colors.other_list", "Басқа түстер тізімі"],
    ["categories.cta", "Карточкадағы WhatsApp батырмасы"], ["categories.swipe_hint", "Сырғыту нұсқауы (мобильді)"], ["categories.from", "«бастап» сөзі"] ] },
  { id: "custom", title: "Жеке тапсырыс бөлімі", items: [
    ["custom.eyebrow", "Үстіңгі шағын жазу"], ["custom.title", "Тақырып"], ["custom.subtitle", "Сипаттама", "long"], ["custom.price_note", "Бағасы жоқ карточкадағы жазу"] ] },
  { id: "sizing", title: "Аяқ өлшемін алу", items: [
    ["sizing.eyebrow", "Үстіңгі шағын жазу"], ["sizing.title", "Тақырып"], ["sizing.subtitle", "Сипаттама", "long"],
    ["sizing.card1_title", "1-карточка: тақырып"], ["sizing.card1_text", "1-карточка: мәтін", "long"],
    ["sizing.card2_title", "2-карточка: тақырып"], ["sizing.card2_text", "2-карточка: мәтін", "long"],
    ["sizing.video_title", "Бейне-нұсқаулық: тақырып"], ["sizing.video_desc", "Бейне-нұсқаулық: сипаттама", "long"], ["sizing.video_cta", "Бейне-нұсқаулық: батырма"],
    ["sizing.cta", "Өлшемдерді жіберу батырмасы"] ] },
  { id: "about", title: "Шеберхана бөлімі", hint: "Оң жақтағы ерекшелік карточкалары — «Шеберхана блогы» бетінде.", items: [
    ["about.eyebrow", "Үстіңгі шағын жазу"], ["about.title", "Тақырып"], ["about.p1", "1-абзац", "long"], ["about.p2", "2-абзац", "long"] ] },
  { id: "gallery", title: "Галерея бөлімі", items: [
    ["gallery_media.title", "Үстіңгі шағын жазу"], ["gallery.title", "Тақырып"], ["gallery.subtitle", "Сипаттама", "long"] ] },
  { id: "reviews", title: "Пікірлер бөлімі", items: [
    ["reviews.eyebrow", "Үстіңгі шағын жазу"], ["reviews.title", "Тақырып"], ["reviews.tab_video", "«Видео» қойындысы"], ["reviews.tab_text", "«Жазбаша» қойындысы"],
    ["reviews.tab_audio", "«Аудио» қойындысы"], ["reviews.play", "«Ойнату» жазуы"], ["reviews.swipe_hint", "Сырғыту нұсқауы (мобильді)"],
    ["reviews.gis_title", "2GIS карточкасы: тақырып"], ["reviews.gis_desc", "2GIS карточкасы: сипаттама", "long"], ["reviews.gis_cta", "2GIS батырмасы"] ] },
  { id: "contact", title: "Байланыс бөлімі", hint: "Телефон, пошта және сілтемелер — «Баптаулар» бетінде.", items: [
    ["contact.eyebrow", "Үстіңгі шағын жазу"], ["contact.title", "Тақырып"], ["contact.address_label", "«Мекенжай» белгісі"], ["contact.address_value", "Мекенжай"],
    ["contact.phone_label", "«Телефон» белгісі"], ["contact.whatsapp_label", "«WhatsApp» белгісі"], ["contact.email_label", "«Пошта» белгісі"],
    ["contact.hours_label", "«Жұмыс уақыты» белгісі"], ["contact.hours_value", "Жұмыс уақыты"],
    ["contact.form_title", "Форма тақырыбы"], ["contact.form_name", "Форма: «Атыңыз»"], ["contact.form_phone", "Форма: «Телефон нөмірі»"],
    ["contact.form_size", "Форма: «Аяқ өлшемі»"], ["contact.form_color", "Форма: «Қалаған түсі»"], ["contact.form_comment", "Форма: «Пікір»"], ["contact.form_submit", "Форма батырмасы"] ] },
  { id: "footer", title: "Төменгі колонтитул және басқа жазулар", items: [
    ["footer.company", "Компания атауы"], ["footer.bin", "БИН"], ["footer.rights", "«Барлық құқықтар қорғалған»"], ["footer.admin", "Төменгі «Кіру» сілтемесі (басқару панеліне)"], ["footer.tagline", "Қысқа ұран"],
    ["misc.menu_open", "Мәзір (мобильді)"], ["misc.menu_close", "Жабу"], ["misc.language", "«Тіл» тақырыбы"], ["misc.whatsapp_bubble", "Жүзбелі WhatsApp жазуы"], ["misc.back_to_top", "Жоғары"] ] },
  { id: "wa", title: "WhatsApp хабарламалары", hint: "Батырманы басқанда клиенттің WhatsApp-ында дайын жазылатын мәтін. {title} — карточка атауы автоматты қойылады.", items: [
    ["wa.greeting", "Жалпы сәлемдесу", "long"], ["wa.product", "Карточка бойынша сұрау ({title} қалдырыңыз)", "long"], ["wa.sizing", "Өлшемдерді жіберу", "long"] ] },
];

export const SECTIONS = [
  ["categories", "Ассортимент (өнім карточкалары)"], ["custom-orders", "Жеке тапсырыс"], ["size-guide", "Аяқ өлшемін алу"],
  ["about", "Шеберхана"], ["gallery-media", "Галерея"], ["reviews", "Пікірлер"], ["contact", "Байланыс"],
];

export const FEATURE_ICONS = {
  star: '<path d="M12 2l3 6 6 .9-4.5 4.3 1 6-5.5-3-5.5 3 1-6L3 8.9 9 8z"/>',
  heart: '<path d="M12 21s-7-4.5-9.5-9C.5 8 3 3.5 7 3.5c2 0 3.8 1.2 5 3 1.2-1.8 3-3 5-3 4 0 6.5 4.5 4.5 8.5-2.5 4.5-9.5 9-9.5 9z"/>',
  ornament: '<path d="M4 12c2-4 6-6 8-6s6 2 8 6c-2 4-6 6-8 6s-6-2-8-6z"/><circle cx="12" cy="12" r="2.4"/>',
  bolt: '<path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z"/>',
  mask: '<path d="M5 8c0-3 3-5 7-5s7 2 7 5v3c0 4-3 8-7 8s-7-4-7-8V8z"/><circle cx="9.5" cy="10.5" r="1" fill="currentColor" stroke="none"/><circle cx="14.5" cy="10.5" r="1" fill="currentColor" stroke="none"/><path d="M9 15c1.2 1 4.8 1 6 0"/>',
  truck: '<path d="M1 6h13v10H1zM14 10h4l3 3v3h-7z"/><circle cx="6" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
  award: '<circle cx="12" cy="9" r="6"/><path d="M8.5 14 7 22l5-3 5 3-1.5-8"/>',
  scissors: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M8.6 7.6 20 19M8.6 16.4 20 5"/>',
  gift: '<rect x="3" y="8" width="18" height="4"/><path d="M12 8v13M5 12v9h14v-9M12 8c-2-4-6-3-5 0M12 8c2-4 6-3 5 0"/>',
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1L8 9.7a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.7 2z"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
};

export const LANG_PRESETS = [
  { code: "kk", name: "Қазақша", dir: "ltr" }, { code: "ru", name: "Русский", dir: "ltr" }, { code: "en", name: "English", dir: "ltr" },
  { code: "uz", name: "O'zbekcha", dir: "ltr" }, { code: "ky", name: "Кыргызча", dir: "ltr" }, { code: "tr", name: "Türkçe", dir: "ltr" },
  { code: "ar", name: "العربية", dir: "rtl" }, { code: "zh", name: "中文", dir: "ltr" }, { code: "de", name: "Deutsch", dir: "ltr" },
  { code: "fr", name: "Français", dir: "ltr" }, { code: "es", name: "Español", dir: "ltr" }, { code: "it", name: "Italiano", dir: "ltr" },
  { code: "ko", name: "한국어", dir: "ltr" }, { code: "ja", name: "日本語", dir: "ltr" }, { code: "fa", name: "فارسی", dir: "rtl" },
  { code: "az", name: "Azərbaycanca", dir: "ltr" }, { code: "tg", name: "Тоҷикӣ", dir: "ltr" }, { code: "tk", name: "Türkmençe", dir: "ltr" },
  { code: "mn", name: "Монгол", dir: "ltr" }, { code: "pl", name: "Polski", dir: "ltr" },
];

export const REVIEW_TYPES = [["text", "Жазбаша"], ["video", "Видео"], ["audio", "Аудио"]];

/** Every translatable map in the content, with a human label (used by auto-translate and coverage). */
export function collectFields(c, labelOf = (k) => k) {
  const out = [];
  const add = (map, label, page) => { if (map) out.push({ map, label, page }); };
  for (const k of Object.keys(c.texts)) add(c.texts[k], labelOf(k), "texts");
  c.marquee.forEach((x, i) => add(x.text, "Жүгіртпе жол #" + (i + 1), "about"));
  c.colors.forEach((x) => add(x.name, "Түс: " + x.key, "colors"));
  c.categories.forEach((x) => { add(x.title, "Өнім атауы", "categories"); add(x.desc, "Өнім сипаттамасы", "categories"); add(x.price, "Өнім бағасы", "categories"); });
  c.customOrders.forEach((x) => { add(x.title, "Жеке тапсырыс атауы", "custom"); add(x.desc, "Жеке тапсырыс сипаттамасы", "custom"); if (x.hasPrice) add(x.price, "Жеке тапсырыс бағасы", "custom"); });
  c.aboutFeatures.forEach((x) => { add(x.title, "Ерекшелік атауы", "about"); add(x.text, "Ерекшелік мәтіні", "about"); });
  c.testimonials.forEach((x) => { add(x.name, "Пікір: аты", "reviews"); add(x.role, "Пікір: қала", "reviews"); add(x.text, "Пікір мәтіні", "reviews"); });
  return out;
}

export function textLabel(key) {
  for (const g of TEXT_GROUPS) for (const it of g.items) if (it[0] === key) return it[1];
  return key;
}

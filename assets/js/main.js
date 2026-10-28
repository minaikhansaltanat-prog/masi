(function(){
"use strict";

/* Base URL of the admin panel (Vercel). The site renders its built-in content
   (assets/js/content.js) first, then swaps in the published CMS content. */
var CMS_API = "https://gumyr-admin.vercel.app";
var STORAGE_KEY = "gumyr_lang";
var CACHE_KEY = "gumyr_content_v2";
var PREVIEW = /[?&]cms-preview=1/.test(location.search);

/* Filled by compile(content) */
var WA_PHONE = "";
var LANGS = [];
var DEFAULT_LANG = "kk";
var SETTINGS = {};
var CATEGORIES = [], CUSTOM_ORDERS = [], GALLERY_ITEMS = [], HERO_SLIDES = [], ABOUT_FEATURES = [];
var ALL_SECTIONS = ["categories","custom-orders","size-guide","about","gallery-media","reviews","contact"];
var FEATURE_ICONS = {
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
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>'
};

var FLAG_SVG = {
  kk: '<svg viewBox="0 0 30 20" xmlns="http://www.w3.org/2000/svg"><rect width="30" height="20" fill="#00AFCA"/><rect width="3.2" height="20" fill="#FEC50C"/><circle cx="16.5" cy="9.5" r="4" fill="#FEC50C"/><g fill="#FEC50C">$$RAYS$$</g></svg>',
  en: '<svg viewBox="0 0 30 20" xmlns="http://www.w3.org/2000/svg"><rect width="30" height="20" fill="#B22234"/><rect y="1.54" width="30" height="1.54" fill="#fff"/><rect y="4.62" width="30" height="1.54" fill="#fff"/><rect y="7.7" width="30" height="1.54" fill="#fff"/><rect y="10.77" width="30" height="1.54" fill="#fff"/><rect y="13.85" width="30" height="1.54" fill="#fff"/><rect y="16.92" width="30" height="1.54" fill="#fff"/><rect width="13" height="10.8" fill="#3C3B6E"/><g fill="#fff"><circle cx="2.4" cy="2" r="0.55"/><circle cx="5.6" cy="2" r="0.55"/><circle cx="8.8" cy="2" r="0.55"/><circle cx="11.2" cy="2" r="0.55"/><circle cx="4" cy="4" r="0.55"/><circle cx="7.2" cy="4" r="0.55"/><circle cx="10.4" cy="4" r="0.55"/><circle cx="2.4" cy="6" r="0.55"/><circle cx="5.6" cy="6" r="0.55"/><circle cx="8.8" cy="6" r="0.55"/><circle cx="11.2" cy="6" r="0.55"/><circle cx="4" cy="8" r="0.55"/><circle cx="7.2" cy="8" r="0.55"/><circle cx="10.4" cy="8" r="0.55"/></g></svg>',
  ru: '<svg viewBox="0 0 30 20" xmlns="http://www.w3.org/2000/svg"><rect width="30" height="20" fill="#fff"/><rect y="6.66" width="30" height="6.68" fill="#0039A6"/><rect y="13.34" width="30" height="6.66" fill="#D52B1E"/></svg>',
  uz: '<svg viewBox="0 0 30 20" xmlns="http://www.w3.org/2000/svg"><rect width="30" height="20" fill="#fff"/><rect width="30" height="6.2" fill="#0099B5"/><rect y="6.2" width="30" height="1" fill="#CE1126"/><rect y="12.8" width="30" height="1" fill="#CE1126"/><rect y="13.8" width="30" height="6.2" fill="#1EB53A"/><circle cx="5.2" cy="3.1" r="1.7" fill="#fff"/><circle cx="6.1" cy="2.6" r="1.4" fill="#0099B5"/></svg>',
  ky: '<svg viewBox="0 0 30 20" xmlns="http://www.w3.org/2000/svg"><rect width="30" height="20" fill="#E8112D"/><circle cx="15" cy="10" r="4.4" fill="#FFEF00"/><circle cx="15" cy="10" r="2.5" fill="#E8112D"/><circle cx="15" cy="10" r="1" fill="#FFEF00"/></svg>',
  ar: '<svg viewBox="0 0 30 20" xmlns="http://www.w3.org/2000/svg"><rect width="30" height="20" fill="#006C35"/><rect x="5" y="9.2" width="17" height="1.6" rx="0.8" fill="#fff"/><rect x="5" y="9.2" width="1.6" height="4.4" rx="0.8" fill="#fff"/></svg>',
  tr: '<svg viewBox="0 0 30 20" xmlns="http://www.w3.org/2000/svg"><rect width="30" height="20" fill="#E30A17"/><circle cx="11.8" cy="10" r="4.5" fill="#fff"/><circle cx="13.2" cy="10" r="3.6" fill="#E30A17"/><path d="M17.6 9.9l1.7.4-1.2 1.3.3 1.7-1.5-.8-1.6.7.4-1.7-1.2-1.3 1.8-.2.6-1.6z" fill="#fff"/></svg>',
  zh: '<svg viewBox="0 0 30 20" xmlns="http://www.w3.org/2000/svg"><rect width="30" height="20" fill="#DE2910"/><path d="M6.2 4l1 2.7 2.8.1-2.2 1.8.8 2.7-2.4-1.6-2.4 1.6.8-2.7-2.2-1.8 2.8-.1z" fill="#FFDE00"/><circle cx="12.4" cy="2.6" r="0.75" fill="#FFDE00"/><circle cx="13.9" cy="4.9" r="0.75" fill="#FFDE00"/><circle cx="13.6" cy="7.7" r="0.75" fill="#FFDE00"/><circle cx="11.6" cy="9.3" r="0.75" fill="#FFDE00"/></svg>'
};
(function(){
  var rays = "";
  for (var i=0;i<8;i++){
    var a = (i * Math.PI * 2) / 8;
    var x1 = 16.5 + Math.cos(a) * 4.6, y1 = 9.5 + Math.sin(a) * 4.6;
    var x2 = 16.5 + Math.cos(a) * 6.2, y2 = 9.5 + Math.sin(a) * 6.2;
    rays += '<line x1="'+x1.toFixed(1)+'" y1="'+y1.toFixed(1)+'" x2="'+x2.toFixed(1)+'" y2="'+y2.toFixed(1)+'" stroke="#FEC50C" stroke-width="1.1"/>';
  }
  FLAG_SVG.kk = FLAG_SVG.kk.replace("$$RAYS$$", rays);
})();

function flagFor(code){
  return FLAG_SVG[code] || ('<svg viewBox="0 0 30 20" xmlns="http://www.w3.org/2000/svg"><rect width="30" height="20" rx="2" fill="#7a4326"/><text x="15" y="14" text-anchor="middle" font-size="9" font-weight="700" fill="#fff" font-family="sans-serif">' + escapeHtml(String(code).slice(0,3).toUpperCase()) + '</text></svg>');
}

function lookup(obj, parts){
  for (var i=0;i<parts.length;i++){
    if (obj == null) return null;
    obj = obj[parts[i]];
  }
  return obj;
}

function t(lang, path){
  var parts = path.split(".");
  var cur = lookup(window.I18N[lang], parts);
  if (cur == null || cur === "") cur = lookup(window.I18N[DEFAULT_LANG], parts);
  return cur == null ? "" : cur;
}

function waLink(phone, text){
  return "https://wa.me/" + phone + (text ? ("?text=" + encodeURIComponent(text)) : "");
}

function waMsgForTitle(lang, title){
  return t(lang, "wa.product").split("{title}").join(title);
}

/* URLs coming from the CMS are only allowed to be site assets or http(s). */
function safeUrl(u){
  u = String(u || "").trim();
  if (!/^(https?:\/\/|assets\/|\/[^\/])/i.test(u)) return "";
  return u.replace(/[()'"\s<>]/g, encodeURIComponent);
}
function safeHref(u){
  u = String(u || "").trim();
  return /^https?:\/\//i.test(u) ? u : "";
}

/* ---------------- CONTENT -> RUNTIME ---------------- */
function setPath(obj, path, val){
  var parts = path.split(".");
  for (var i=0;i<parts.length-1;i++){
    if (typeof obj[parts[i]] !== "object" || obj[parts[i]] === null) obj[parts[i]] = {};
    obj = obj[parts[i]];
  }
  obj[parts[parts.length-1]] = val;
}

function compile(c){
  /* keys added to the built-in defaults after the CMS content was published still show up */
  var texts = Object.assign({}, window.GUMYR_CONTENT.texts, c.texts);
  DEFAULT_LANG = c.defaultLang || "kk";
  var all = c.languages || [];
  var enabled = all.filter(function(l){ return l.enabled !== false; });
  LANGS = enabled.map(function(l){ return l.code; });
  if (!LANGS.length) LANGS = [DEFAULT_LANG];

  var I = {};
  all.forEach(function(l){ I[l.code] = { dir: l.dir || "ltr", lang_name: l.name || l.code }; });
  if (!I[DEFAULT_LANG]) I[DEFAULT_LANG] = { dir: "ltr", lang_name: DEFAULT_LANG };
  function tr(map, code){ return (map && (map[code] || map[DEFAULT_LANG])) || ""; }

  Object.keys(I).forEach(function(code){
    var d = I[code];
    Object.keys(texts).forEach(function(key){ setPath(d, key, tr(texts[key], code)); });
    d.cat = {}; d.custom = d.custom || {}; d.colors = d.colors || {};
    (c.categories || []).forEach(function(x){ d.cat[x.id] = { title: tr(x.title, code), desc: tr(x.desc, code), price: tr(x.price, code) }; });
    (c.customOrders || []).forEach(function(x){ d.custom[x.id] = { title: tr(x.title, code), desc: tr(x.desc, code), price: tr(x.price, code) }; });
    (c.colors || []).forEach(function(x){ d.colors[x.key] = tr(x.name, code); });
    d.marquee = (c.marquee || []).map(function(x){ return tr(x.text, code); }).filter(Boolean);
    d.testimonials = (c.testimonials || []).map(function(x){
      return { type: x.type, media: x.media || "", name: tr(x.name, code), role: tr(x.role, code), text: tr(x.text, code) };
    });
    d.about_features = (c.aboutFeatures || []).map(function(x){ return { icon: x.icon, title: tr(x.title, code), text: tr(x.text, code) }; });
  });
  window.I18N = I;

  CATEGORIES = (c.categories || []).map(function(x){
    return { key: x.id, slides: x.slides || [], colors: x.colors || [], showOtherColors: !!x.showOtherColors };
  });
  CUSTOM_ORDERS = (c.customOrders || []).map(function(x){ return { key: x.id, hasPrice: !!x.hasPrice, slides: x.slides || [] }; });
  GALLERY_ITEMS = c.gallery || [];
  HERO_SLIDES = (c.hero && c.hero.slides) || [];
  ABOUT_FEATURES = c.aboutFeatures || [];
  SETTINGS = c.settings || {};
  WA_PHONE = String(SETTINGS.whatsapp || "").replace(/\D/g, "");
}

/* ---------------- STATE ---------------- */
var currentLang = "kk";
var heroTimer = null;

function initialLang(){
  if (PREVIEW) return DEFAULT_LANG;
  try{
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved && LANGS.indexOf(saved) > -1) return saved;
  }catch(e){}
  return LANGS.indexOf(DEFAULT_LANG) > -1 ? DEFAULT_LANG : LANGS[0];
}

/* ---------------- I18N APPLY ---------------- */
function applyI18n(lang){
  currentLang = lang;
  if (!PREVIEW){ try{ localStorage.setItem(STORAGE_KEY, lang); }catch(e){} }
  var dict = window.I18N[lang] || window.I18N[DEFAULT_LANG];
  document.documentElement.setAttribute("lang", lang);
  document.documentElement.setAttribute("dir", dict.dir || "ltr");
  document.title = t(lang, "meta.title");
  var metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute("content", t(lang, "meta.desc"));

  var nodes = document.querySelectorAll("[data-i18n]");
  nodes.forEach(function(node){
    node.textContent = t(lang, node.getAttribute("data-i18n"));
  });

  renderMarquee(lang);
  renderAbout(lang);
  renderCategories(lang);
  renderCustomOrders(lang);
  renderGallery(lang);
  renderReviews(lang);
  updateWaLinks(lang);
  updatePromo(lang);
  renderLangSheet(lang);
  var flagSlot = document.getElementById("langFlag");
  if (flagSlot) flagSlot.innerHTML = flagFor(lang);
}

function updateWaLinks(lang){
  var link = waLink(WA_PHONE, t(lang, "wa.greeting"));
  ["heroWaBtn","mobileNavWa","contactWa","socialWa","waFloat"].forEach(function(id){
    var el = document.getElementById(id);
    if (el) el.setAttribute("href", link);
  });
  var sizingBtn = document.getElementById("sizingWaBtn");
  if (sizingBtn) sizingBtn.setAttribute("href", waLink(WA_PHONE, t(lang, "wa.sizing")));
}

/* ---------------- SETTINGS (links, images, hidden sections) ---------------- */
function applySettings(){
  var s = SETTINGS;
  Array.prototype.forEach.call(document.querySelectorAll("[data-set-src]"), function(el){
    var v = safeUrl(s[el.getAttribute("data-set-src")]);
    if (v) el.setAttribute("src", v);
  });
  Array.prototype.forEach.call(document.querySelectorAll("[data-set-href]"), function(el){
    var raw = String(s[el.getAttribute("data-set-href")] || "").trim();
    var prefix = el.getAttribute("data-prefix") || "";
    var href = prefix ? (raw ? prefix + raw : "") : safeHref(raw);
    if (href){ el.setAttribute("href", href); el.style.display = ""; }
    else if (el.hasAttribute("data-hide-empty")) el.style.display = "none";
  });
  Array.prototype.forEach.call(document.querySelectorAll("[data-set-text]"), function(el){
    var v = s[el.getAttribute("data-set-text")];
    if (v) el.textContent = v;
  });
  Array.prototype.forEach.call(document.querySelectorAll("[data-hide-if-empty]"), function(el){
    el.style.display = s[el.getAttribute("data-hide-if-empty")] ? "" : "none";
  });
  var hidden = s.hiddenSections || [];
  ALL_SECTIONS.forEach(function(id){
    var off = hidden.indexOf(id) > -1;
    var sec = document.getElementById(id);
    if (sec) sec.style.display = off ? "none" : "";
    Array.prototype.forEach.call(document.querySelectorAll('.main-nav a[href="#' + id + '"], .mobile-nav-links a[href="#' + id + '"]'), function(a){
      a.style.display = off ? "none" : "";
    });
  });
}

function updatePromo(lang){
  var bar = document.getElementById("promoBar");
  if (!bar) return;
  var b = SETTINGS.banner || {};
  var txt = t(lang, "banner.text");
  var link = document.getElementById("promoLink");
  bar.style.display = (b.enabled && txt) ? "" : "none";
  var href = safeHref(b.link);
  if (href) link.setAttribute("href", href); else link.removeAttribute("href");
}

/* ---------------- ABOUT FEATURES ---------------- */
function renderAbout(lang){
  var wrap = document.getElementById("aboutFeatures");
  if (!wrap) return;
  var list = (window.I18N[lang] || window.I18N[DEFAULT_LANG]).about_features || [];
  wrap.innerHTML = list.map(function(f){
    return '<div class="about-feature"><div class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
      (FEATURE_ICONS[f.icon] || FEATURE_ICONS.star) + '</svg></div><h4>' + escapeHtml(f.title) + '</h4><p>' + escapeHtml(f.text) + '</p></div>';
  }).join("");
}

/* ---------------- MARQUEE ---------------- */
function renderMarquee(lang){
  var items = t(lang, "marquee");
  if (!Array.isArray(items)) return;
  var track = document.getElementById("marqueeTrack");
  var html = "";
  for (var r=0;r<2;r++){
    items.forEach(function(txt){ html += '<div class="marquee-item">' + escapeHtml(txt) + "</div>"; });
  }
  track.innerHTML = html;
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, function(c){
    return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
  });
}

/* ---------------- CAROUSEL HELPER ---------------- */
function createCarousel(root, opts){
  opts = opts || {};
  var track = root.querySelector(".cat-slide-track");
  var slidesEls = Array.prototype.slice.call(track.children);
  var count = slidesEls.length;
  if (!count) return { goTo: function(){}, getIndex: function(){ return 0; } };
  var index = 0;
  var dotsWrap = root.querySelector(".cat-dots");

  function go(i, silent){
    index = ((i % count) + count) % count;
    track.style.transform = "translateX(" + (root.dir_rtl ? 1 : -1) * index * 100 + "%)";
    if (dotsWrap){
      Array.prototype.forEach.call(dotsWrap.children, function(d, di){
        d.classList.toggle("is-active", di === index);
      });
    }
    slidesEls.forEach(function(s, si){
      var vid = s.querySelector("video");
      if (vid){ if (si === index) { vid.play().catch(function(){}); } else { vid.pause(); } }
    });
    if (opts.onChange) opts.onChange(index);
  }

  root.querySelectorAll(".cat-arrow.prev").forEach(function(b){ b.addEventListener("click", function(){ go(index-1); }); });
  root.querySelectorAll(".cat-arrow.next").forEach(function(b){ b.addEventListener("click", function(){ go(index+1); }); });
  if (dotsWrap){
    Array.prototype.forEach.call(dotsWrap.children, function(d, di){ d.addEventListener("click", function(){ go(di); }); });
  }

  var startX = 0, deltaX = 0, dragging = false;
  var media = root.querySelector(".cat-media");
  media.addEventListener("pointerdown", function(e){
    if (e.target.closest(".cat-arrow, .cat-dots")) return; // let buttons handle their own click
    dragging = true; startX = e.clientX; media.setPointerCapture(e.pointerId);
  });
  media.addEventListener("pointermove", function(e){ if(!dragging) return; deltaX = e.clientX - startX; });
  media.addEventListener("pointerup", function(){
    if (!dragging) return; dragging = false;
    if (Math.abs(deltaX) > 40){ go(index + (deltaX < 0 ? 1 : -1) * (root.dir_rtl ? -1 : 1)); }
    deltaX = 0;
  });
  media.addEventListener("pointercancel", function(){ dragging = false; deltaX = 0; });

  go(0);
  return { goTo: go, getIndex: function(){ return index; } };
}

/* ---------------- CATEGORIES RENDER ---------------- */
function renderCategories(lang){
  var grid = document.getElementById("catGrid");
  var isRtl = (window.I18N[lang].dir === "rtl");
  var html = "";
  CATEGORIES.forEach(function(cat){
    var slidesHtml = cat.slides.map(function(s){
      if (s.type === "video"){
        return '<div class="cat-slide"><video src="' + escapeHtml(safeUrl(s.src)) + '" muted loop playsinline preload="metadata"></video><span class="vid-badge">' +
          '<svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> ' +
          escapeHtml(t(lang,"reviews.tab_video")) + '</span></div>';
      }
      return '<div class="cat-slide"><img src="' + escapeHtml(safeUrl(s.src)) + '" loading="lazy" alt="' + escapeHtml(t(lang,"cat."+cat.key+".title")) + '"></div>';
    }).join("");

    var dotsHtml = cat.slides.map(function(){ return '<span class="cat-dot"></span>'; }).join("");

    var swatchHtml = cat.colors.map(function(c, ci){
      return '<button class="swatch' + (ci===0?" is-active":"") + '" data-color-index="' + ci + '" style="background-image:url(' + safeUrl(c.img) + ')" title="' + escapeHtml(t(lang,"colors."+c.key)) + '" aria-label="' + escapeHtml(t(lang,"colors."+c.key)) + '"></button>';
    }).join("");

    var otherColorsHtml = cat.showOtherColors ?
      '<div class="cat-other-colors">' + escapeHtml(t(lang,"categories.other_colors")) + " " + escapeHtml(t(lang,"colors.other_list")) + "</div>" : "";

    html += '<div class="cat-card reveal" data-cat="' + cat.key + '">' +
      '<div class="cat-media">' +
        '<div class="cat-slide-track">' + slidesHtml + "</div>" +
        '<button class="cat-arrow prev" aria-label="prev"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 6l-6 6 6 6"/></svg></button>' +
        '<button class="cat-arrow next" aria-label="next"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg></button>' +
        '<div class="cat-dots">' + dotsHtml + "</div>" +
      "</div>" +
      '<div class="cat-body">' +
        '<h3 class="cat-title">' + escapeHtml(t(lang,"cat."+cat.key+".title")) + "</h3>" +
        '<p class="cat-desc">' + escapeHtml(t(lang,"cat."+cat.key+".desc")) + "</p>" +
        (t(lang,"cat."+cat.key+".price") ? '<div class="cat-price">' + escapeHtml(t(lang,"cat."+cat.key+".price")) + "</div>" : "") +
        (cat.colors.length ? '<div class="cat-colors-label">' + escapeHtml(t(lang,"categories.colors_label")) + "</div>" +
        '<div class="cat-swatches">' + swatchHtml + "</div>" : "") +
        otherColorsHtml +
        '<a class="btn btn-wa cat-cta" target="_blank" rel="noopener" href="#" data-cat-cta="' + cat.key + '">' +
          '<svg viewBox="0 0 32 32" fill="currentColor"><path d="M16.02 3C9.4 3 4 8.38 4 15c0 2.3.66 4.45 1.8 6.28L4 29l7.9-1.75A11.9 11.9 0 0 0 16.02 27C22.64 27 28 21.62 28 15S22.64 3 16.02 3z"/></svg>' +
          "<span>" + escapeHtml(t(lang,"categories.cta")) + "</span>" +
        "</a>" +
      "</div>" +
    "</div>";
  });
  grid.innerHTML = html;

  Array.prototype.forEach.call(grid.querySelectorAll(".cat-card"), function(cardEl){
    var catKey = cardEl.getAttribute("data-cat");
    var cat = CATEGORIES.filter(function(c){ return c.key === catKey; })[0];
    cardEl.dir_rtl = isRtl;
    var carousel = createCarousel(cardEl);

    Array.prototype.forEach.call(cardEl.querySelectorAll(".swatch"), function(sw){
      sw.addEventListener("click", function(){
        var ci = parseInt(sw.getAttribute("data-color-index"), 10);
        var colorKey = cat.colors[ci].key;
        var firstIdx = cat.slides.findIndex(function(s){ return s.color === colorKey; });
        Array.prototype.forEach.call(cardEl.querySelectorAll(".swatch"), function(s2){ s2.classList.remove("is-active"); });
        sw.classList.add("is-active");
        if (firstIdx > -1) carousel.goTo(firstIdx);
      });
    });

    var ctaLink = cardEl.querySelector("[data-cat-cta]");
    var msg = waMsgForTitle(currentLang, t(currentLang, "cat."+catKey+".title"));
    ctaLink.setAttribute("href", waLink(WA_PHONE, msg));
  });
}

/* ---------------- CUSTOM ORDERS RENDER ---------------- */
function renderCustomOrders(lang){
  var grid = document.getElementById("customGrid");
  var isRtl = (window.I18N[lang].dir === "rtl");
  var badgeIcon = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.8 5.6L19 9l-5.2 1.4L12 16l-1.8-5.6L5 9l5.2-1.4z"/></svg>';
  var html = "";
  CUSTOM_ORDERS.forEach(function(item){
    var slidesHtml = item.slides.map(function(s){
      if (s.type === "video"){
        return '<div class="cat-slide"><video src="' + escapeHtml(safeUrl(s.src)) + '" muted loop playsinline preload="metadata"></video><span class="vid-badge">' +
          '<svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> ' +
          escapeHtml(t(lang,"reviews.tab_video")) + '</span></div>';
      }
      return '<div class="cat-slide"><img src="' + escapeHtml(safeUrl(s.src)) + '" loading="lazy" alt="' + escapeHtml(t(lang,"custom."+item.key+".title")) + '"></div>';
    }).join("");
    var dotsHtml = item.slides.map(function(){ return '<span class="cat-dot"></span>'; }).join("");
    var priceHtml = item.hasPrice
      ? (t(lang,"custom."+item.key+".price") ? '<div class="cat-price">' + escapeHtml(t(lang,"custom."+item.key+".price")) + "</div>" : "")
      : '<div class="custom-price-note">' + escapeHtml(t(lang,"custom.price_note")) + "</div>";

    html += '<div class="cat-card reveal" data-custom="' + item.key + '">' +
      '<div class="cat-media">' +
        '<div class="cat-slide-track">' + slidesHtml + "</div>" +
        '<button class="cat-arrow prev" aria-label="prev"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 6l-6 6 6 6"/></svg></button>' +
        '<button class="cat-arrow next" aria-label="next"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg></button>' +
        '<div class="cat-dots">' + dotsHtml + "</div>" +
      "</div>" +
      '<div class="cat-body">' +
        '<div class="custom-badge">' + badgeIcon + "<span>" + escapeHtml(t(lang,"custom.eyebrow")) + "</span></div>" +
        '<h3 class="cat-title">' + escapeHtml(t(lang,"custom."+item.key+".title")) + "</h3>" +
        '<p class="cat-desc">' + escapeHtml(t(lang,"custom."+item.key+".desc")) + "</p>" +
        priceHtml +
        '<a class="btn btn-wa cat-cta" target="_blank" rel="noopener" href="#" data-custom-cta="' + item.key + '">' +
          '<svg viewBox="0 0 32 32" fill="currentColor"><path d="M16.02 3C9.4 3 4 8.38 4 15c0 2.3.66 4.45 1.8 6.28L4 29l7.9-1.75A11.9 11.9 0 0 0 16.02 27C22.64 27 28 21.62 28 15S22.64 3 16.02 3z"/></svg>' +
          "<span>" + escapeHtml(t(lang,"categories.cta")) + "</span>" +
        "</a>" +
      "</div>" +
    "</div>";
  });
  grid.innerHTML = html;

  Array.prototype.forEach.call(grid.querySelectorAll(".cat-card"), function(cardEl){
    cardEl.dir_rtl = isRtl;
    createCarousel(cardEl);
    var itemKey = cardEl.getAttribute("data-custom");
    var ctaLink = cardEl.querySelector("[data-custom-cta]");
    var msg = waMsgForTitle(currentLang, t(currentLang, "custom."+itemKey+".title"));
    ctaLink.setAttribute("href", waLink(WA_PHONE, msg));
  });
}

/* ---------------- GALLERY RENDER ---------------- */
function renderGallery(lang){
  var track = document.getElementById("gTrack");
  var html = GALLERY_ITEMS.map(function(it){
    if (it.type === "video"){
      return '<div class="gcarousel-item"><video src="' + escapeHtml(safeUrl(it.src)) + '" muted loop playsinline preload="metadata"></video>' +
        '<div class="play-badge"><span><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></span></div></div>';
    }
    return '<div class="gcarousel-item"><img src="' + escapeHtml(safeUrl(it.src)) + '" loading="lazy" alt=""></div>';
  }).join("");
  track.innerHTML = html;

  Array.prototype.forEach.call(track.querySelectorAll(".gcarousel-item"), function(item){
    var vid = item.querySelector("video");
    if (!vid) return;
    item.addEventListener("click", function(){
      if (vid.paused){ vid.play(); item.classList.add("is-playing"); }
      else { vid.pause(); item.classList.remove("is-playing"); }
    });
  });

  var prev = document.getElementById("gPrev");
  var next = document.getElementById("gNext");
  function scrollByCard(dir){
    var card = track.querySelector(".gcarousel-item");
    var w = card ? card.offsetWidth + 16 : 300;
    var rtl = window.I18N[lang].dir === "rtl";
    track.scrollBy({ left: (rtl ? -1 : 1) * dir * w, behavior: "smooth" });
  }
  prev.onclick = function(){ scrollByCard(-1); };
  next.onclick = function(){ scrollByCard(1); };
}

/* ---------------- INFINITE LOOP SCROLLER (manual swipe/arrow only) ---------------- */
function makeInfiniteScroller(track){
  if (track.__infiniteInit) return;
  var originals = Array.prototype.slice.call(track.children);
  if (originals.length < 2) return;
  if ((document.documentElement.getAttribute("dir") || "ltr") === "rtl") return;
  originals.forEach(function(node){ track.appendChild(node.cloneNode(true)); });
  track.__infiniteInit = true;
  var cycleWidth = 0;
  function measure(){
    if (track.children.length < originals.length + 1) return;
    var a = track.children[0].getBoundingClientRect().left;
    var b = track.children[originals.length].getBoundingClientRect().left;
    cycleWidth = b - a;
  }
  requestAnimationFrame(measure);
  window.addEventListener("resize", measure);
  var ticking = false;
  track.addEventListener("scroll", function(){
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function(){
      ticking = false;
      if (cycleWidth > 4 && track.scrollLeft >= cycleWidth - 2){
        track.scrollLeft -= cycleWidth;
      }
    });
  }, { passive: true });
}

/* ---------------- REVIEWS RENDER ---------------- */
var reviewsCurrentType = "text";

function renderReviews(lang){
  var dict = window.I18N[lang];
  var types = ["video","text","audio","2gis"];
  var tabsWrap = document.getElementById("rtabs");
  var icons = {
    video: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="15" height="14" rx="2"/><path d="m17 10 5-3v10l-5-3"/></svg>',
    text: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h10"/></svg>',
    audio: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3z"/><path d="M19 11a7 7 0 0 1-14 0M12 18v3"/></svg>',
    "2gis": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>'
  };
  tabsWrap.innerHTML = types.map(function(ty){
    var label = ty === "2gis" ? "2GIS" : t(lang, "reviews.tab_" + ty);
    return '<button class="rtab' + (ty===reviewsCurrentType?" is-active":"") + '" data-type="' + ty + '" role="tab">' + icons[ty] + "<span>" + escapeHtml(label) + "</span></button>";
  }).join("");

  var testimonials = dict.testimonials || [];
  ["video","text","audio"].forEach(function(ty){
    var track = document.querySelector('.rcarousel-track[data-track="' + ty + '"]');
    var items = testimonials.filter(function(rv){ return rv.type === ty; });
    track.__infiniteInit = false;
    track.scrollLeft = 0;
    track.innerHTML = items.map(function(rv){
      var initials = (rv.name || "?").trim().charAt(0);
      var mediaSrc = escapeHtml(safeUrl(rv.media));
      var badge = (mediaSrc && ty === "video") ? '<video class="rmedia" src="' + mediaSrc + '" controls playsinline preload="metadata"></video>' :
        (mediaSrc && ty === "audio") ? '<audio class="rmedia" src="' + mediaSrc + '" controls preload="none"></audio>' :
        ty === "video" ?
        ('<div class="rmedia-badge">' + icons.video + "<span>" + escapeHtml(t(lang,"reviews.play")) + "</span></div>") :
        ty === "audio" ? ('<div class="rmedia-badge">' + icons.audio + "<span>" + escapeHtml(t(lang,"reviews.play")) + "</span></div>") : "";
      return '<div class="rcard">' +
        '<div class="rcard-top"><div class="ravatar">' + escapeHtml(initials) + '</div><div><div class="rname">' + escapeHtml(rv.name) + '</div><div class="rrole">' + escapeHtml(rv.role) + "</div></div></div>" +
        '<div class="rstars">' + Array(5).fill('<svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 1.5l2.6 5.6 6 .8-4.4 4.2 1.1 6-5.3-3-5.3 3 1.1-6L1.4 7.9l6-.8z"/></svg>').join("") + "</div>" +
        badge +
        '<p class="rtext">' + escapeHtml(rv.text) + "</p>" +
      "</div>";
    }).join("");
    makeInfiniteScroller(track);
  });

  Array.prototype.forEach.call(tabsWrap.querySelectorAll(".rtab"), function(btn){
    btn.addEventListener("click", function(){ setReviewsTab(btn.getAttribute("data-type")); });
  });
  setReviewsTab(reviewsCurrentType, true);
}

function setReviewsTab(type, silent){
  reviewsCurrentType = type;
  Array.prototype.forEach.call(document.querySelectorAll(".rtab"), function(b){ b.classList.toggle("is-active", b.getAttribute("data-type") === type); });
  Array.prototype.forEach.call(document.querySelectorAll(".rpanel"), function(p){ p.classList.toggle("is-active", p.getAttribute("data-type") === type); });
}

/* ---------------- LANGUAGE SHEET ---------------- */
function renderLangSheet(lang){
  var wrap = document.getElementById("langOptions");
  wrap.innerHTML = LANGS.map(function(code){
    var active = code === lang;
    return '<button class="lang-option' + (active?" is-active":"") + '" data-lang="' + code + '" role="menuitemradio" aria-checked="' + active + '">' +
      '<span class="native">' + escapeHtml(window.I18N[code].lang_name) + '</span>' +
      '<svg class="check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg>' +
    "</button>";
  }).join("");
  Array.prototype.forEach.call(wrap.querySelectorAll(".lang-option"), function(btn){
    btn.addEventListener("click", function(){
      closeLangSheet();
      applyI18n(btn.getAttribute("data-lang"));
    });
  });
}

function openLangSheet(){
  document.getElementById("langSheet").classList.add("is-open");
  document.getElementById("langBackdrop").classList.add("is-open");
  document.getElementById("langBtn").setAttribute("aria-expanded", "true");
}
function closeLangSheet(){
  document.getElementById("langSheet").classList.remove("is-open");
  document.getElementById("langBackdrop").classList.remove("is-open");
  document.getElementById("langBtn").setAttribute("aria-expanded", "false");
}

/* ---------------- HERO SLIDESHOW ---------------- */
function initHero(){
  var wrap = document.getElementById("heroSlides");
  if (heroTimer){ clearInterval(heroTimer); heroTimer = null; }
  wrap.innerHTML = HERO_SLIDES.map(function(src, i){
    return '<div class="hero-slide' + (i===0?" is-active":"") + '" style="background-image:url(' + safeUrl(src) + ')"></div>';
  }).join("");
  var slides = wrap.querySelectorAll(".hero-slide");
  var idx = 0;
  if (slides.length > 1 && !window.matchMedia("(prefers-reduced-motion: reduce)").matches){
    heroTimer = setInterval(function(){
      slides[idx].classList.remove("is-active");
      idx = (idx + 1) % slides.length;
      slides[idx].classList.add("is-active");
    }, 5200);
  }
}

/* ---------------- HEADER / MOBILE NAV ---------------- */
function initChrome(){
  var header = document.getElementById("siteHeader");
  window.addEventListener("scroll", function(){
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }, { passive: true });

  var burger = document.getElementById("burgerBtn");
  var mobileNav = document.getElementById("mobileNav");
  var mobileClose = document.getElementById("mobileNavClose");

  function openMobile(){
    burger.classList.add("is-open"); mobileNav.classList.add("is-open");
    burger.setAttribute("aria-expanded","true");
    document.body.style.overflow = "hidden";
  }
  function closeMobile(){
    burger.classList.remove("is-open"); mobileNav.classList.remove("is-open");
    burger.setAttribute("aria-expanded","false");
    document.body.style.overflow = "";
  }
  burger.addEventListener("click", function(){
    mobileNav.classList.contains("is-open") ? closeMobile() : openMobile();
  });
  mobileClose.addEventListener("click", closeMobile);
  Array.prototype.forEach.call(mobileNav.querySelectorAll("a[href^='#']"), function(a){
    a.addEventListener("click", closeMobile);
  });
  document.addEventListener("keydown", function(e){
    if (e.key === "Escape"){ closeMobile(); closeLangSheet(); }
  });

  var langBtn = document.getElementById("langBtn");
  var langBackdrop = document.getElementById("langBackdrop");
  langBtn.addEventListener("click", function(){
    document.getElementById("langSheet").classList.contains("is-open") ? closeLangSheet() : openLangSheet();
  });
  langBackdrop.addEventListener("click", closeLangSheet);
}

/* ---------------- FORM ---------------- */
function initForm(){
  var form = document.getElementById("orderForm");
  form.addEventListener("submit", function(e){
    e.preventDefault();
    var name = document.getElementById("fName").value.trim();
    var phone = document.getElementById("fPhone").value.trim();
    var size = document.getElementById("fSize").value.trim();
    var color = document.getElementById("fColor").value.trim();
    var comment = document.getElementById("fComment").value.trim();
    var d = { form_title: t(currentLang,"contact.form_title"), form_name: t(currentLang,"contact.form_name"), form_phone: t(currentLang,"contact.form_phone"), form_size: t(currentLang,"contact.form_size"), form_color: t(currentLang,"contact.form_color"), form_comment: t(currentLang,"contact.form_comment") };
    var lines = [
      "GUMYR — " + d.form_title,
      d.form_name + ": " + name,
      d.form_phone + ": " + phone,
      size ? (d.form_size + ": " + size) : null,
      color ? (d.form_color + ": " + color) : null,
      comment ? (d.form_comment + ": " + comment) : null
    ].filter(Boolean);
    window.open(waLink(WA_PHONE, lines.join("\n")), "_blank", "noopener");
  });
}

/* ---------------- REVEAL ON SCROLL ---------------- */
/* Elements are visible by default (no JS dependency). JS opts elements that
   start below the fold into a temporary hidden "pre" state, then reveals
   them as they scroll into view. If JS fails, everything stays visible. */
function initReveal(){
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if (en.isIntersecting){ en.target.classList.remove("pre"); io.unobserve(en.target); }
    });
  }, { threshold: 0.08, rootMargin: "0px 0px -30px 0px" });
  function observeAll(){
    document.querySelectorAll(".reveal").forEach(function(el){
      if (el.classList.contains("pre")) return;
      var rect = el.getBoundingClientRect();
      if (rect.top > window.innerHeight * 1.08){
        el.classList.add("pre");
        io.observe(el);
      }
    });
  }
  observeAll();
  window.__reobserveReveal = observeAll;
}

/* ---------------- CMS CONTENT ---------------- */
function readCache(){
  try{
    var c = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
    return (c && c.schema === 2) ? c : null;
  }catch(e){ return null; }
}

function applyContent(c, lang){
  compile(c);
  if (lang && LANGS.indexOf(lang) > -1) currentLang = lang;
  else if (LANGS.indexOf(currentLang) < 0) currentLang = initialLang();
  initHero();
  applySettings();
  applyI18n(currentLang);
  setTimeout(function(){ if (window.__reobserveReveal) window.__reobserveReveal(); }, 60);
}

function fetchLatest(current){
  if (!CMS_API || !window.fetch) return;
  var ctrl = window.AbortController ? new AbortController() : null;
  var timer = setTimeout(function(){ if (ctrl) ctrl.abort(); }, 8000);
  fetch(CMS_API + "/api/content", { signal: ctrl ? ctrl.signal : undefined, credentials: "omit" })
    .then(function(r){ return r.ok ? r.json() : null; })
    .then(function(c){
      clearTimeout(timer);
      if (!c || c.schema !== 2 || (current && current.version === c.version)) return;
      try{ localStorage.setItem(CACHE_KEY, JSON.stringify(c)); }catch(e){}
      applyContent(c);
    })
    .catch(function(){ clearTimeout(timer); });
}

/* Admin live preview: the admin page posts its unsaved draft into this iframe. */
function listenPreview(){
  window.addEventListener("message", function(e){
    var ok = (CMS_API && e.origin === CMS_API) || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(e.origin);
    var m = e.data;
    if (!ok || !m || m.type !== "gumyr-preview" || !m.content || m.content.schema !== 2) return;
    applyContent(m.content, m.lang);
  });
  if (window.parent !== window) window.parent.postMessage({ type: "gumyr-preview-ready" }, "*");
}

/* ---------------- INIT ---------------- */
document.addEventListener("DOMContentLoaded", function(){
  document.getElementById("yearNow").textContent = new Date().getFullYear();
  var cached = PREVIEW ? null : readCache();
  var current = cached || window.GUMYR_CONTENT;
  try{ compile(current); }catch(e){ cached = null; current = window.GUMYR_CONTENT; compile(current); }
  currentLang = initialLang();
  initHero();
  initChrome();
  initForm();
  applySettings();
  var adminLink = document.getElementById("adminLink");
  if (adminLink && CMS_API && !PREVIEW){ adminLink.setAttribute("href", CMS_API + "/"); adminLink.style.display = ""; }
  applyI18n(currentLang);
  initReveal();
  setTimeout(function(){ if (window.__reobserveReveal) window.__reobserveReveal(); }, 60);
  if (PREVIEW) listenPreview(); else fetchLatest(cached);
});
})();

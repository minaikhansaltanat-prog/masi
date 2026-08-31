(function(){
"use strict";

var WA_PHONE = "77089859284";
var STORAGE_KEY = "gumyr_lang";
var LANGS = ["kk","ru","en","uz","ky","ar","tr","zh"];

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

function t(lang, path){
  var obj = window.I18N[lang] || window.I18N.kk;
  var parts = path.split(".");
  var cur = obj;
  for (var i=0;i<parts.length;i++){
    if (cur == null) return "";
    cur = cur[parts[i]];
  }
  if (cur == null){
    // fallback to kk
    cur = window.I18N.kk;
    for (var j=0;j<parts.length;j++){ if(cur==null) return ""; cur = cur[parts[j]]; }
  }
  return cur;
}

function waLink(phone, text){
  return "https://wa.me/" + phone + (text ? ("?text=" + encodeURIComponent(text)) : "");
}

function waMsgForTitle(lang, title){
  return {
    kk: "Сәлеметсіз бе! \"" + title + "\" туралы сұрағым бар еді.",
    ru: "Здравствуйте! Хочу узнать про \"" + title + "\".",
    en: "Hello! I'd like to ask about the \"" + title + "\".",
    uz: "Assalomu alaykum! \"" + title + "\" haqida so'ramoqchi edim.",
    ky: "Салам! \"" + title + "\" жөнүндө сурайын деп edim.",
    ar: "مرحبًا! أود الاستفسار عن \"" + title + "\".",
    tr: "Merhaba! \"" + title + "\" hakkında bilgi almak istiyorum.",
    zh: "您好！我想咨询「" + title + "」。"
  }[lang] || "";
}

/* ---------------- PRODUCT DATA ---------------- */
var CATEGORIES = [
  {
    key: "goat",
    slides: [
      { type:"image", color:"tan", src:"assets/images/cat-goat/tan-1.jpg" },
      { type:"image", color:"tan", src:"assets/images/cat-goat/tan-2.jpg" },
      { type:"image", color:"tan", src:"assets/images/cat-goat/tan-3.jpg" },
      { type:"image", color:"tan", src:"assets/images/cat-goat/tan-4.jpg" }
    ],
    colors: [ {key:"tan", img:"assets/images/cat-goat/tan-1.jpg"} ],
    showOtherColors: true
  },
  {
    key: "cow",
    slides: [
      { type:"image", color:"white", src:"assets/images/cat-cow/white-1.jpg" },
      { type:"image", color:"white", src:"assets/images/cat-cow/white-2.jpg" },
      { type:"video", color:null, src:"assets/video/cow-process.mp4" },
      { type:"image", color:"rosegold", src:"assets/images/cat-cow/rosegold-1.jpg" },
      { type:"image", color:"rosegold", src:"assets/images/cat-cow/rosegold-2.jpg" },
      { type:"image", color:"pearl", src:"assets/images/cat-cow/pearl-1.jpg" },
      { type:"image", color:"green", src:"assets/images/cat-cow/green-1.jpg" },
      { type:"image", color:"green", src:"assets/images/cat-cow/green-2.jpg" },
      { type:"image", color:"black", src:"assets/images/cat-cow/black-1.jpg" },
      { type:"image", color:"leopard", src:"assets/images/cat-cow/leopard-1.jpg" },
      { type:"image", color:"leopard", src:"assets/images/cat-cow/leopard-2.jpg" }
    ],
    colors: [
      {key:"white", img:"assets/images/cat-cow/white-1.jpg"},
      {key:"rosegold", img:"assets/images/cat-cow/rosegold-1.jpg"},
      {key:"pearl", img:"assets/images/cat-cow/pearl-1.jpg"},
      {key:"green", img:"assets/images/cat-cow/green-1.jpg"},
      {key:"black", img:"assets/images/cat-cow/black-1.jpg"},
      {key:"leopard", img:"assets/images/cat-cow/leopard-1.jpg"}
    ],
    showOtherColors: false
  },
  {
    key: "socks",
    slides: [
      { type:"image", color:"white", src:"assets/images/cat-socks/white-1.jpg" },
      { type:"image", color:"white", src:"assets/images/cat-socks/white-2.jpg" },
      { type:"image", color:"black", src:"assets/images/cat-socks/black-1.jpg" },
      { type:"image", color:"cream", src:"assets/images/cat-socks/cream-1.jpg" },
      { type:"image", color:"cream", src:"assets/images/cat-socks/cream-2.jpg" }
    ],
    colors: [
      {key:"white", img:"assets/images/cat-socks/white-1.jpg"},
      {key:"black", img:"assets/images/cat-socks/black-1.jpg"},
      {key:"cream", img:"assets/images/cat-socks/cream-1.jpg"}
    ],
    showOtherColors: false
  }
];

var CUSTOM_ORDERS = [
  {
    key: "toi",
    hasPrice: false,
    slides: [
      { type:"video", src:"assets/video/toi-1.mp4" },
      { type:"video", src:"assets/video/toi-2.mp4" },
      { type:"video", src:"assets/video/toi-3.mp4" },
      { type:"video", src:"assets/video/toi-4.mp4" }
    ]
  },
  {
    key: "jeke",
    hasPrice: true,
    slides: [
      { type:"image", src:"assets/images/jeke/photo-3.jpg" },
      { type:"image", src:"assets/images/jeke/photo-4.jpg" },
      { type:"image", src:"assets/images/jeke/photo-5.jpg" },
      { type:"image", src:"assets/images/jeke/photo-1.jpg" },
      { type:"image", src:"assets/images/jeke/photo-2.jpg" },
      { type:"video", src:"assets/video/jeke-1.mp4" },
      { type:"video", src:"assets/video/jeke-2.mp4" },
      { type:"video", src:"assets/video/jeke-3.mp4" }
    ]
  }
];

var GALLERY_ITEMS = [
  {type:"image", src:"assets/images/gallery/teal-gold.jpg"},
  {type:"image", src:"assets/images/gallery/brocade-gold.jpg"},
  {type:"image", src:"assets/images/gallery/winter-sheepskin.jpg"},
  {type:"video", src:"assets/video/gallery-clip-1.mp4"},
  {type:"image", src:"assets/images/gallery/ornament-white-red.jpg"},
  {type:"image", src:"assets/images/gallery/ornament-cream-macro.jpg"},
  {type:"image", src:"assets/images/gallery/ornament-white-macro.jpg"},
  {type:"image", src:"assets/images/gallery/hardware-zip-macro.jpg"},
  {type:"image", src:"assets/images/gallery/hardware-studs-macro.jpg"},
  {type:"image", src:"assets/images/gallery/green-pair.jpg"},
  {type:"image", src:"assets/images/gallery/detail-logo-white.jpg"},
  {type:"image", src:"assets/images/gallery/ornament-black-orange.jpg"},
  {type:"image", src:"assets/images/gallery/white-moody-back.jpg"},
  {type:"image", src:"assets/images/gallery/black-fur-silver.jpg"},
  {type:"image", src:"assets/images/gallery/interior-detail.jpg"}
];

var HERO_SLIDES = [
  "assets/images/gallery/teal-gold.jpg",
  "assets/images/gallery/ornament-white-red.jpg",
  "assets/images/gallery/winter-sheepskin.jpg",
  "assets/images/gallery/brocade-gold.jpg"
];

/* ---------------- STATE ---------------- */
var currentLang = (function(){
  try{
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved && LANGS.indexOf(saved) > -1) return saved;
  }catch(e){}
  return "kk";
})();

/* ---------------- I18N APPLY ---------------- */
function applyI18n(lang){
  currentLang = lang;
  try{ localStorage.setItem(STORAGE_KEY, lang); }catch(e){}
  var dict = window.I18N[lang] || window.I18N.kk;
  document.documentElement.setAttribute("lang", lang);
  document.documentElement.setAttribute("dir", dict.dir || "ltr");
  document.title = t(lang, "meta.title");
  var metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute("content", t(lang, "meta.desc"));

  var nodes = document.querySelectorAll("[data-i18n]");
  nodes.forEach(function(node){
    var val = t(lang, node.getAttribute("data-i18n"));
    if (val) node.textContent = val;
  });

  renderMarquee(lang);
  renderCategories(lang);
  renderCustomOrders(lang);
  renderGallery(lang);
  renderReviews(lang);
  updateWaLinks(lang);
  renderLangSheet(lang);
  var flagSlot = document.getElementById("langFlag");
  if (flagSlot) flagSlot.innerHTML = FLAG_SVG[lang] || "";
}

function updateWaLinks(lang){
  var greeting = {
    kk: "Сәлеметсіз бе! Мәсі туралы сұрағым бар еді.",
    ru: "Здравствуйте! Хочу узнать про мäси.",
    en: "Hello! I'd like to ask about your mäsi boots.",
    uz: "Assalomu alaykum! Masi haqida so'ramoqchi edim.",
    ky: "Салам! Маси жөнүндө сурайын деп edim.",
    ar: "مرحبًا! أود الاستفسار عن أحذية الماسي.",
    tr: "Merhaba! Mesi hakkında bilgi almak istiyorum.",
    zh: "您好！我想咨询一下马西靴的信息。"
  }[lang] || "Сәлеметсіз бе!";
  var link = waLink(WA_PHONE, greeting);
  ["heroWaBtn","mobileNavWa","contactWa","socialWa","waFloat"].forEach(function(id){
    var el = document.getElementById(id);
    if (el) el.setAttribute("href", link);
  });
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
  media.addEventListener("pointerdown", function(e){ dragging = true; startX = e.clientX; media.setPointerCapture(e.pointerId); });
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
        return '<div class="cat-slide"><video src="' + s.src + '" muted loop playsinline preload="metadata"></video><span class="vid-badge">' +
          '<svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> ' +
          escapeHtml(t(lang,"reviews.tab_video")) + '</span></div>';
      }
      return '<div class="cat-slide"><img src="' + s.src + '" loading="lazy" alt="' + escapeHtml(t(lang,"cat."+cat.key+".title")) + '"></div>';
    }).join("");

    var dotsHtml = cat.slides.map(function(){ return '<span class="cat-dot"></span>'; }).join("");

    var swatchHtml = cat.colors.map(function(c, ci){
      return '<button class="swatch' + (ci===0?" is-active":"") + '" data-color-index="' + ci + '" style="background-image:url(' + c.img + ')" title="' + escapeHtml(t(lang,"colors."+c.key)) + '" aria-label="' + escapeHtml(t(lang,"colors."+c.key)) + '"></button>';
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
        '<div class="cat-price">' + escapeHtml(t(lang,"cat."+cat.key+".price")) + "</div>" +
        '<div class="cat-colors-label">' + escapeHtml(t(lang,"categories.colors_label")) + "</div>" +
        '<div class="cat-swatches">' + swatchHtml + "</div>" +
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
        return '<div class="cat-slide"><video src="' + s.src + '" muted loop playsinline preload="metadata"></video><span class="vid-badge">' +
          '<svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> ' +
          escapeHtml(t(lang,"reviews.tab_video")) + '</span></div>';
      }
      return '<div class="cat-slide"><img src="' + s.src + '" loading="lazy" alt="' + escapeHtml(t(lang,"custom."+item.key+".title")) + '"></div>';
    }).join("");
    var dotsHtml = item.slides.map(function(){ return '<span class="cat-dot"></span>'; }).join("");
    var priceHtml = item.hasPrice
      ? '<div class="cat-price">' + escapeHtml(t(lang,"custom."+item.key+".price")) + "</div>"
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
      return '<div class="gcarousel-item"><video src="' + it.src + '" muted loop playsinline preload="metadata"></video>' +
        '<div class="play-badge"><span><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></span></div></div>';
    }
    return '<div class="gcarousel-item"><img src="' + it.src + '" loading="lazy" alt=""></div>';
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
      var badge = ty === "video" ?
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
  wrap.innerHTML = HERO_SLIDES.map(function(src, i){
    return '<div class="hero-slide' + (i===0?" is-active":"") + '" style="background-image:url(' + src + ')"></div>';
  }).join("");
  var slides = wrap.querySelectorAll(".hero-slide");
  var idx = 0;
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches){
    setInterval(function(){
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
    var d = window.I18N[currentLang].contact;
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

/* ---------------- INIT ---------------- */
document.addEventListener("DOMContentLoaded", function(){
  document.getElementById("yearNow").textContent = new Date().getFullYear();
  initHero();
  initChrome();
  initForm();
  applyI18n(currentLang);
  initReveal();
  setTimeout(function(){ if (window.__reobserveReveal) window.__reobserveReveal(); }, 60);
});
})();

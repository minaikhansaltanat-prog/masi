/* Uploading (with client-side image shrinking) and the media picker dialog. */
import { h, icon, modal, toast, slug, fmtBytes } from "./util.js";
import { api } from "./api.js";
import { S, mediaUrl, mediaType } from "./state.js";

const MAX_VIDEO = 150 * 1024 * 1024;
let blobUpload;

async function prepareImage(file) {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return file;
  const bmp = await createImageBitmap(file).catch(() => null);
  if (!bmp) return file;
  const scale = Math.min(1, 1800 / Math.max(bmp.width, bmp.height));
  if (scale === 1 && file.size < 1.2 * 1024 * 1024) { bmp.close(); return file; }
  const cv = document.createElement("canvas");
  cv.width = Math.round(bmp.width * scale);
  cv.height = Math.round(bmp.height * scale);
  cv.getContext("2d").drawImage(bmp, 0, 0, cv.width, cv.height);
  bmp.close();
  const png = file.type === "image/png";
  const blob = await new Promise((r) => cv.toBlob(r, png ? "image/png" : "image/jpeg", 0.86));
  if (!blob || (scale === 1 && blob.size >= file.size)) return file;
  return new File([blob], file.name.replace(/\.\w+$/, "") + (png ? ".png" : ".jpg"), { type: blob.type });
}

function extOf(file) {
  const byType = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif", "video/mp4": ".mp4", "video/webm": ".webm", "video/quicktime": ".mov",
    "audio/mpeg": ".mp3", "audio/mp4": ".m4a", "audio/aac": ".aac", "audio/ogg": ".ogg", "audio/wav": ".wav", "audio/webm": ".webm", "audio/x-m4a": ".m4a" };
  return byType[file.type] || (file.name.match(/\.\w+$/) || [""])[0].toLowerCase();
}

function progressRow(name) {
  let box = document.getElementById("uploads");
  if (!box) { box = h("div", { id: "uploads" }); document.body.append(box); }
  const bar = h("i");
  const row = h("div", { class: "up-row" }, h("span", {}, name), h("div", { class: "up-bar" }, bar));
  box.append(row);
  return { set: (p) => { bar.style.transform = `scaleX(${Math.max(0.03, p / 100)})`; }, done: () => row.remove() };
}

/** Uploads files, returns [{url, type}] (failed files are reported and skipped). */
export async function uploadFiles(files) {
  const out = [];
  for (const original of files) {
    const isVideo = original.type.startsWith("video/");
    if (!/^(image|video|audio)\//.test(original.type)) { toast(original.name + ": бұл файл түріне рұқсат жоқ", "err"); continue; }
    if (original.size > MAX_VIDEO) { toast(original.name + ": файл тым үлкен (150 MB-тан аспауы керек)", "err"); continue; }
    const row = progressRow(original.name);
    try {
      const file = isVideo ? original : await prepareImage(original);
      if (!blobUpload) blobUpload = (await import("../vendor/blob-client.js")).upload;
      const name = `media/${Date.now().toString(36)}-${slug(original.name.replace(/\.\w+$/, ""))}${extOf(file)}`;
      const res = await blobUpload(name, file, {
        access: "public", handleUploadUrl: "/api/admin/upload", contentType: file.type,
        multipart: file.size > 8 * 1024 * 1024, onUploadProgress: ({ percentage }) => row.set(percentage),
      });
      out.push({ url: res.url, type: mediaType(res.url) });
      if (isVideo && file.size > 25 * 1024 * 1024) toast("Бейне ауыр (" + fmtBytes(file.size) + ") — мобильді интернетте баяу ашылады", "warn", 6000);
    } catch (e) {
      toast(original.name + ": жүктелмеді — " + (e.message || e), "err", 6000);
    } finally { row.done(); }
  }
  return out;
}

let cache = { uploaded: null, seed: null };
export const invalidateMedia = () => { cache.uploaded = null; };

export async function loadUploaded() {
  if (!cache.uploaded) cache.uploaded = await api("admin/media");
  return cache.uploaded;
}

async function loadSeedAssets() {
  if (!cache.seed) {
    const seed = await (await fetch("/seed.json")).json();
    const found = new Set();
    JSON.stringify(seed, (_, v) => { if (typeof v === "string" && /^assets\/.+\.(jpe?g|png|webp|mp4)$/i.test(v)) found.add(v); return v; });
    cache.seed = [...found].map((src) => ({ url: src, pathname: src.split("/").pop(), size: 0 }));
  }
  return cache.seed;
}

export function tile(m, selected, onClick) {
  const type = mediaType(m.url);
  const thumb = type === "video" ? h("video", { src: mediaUrl(m.url) + "#t=0.1", muted: true, preload: "metadata" })
    : type === "audio" ? h("div", { class: "audio-ph" }, icon("music", 28))
    : h("img", { src: mediaUrl(m.url), loading: "lazy", alt: "" });
  return h("button", { class: "mtile" + (selected ? " sel" : ""), type: "button", onClick },
    thumb, type === "video" ? h("span", { class: "mbadge" }, icon("play", 11)) : null,
    h("span", { class: "mname" }, m.pathname.split("/").pop().replace(/-[A-Za-z0-9]{20,}(?=\.)/, "")), h("span", { class: "mcheck" }, icon("check", 14)));
}

/** Opens the picker. kinds: ["image"], ["video"], ["image","video"], ["audio"]. Resolves with [{url,type}] or null. */
export function pickMedia({ kinds = ["image", "video"], multiple = false, title = "Файл таңдау" } = {}) {
  return new Promise((resolve) => {
    const picked = new Map();
    let tab = "uploaded", items = [];
    const grid = h("div", { class: "mgrid" });
    const accept = kinds.map((k) => k + "/*").join(",");
    const confirmBtn = h("button", { class: "btn primary", disabled: true, onClick: () => dlg.close(true) }, "Таңдау");

    const refreshBtn = () => {
      confirmBtn.disabled = !picked.size;
      confirmBtn.textContent = picked.size ? `Таңдау (${picked.size})` : "Таңдау";
    };
    const draw = () => {
      grid.replaceChildren(...items.filter((m) => kinds.includes(mediaType(m.url))).map((m) =>
        tile(m, picked.has(m.url), () => {
          if (picked.has(m.url)) picked.delete(m.url);
          else { if (!multiple) picked.clear(); picked.set(m.url, { url: m.url, type: mediaType(m.url) }); }
          draw(); refreshBtn();
        })));
      if (!grid.children.length) grid.append(h("p", { class: "empty" }, tab === "uploaded" ? "Әзірге жүктелген файл жоқ — жоғарыдан жүктеңіз." : "Файл жоқ."));
    };
    const load = async () => {
      grid.replaceChildren(h("p", { class: "empty" }, "Жүктелуде…"));
      try { items = tab === "uploaded" ? await loadUploaded() : await loadSeedAssets(); } catch (e) { items = []; toast("Кітапхана ашылмады: " + e.message, "err"); }
      draw();
    };

    const input = h("input", { type: "file", accept, multiple: true, hidden: true });
    const doUpload = async (files) => {
      const res = await uploadFiles([...files]);
      if (!res.length) return;
      invalidateMedia();
      tab = "uploaded"; setTabs();
      await load();
      res.forEach((r) => { if (multiple || !picked.size) picked.set(r.url, r); });
      draw(); refreshBtn();
    };
    input.addEventListener("change", () => { doUpload(input.files); input.value = ""; });
    const drop = h("div", { class: "dropzone", tabindex: "0", role: "button", onClick: () => input.click(), onKeydown: (e) => { if (e.key === "Enter" || e.key === " ") input.click(); } },
      icon("upload", 22), h("b", {}, "Файлдарды осында сүйреңіз немесе басып таңдаңыз"),
      h("small", {}, kinds.includes("video") ? "Фото автоматты түрде кішірейтіледі. Бейне — 150 MB-қа дейін." : "Фото автоматты түрде кішірейтіледі."));
    ["dragenter", "dragover"].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add("over"); }));
    ["dragleave", "drop"].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove("over"); }));
    drop.addEventListener("drop", (e) => doUpload(e.dataTransfer.files));

    const tabs = h("div", { class: "tabs" });
    const setTabs = () => tabs.replaceChildren(...[["uploaded", "Жүктелген файлдар"], ["seed", "Сайттағы бастапқы файлдар"]].map(([id, label]) =>
      h("button", { class: "tab" + (tab === id ? " on" : ""), type: "button", onClick: () => { tab = id; setTabs(); load(); } }, label)));
    setTabs();

    const dlg = modal({
      title, wide: true, body: h("div", {}, input, drop, tabs, grid),
      actions: [{ label: "Бас тарту", value: false }, { label: "", kind: "primary" }],
      onClose: (v) => resolve(v === true ? [...picked.values()] : null),
    });
    dlg.el.querySelector("footer .btn.primary").replaceWith(confirmBtn);
    load();
  });
}

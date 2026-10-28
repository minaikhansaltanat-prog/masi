const GOOGLE = { zh: "zh-CN", "zh-tw": "zh-TW" };
const NAMES = { kk: "Kazakh", ru: "Russian", en: "English", uz: "Uzbek (Latin)", ky: "Kyrgyz", ar: "Arabic", tr: "Turkish", zh: "Simplified Chinese" };

/* The product word must survive machine translation (it is often read as "fabric"). */
const MASI = { kk: "мәсі", ru: "мәси", en: "mäsi", uz: "masi", ky: "маси", ar: "الماسي", tr: "mesi", zh: "马西靴" };
const MASI_RE = /[Мм][әа][сc][іи]\p{L}*/gu;
const guard = (s) => String(s).replace(/\{(\w+)\}/g, (_, n) => `XYZ${n.length}${n.toUpperCase()}ZYX`).replace(MASI_RE, "XYZMASIZYX");
const unguard = (s, to) => String(s).replace(/XYZMASIZYX/g, MASI[to] || "mäsi").replace(/XYZ\d+([A-Z]+)ZYX/g, (_, n) => `{${n.toLowerCase()}}`);

async function viaGoogle(text, from, to) {
  const u = new URL("https://translate.googleapis.com/translate_a/single");
  u.search = new URLSearchParams({ client: "gtx", sl: GOOGLE[from] || from, tl: GOOGLE[to] || to, dt: "t", q: guard(text) });
  const r = await fetch(u);
  if (!r.ok) throw new Error("translate http " + r.status);
  const data = await r.json();
  return unguard(data[0].map((p) => p[0]).join(""), to);
}

async function viaClaude(items, from, to) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: process.env.TRANSLATE_MODEL || "claude-haiku-5-5",
      max_tokens: 8000,
      system: `You translate website copy for GUMYR, a workshop making handmade Kazakh national boots (mäsi). Translate from ${NAMES[from] || from} to ${NAMES[to] || to}. The word мәсі / mäsi is a soft Kazakh leather boot: render it as \"${MASI[to] || "mäsi"}\", never as fabric. Keep brand names (GUMYR, GUMIR.KZ, WhatsApp, Kaspi Pay, YouTube, 2GIS, WeChat), numbers, currency signs and {placeholders} unchanged. Person names and cities are transliterated. Reply with ONLY a JSON array of strings, same length and order as the input.`,
      messages: [{ role: "user", content: JSON.stringify(items.map((i) => i.text)) }],
    }),
  });
  if (!r.ok) throw new Error("claude http " + r.status);
  const data = await r.json();
  const txt = data.content.map((c) => c.text || "").join("");
  const arr = JSON.parse(txt.slice(txt.indexOf("["), txt.lastIndexOf("]") + 1));
  if (!Array.isArray(arr) || arr.length !== items.length) throw new Error("claude shape");
  return arr.map(String);
}

export async function translate(items, from, to) {
  if (process.env.ANTHROPIC_API_KEY) {
    try { return { engine: "claude", out: await viaClaude(items, from, to) }; } catch { /* fall back to the free engine */ }
  }
  const out = [];
  for (let i = 0; i < items.length; i += 6) {
    out.push(...(await Promise.all(items.slice(i, i + 6).map((it) => viaGoogle(it.text, from, to)))));
  }
  return { engine: "google", out };
}

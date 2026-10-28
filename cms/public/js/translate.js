/* Auto-translation from the default language into the languages that are still empty. */
import { h, modal, toast } from "./util.js";
import { api } from "./api.js";
import { S, changed, rerender } from "./state.js";

export function missingCount(fields, code) {
  const from = S.draft.defaultLang;
  return fields.filter((f) => (f.map[from] || "").trim() && !(f.map[code] || "").trim()).length;
}

/** Fills empty `map[code]` values; never overwrites text that is already there. */
export async function runTranslate(fields, targets) {
  const from = S.draft.defaultLang;
  const jobs = [];
  for (const code of targets) for (const f of fields) if ((f.map[from] || "").trim() && !(f.map[code] || "").trim()) jobs.push({ f, code });
  if (!jobs.length) { toast("Аударатын бос өріс жоқ", "warn"); return; }

  const bar = h("i");
  const status = h("p", { class: "muted-p" }, `0 / ${jobs.length}`);
  const dlg = modal({ title: "Автоаударма жүріп жатыр…", body: h("div", {}, h("div", { class: "up-bar big" }, bar), status), onClose: () => {} });
  let done = 0, failed = 0, engine = "";
  const byLang = new Map();
  jobs.forEach((j) => { if (!byLang.has(j.code)) byLang.set(j.code, []); byLang.get(j.code).push(j); });

  for (const [code, list] of byLang) {
    for (let i = 0; i < list.length; i += 30) {
      const chunk = list.slice(i, i + 30);
      try {
        const res = await api("admin/translate", { method: "POST", body: { from, to: code, items: chunk.map((j) => ({ text: j.f.map[from] })) } });
        chunk.forEach((j, k) => { if (res.out[k] && !(j.f.map[code] || "").trim()) j.f.map[code] = res.out[k]; });
        engine = res.engine;
      } catch { failed += chunk.length; }
      done += chunk.length;
      bar.style.transform = `scaleX(${done / jobs.length})`;
      status.textContent = `${done} / ${jobs.length}`;
    }
  }
  dlg.close(true);
  changed();
  rerender();
  if (failed) toast(`${jobs.length - failed} мәтін аударылды, ${failed} аударылмады — кейінірек қайталаңыз`, "warn", 7000);
  else toast(`${jobs.length} мәтін аударылды (${engine === "claude" ? "Claude" : "Google"}). Жарияламас бұрын тексеріп шығыңыз — машина аудармасы қате жібере алады.`, "ok", 8000);
}

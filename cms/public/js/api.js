export class ApiError extends Error {
  constructor(status, data) {
    super((data && data.error) || "HTTP " + status);
    this.status = status;
    this.data = data;
  }
}

let onUnauthorized = () => {};
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn; };

export async function api(path, { method = "GET", body } = {}) {
  const r = await fetch("/api/" + path, {
    method,
    headers: body !== undefined ? { "content-type": "application/json" } : {},
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: "same-origin",
  });
  let data = null;
  try { data = await r.json(); } catch { /* empty body */ }
  if (r.status === 401 && path !== "login" && path !== "session") onUnauthorized();
  if (!r.ok) throw new ApiError(r.status, data);
  return data;
}

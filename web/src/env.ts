
export const cfg = {
  mock: (import.meta.env.VITE_MOCK ?? "true") === "true",
  apiBase: import.meta.env.VITE_API_BASE || "http://localhost:8000",
  defaultLang: import.meta.env.VITE_DEFAULT_LANG || "tr"
};

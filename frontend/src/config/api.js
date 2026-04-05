const normalizeBase = (value) => {
  if (!value) return "";
  const trimmed = value.trim().replace(/\/$/, "");
  return trimmed.replace(/\/api$/, "");
};

const getDefaultBase = () => {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return "http://localhost:8000";
    }

    // In production, default to same-origin so platforms using rewrites/proxies keep working.
    return window.location.origin;
  }

  return "";
};

const configuredBase = normalizeBase(import.meta.env.VITE_API_BASE_URL);

export const API_BASE = configuredBase || getDefaultBase();
export const API_BASE_URL = `${API_BASE}/api`;

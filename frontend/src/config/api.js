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
  }

  // Fallback for deployed frontend when env var is not configured.
  return "https://mental-health-ai-companion-api.onrender.com";
};

const configuredBase = normalizeBase(import.meta.env.VITE_API_BASE_URL);

export const API_BASE = configuredBase || getDefaultBase();
export const API_BASE_URL = `${API_BASE}/api`;

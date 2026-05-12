//axios instance wit JWT
import axios from "axios";

// In dev, same-origin `/api` is proxied by Vite to the backend (see vite.config.js).
// In production, set VITE_API_URL to your deployed API (e.g. https://api.example.com/api).
const baseURL = import.meta.env.DEV
  ? "/api"
  : import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL,
  withCredentials: true,
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("fc_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global 401 handler — expired session on API calls; not for failed login/signup attempts.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const reqUrl = String(err.config?.url || "");
      const isAuthAttempt =
        reqUrl.includes("/auth/login") ||
        reqUrl.includes("/auth/signup/customer") ||
        reqUrl.includes("/auth/signup/vendor");
      if (isAuthAttempt) {
        return Promise.reject(err);
      }
      localStorage.removeItem("fc_token");
      if (!window.location.pathname.startsWith("/auth")) {
        window.location.href = "/auth";
      }
    }
    return Promise.reject(err);
  },
);

export default api;

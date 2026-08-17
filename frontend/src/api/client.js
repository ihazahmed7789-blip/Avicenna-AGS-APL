import axios from "axios";

// In Codespaces/Vite development, use the same-origin /api path and let Vite
// proxy it to the backend. This avoids localhost/public-port mismatches.
const API_BASE = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 20000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;

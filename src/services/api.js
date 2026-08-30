import axios from "axios";

// Backend URL environment variable se aa raha hai (Vite project ke liye VITE_ prefix zaroori hai)
const BASE_URL = import.meta.env.VITE_API_URL || "";

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("gym_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      localStorage.clear();
      window.location.href = "/";
    }
    return Promise.reject(err);
  }
);

export default api;
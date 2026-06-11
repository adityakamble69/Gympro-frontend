import axios from "axios";

const api = axios.create({ baseURL: "https://gympro-backend-production-2c21.up.railway.app/api" });

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
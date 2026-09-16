import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
});

const GET_TTL_MS = 20000;
const getCache = new Map();

const cacheKey = (config) =>
  `${(config.method || "get").toLowerCase()}:${config.url}:${JSON.stringify(config.params || {})}`;

export function clearApiCache() {
  getCache.clear();
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("gym_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;

  const method = (config.method || "get").toLowerCase();
  const skipCache = config.skipCache || config.responseType === "blob" || method !== "get";
  if (!skipCache) {
    const hit = getCache.get(cacheKey(config));
    if (hit && Date.now() - hit.at < GET_TTL_MS) {
      config.adapter = () =>
        Promise.resolve({
          data: hit.data,
          status: 200,
          statusText: "OK",
          headers: { "x-cache": "HIT" },
          config,
          request: {},
        });
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => {
    const method = (res.config.method || "get").toLowerCase();
    if (method === "get" && !res.config.skipCache && res.config.responseType !== "blob") {
      getCache.set(cacheKey(res.config), { at: Date.now(), data: res.data });
    }
    if (["post", "put", "patch", "delete"].includes(method)) {
      getCache.clear();
    }
    return res;
  },
  (err) => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      localStorage.clear();
      window.location.href = "/";
    }
    return Promise.reject(err);
  }
);

export default api;

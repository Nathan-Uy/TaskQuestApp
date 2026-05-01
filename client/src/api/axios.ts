import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token"); // ← was localStorage
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// axios.ts
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isAuthEndpoint = err.config?.url?.includes("/auth/");
    const skipRedirect = err.config?.headers?.["X-Skip-Auth-Redirect"];
    const hasToken = !!sessionStorage.getItem("token");

    if (
      err.response?.status === 401 &&
      !isAuthEndpoint &&
      !skipRedirect && // ← don't redirect on fetchMe 401
      hasToken
    ) {
      sessionStorage.removeItem("token");
      globalThis.location.href = "/";
    }
    return Promise.reject(err);
  },
);
export default api;

import axios, { AxiosError } from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const retryQueue = new Map<string, ReturnType<typeof setTimeout>>();

api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const config = err.config!;
    const status = err.response?.status;

    if (status === 401) {
      const isAuthEndpoint = config.url?.includes("/auth/");
      const skipRedirect = config.headers?.["X-Skip-Auth-Redirect"];
      const hasToken = !!sessionStorage.getItem("token");

      if (!isAuthEndpoint && !skipRedirect && hasToken) {
        sessionStorage.removeItem("token");
        globalThis.location.href = "/";
      }
      throw err;
    }

    if (status === 429) {
      const url = config.url ?? "unknown";

      if (retryQueue.has(url)) throw err; // ← was return Promise.reject(err)

      const retryAfterHeader = err.response?.headers?.["retry-after"];
      const retryAfterMs = retryAfterHeader
        ? Number(retryAfterHeader) * 1000
        : 5_000;

      console.warn(
        `[429] Rate limited on ${url}. Retrying in ${retryAfterMs}ms`,
      );

      return new Promise((resolve, reject) => {
        const timer = setTimeout(async () => {
          retryQueue.delete(url);
          try {
            resolve(await api(config));
          } catch (retryErr) {
            reject(retryErr);
          }
        }, retryAfterMs);

        retryQueue.set(url, timer);
      });
    }

    throw err;
  },
);

export default api;

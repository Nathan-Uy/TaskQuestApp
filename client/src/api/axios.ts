import axios, { AxiosError, AxiosHeaders } from "axios";
import { useAuthStore } from "@/stores/auth.store";

const getCookie = (name: string): string => {
  const cookieEntry = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${name}=`));

  return cookieEntry
    ? decodeURIComponent(cookieEntry.slice(name.length + 1))
    : "";
};

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const method = (config.method ?? "get").toLowerCase();
  const isMutationRequest = ["post", "put", "patch", "delete"].includes(method);
  const csrfToken = getCookie("csrfToken");

  if (isMutationRequest && csrfToken) {
    config.headers = new AxiosHeaders(config.headers || {});
    config.headers.set("X-CSRF-Token", csrfToken);
  }

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

      if (!isAuthEndpoint && !skipRedirect) {
        const auth = useAuthStore();

        if (auth.isAuthenticated) {
          await auth.logout().catch(() => undefined);
        }
      }
      throw err;
    }

    if (status === 429) {
      const url = config.url ?? "unknown";

      if (retryQueue.has(url)) throw err;

      const retryAfterHeader = err.response?.headers?.["retry-after"];
      const retryAfterMs = retryAfterHeader
        ? Number(retryAfterHeader) * 1000
        : 5_000;

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

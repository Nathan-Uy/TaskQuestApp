import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/api/axios";
import type { AppSettings } from "@/modules/Settings/settings.type";

export interface AuthUser {
  _id: string;
  displayName: string;
  email: string;
  avatar?: string;
  level: number;
  currentXP: number;
  xpToNextLevel: number;
  totalXP: number;
  streakDays: number;
  tasksCompleted: number;
  pomodorosDone: number;
  settings: AppSettings;
}

const hashPasswordSha256 = async (password: string) => {
  const bytes = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

export const useAuthStore = defineStore("auth", () => {
  const token = ref("");
  const user = ref<AuthUser | null>(null);
  const initialized = ref(false);
  const isAuthenticated = computed(() => !!user.value);
  const isLoggingIn = ref(false);

  const syncGamification = async (userData: AuthUser) => {
    const { useGamificationStore } = await import(
      /* @vite-ignore */ "@/components/sidebar.store"
    );
    const gamification = useGamificationStore();
    gamification.profile.displayName = userData.displayName;
    gamification.profile.level = userData.level;
    gamification.profile.currentXP = userData.currentXP;
    gamification.profile.xpToNextLevel = userData.xpToNextLevel;
    gamification.profile.totalXP = userData.totalXP;
    gamification.profile.streakDays = userData.streakDays;
    gamification.profile.tasksCompleted = userData.tasksCompleted;
    gamification.profile.pomodorosDone = userData.pomodorosDone;

    if (userData.settings) {
      const { useSettingsStore } = await import(
        /* @vite-ignore */ "@/modules/Settings/settings.store"
      );
      useSettingsStore().loadSettings(userData.settings);
    }
  };

  const syncStores = async () => {
    const { useQueryClient } = await import("@tanstack/vue-query");
    const queryClient = useQueryClient();
    queryClient.removeQueries({ queryKey: ["tasks"] });
    queryClient.removeQueries({ queryKey: ["goals"] });
  };

  const fetchCsrfToken = async () => {
    const { data } = await api.get("/auth/csrf-token");
    return data.csrfToken as string;
  };

  const login = async (email: string, password: string) => {
    isLoggingIn.value = true;
    try {
      const csrfToken = await fetchCsrfToken();
      const passwordHash = await hashPasswordSha256(password);
      const { data } = await api.post(
        "/auth/login",
        { email, password: passwordHash },
        { headers: { "X-CSRF-Token": csrfToken } },
      );
      token.value = data.token;
      user.value = data.user;
      initialized.value = true;
      await syncGamification(data.user);
    } finally {
      isLoggingIn.value = false;
    }
  };

  const register = async (
    displayName: string,
    email: string,
    password: string,
  ) => {
    isLoggingIn.value = true;
    try {
      const csrfToken = await fetchCsrfToken();
      const passwordHash = await hashPasswordSha256(password);
      const { data } = await api.post(
        "/auth/register",
        {
          displayName,
          email,
          password: passwordHash,
        },
        { headers: { "X-CSRF-Token": csrfToken } },
      );
      token.value = data.token;
      user.value = data.user;
      initialized.value = true;
      await syncGamification(data.user);
    } finally {
      isLoggingIn.value = false;
    }
  };

  const fetchMe = async () => {
    try {
      const { data } = await api.get("/auth/me", {
        headers: { "X-Skip-Auth-Redirect": "1" },
      });
      user.value = data;
      await syncGamification(data);
    } catch {
      token.value = "";
      user.value = null;
    } finally {
      initialized.value = true;
    }
  };

  const logout = async () => {
    try {
      const csrfToken = await fetchCsrfToken();
      await api.post("/auth/logout", undefined, {
        headers: { "X-CSRF-Token": csrfToken },
      });
    } catch {}

    token.value = "";
    user.value = null;
    initialized.value = false;

    const { default: router } = await import(
      /* @vite-ignore */ "@/router/router"
    );
    await router.push("/");
  };

  return {
    token,
    user,
    isAuthenticated,
    initialized,
    isLoggingIn,
    login,
    register,
    fetchMe,
    logout,
    syncStores,
    syncGamification,
  };
});

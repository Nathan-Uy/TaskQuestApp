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

export const useAuthStore = defineStore("auth", () => {
  const token = ref(sessionStorage.getItem("token") || "");
  const user = ref<AuthUser | null>(null);
  const initialized = ref(false);
  const isAuthenticated = computed(() => !!token.value || !!user.value);
  const isLoggingIn = ref(false);

  const syncGamification = async (userData: AuthUser) => {
    const { useGamificationStore } = await import("@/components/sidebar.store");
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
      const { useSettingsStore } =
        await import("@/modules/Settings/settings.store");
      useSettingsStore().loadSettings(userData.settings);
    }
  };

  const syncStores = async () => {
    const { useQueryClient } = await import("@tanstack/vue-query");
    const queryClient = useQueryClient();
    queryClient.removeQueries({ queryKey: ["tasks"] });
    queryClient.removeQueries({ queryKey: ["goals"] });
  };

  const googleLogin = async (credential: string) => {
    isLoggingIn.value = true;
    try {
      const { data } = await api.post("/auth/google", { credential });
      token.value = data.token;
      user.value = data.user;
      initialized.value = true;
      sessionStorage.setItem("token", data.token);
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
    } catch (err: any) {
      if (err.response?.status !== 401) console.error("fetchMe:", err);
      token.value = "";
      user.value = null;
      sessionStorage.removeItem("token");
    } finally {
      initialized.value = true;
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    token.value = "";
    user.value = null;
    initialized.value = false;
    sessionStorage.removeItem("token");

    const { default: router } = await import("@/router/router");
    await router.push("/");
  };

  return {
    token,
    user,
    isAuthenticated,
    initialized,
    isLoggingIn,
    googleLogin,
    fetchMe,
    logout,
    syncStores,
    syncGamification,
  };
});

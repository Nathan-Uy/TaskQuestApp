import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/api/axios";
import { useQueryClient } from "@tanstack/vue-query";

export interface AuthUser {
  _id: string;
  displayName: string;
  email: string;
  level: number;
  currentXP: number;
  xpToNextLevel: number;
  totalXP: number;
  streakDays: number;
  tasksCompleted: number;
  pomodorosDone: number;
  settings: {
    darkMode: boolean;
    themeColor: string;
    notifications: {
      pomodoroEnd: boolean;
      breakEnd: boolean;
      taskDue: boolean;
      dailyReminder: boolean;
      dailyReminderTime: string;
    };
  };
}

export const useAuthStore = defineStore("auth", () => {
  const token = ref(sessionStorage.getItem("token") || "");
  const user = ref<AuthUser | null>(null);
  const queryClient = useQueryClient();

  const isAuthenticated = computed(() => !!token.value);

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
  };

  const syncStores = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["tasks"] }),
      queryClient.invalidateQueries({ queryKey: ["goals"] }),
    ]);
  };

  const login = async (email: string, password: string) => {
    const { data } = await api.post("/auth/login", { email, password });
    token.value = data.token;
    user.value = data.user;
    sessionStorage.setItem("token", data.token);
    await syncGamification(data.user);
    await syncStores();
    import("@/router/router").then(({ setInitialized }) =>
      setInitialized(true),
    );
  };

  const register = async (
    displayName: string,
    email: string,
    password: string,
  ) => {
    const { data } = await api.post("/auth/register", {
      displayName,
      email,
      password,
    });
    token.value = data.token;
    user.value = data.user;
    sessionStorage.setItem("token", data.token);
    await syncGamification(data.user);
    await syncStores();
    import("@/router/router").then(({ setInitialized }) =>
      setInitialized(true),
    );
  };

  const fetchMe = async () => {
    try {
      const { data } = await api.get("/auth/me");
      user.value = data;
      await syncGamification(data);
    } catch {
      logout();
    }
  };

  const logout = () => {
    token.value = "";
    user.value = null;
    sessionStorage.removeItem("token");
    import("@/router/router").then(({ setInitialized }) =>
      setInitialized(false),
    );
  };

  return {
    token,
    user,
    isAuthenticated,
    login,
    register,
    fetchMe,
    logout,
    syncStores,
  };
});

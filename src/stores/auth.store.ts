import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/api/axios";

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

  const isAuthenticated = computed(() => !!token.value);

  const syncStores = async () => {
    const { useTasksStore } = await import("@/modules/Tasks/tasks.store");
    const { useGoalsStore } = await import("@/modules/Goals/goals.store");
    await Promise.all([
      useTasksStore().fetchTasks(),
      useGoalsStore().fetchGoals(),
    ]);
  };

  const login = async (email: string, password: string) => {
    const { data } = await api.post("/auth/login", { email, password });
    token.value = data.token;
    user.value = data.user;
    sessionStorage.setItem("token", data.token);
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
    await syncStores();
    import("@/router/router").then(({ setInitialized }) =>
      setInitialized(true),
    );
  };

  const fetchMe = async () => {
    try {
      const { data } = await api.get("/auth/me");
      user.value = data;
    } catch {
      logout();
    }
  };

  const logout = () => {
    token.value = "";
    user.value = null;
    sessionStorage.removeItem("token");

    // Reset router initialized flag
    import("@/router/router").then(({ setInitialized }) => {
      setInitialized(false);
    });
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

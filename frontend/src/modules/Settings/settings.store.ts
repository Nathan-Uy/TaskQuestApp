import { defineStore } from "pinia";
import { ref } from "vue";
import api from "@/api/axios";
import type { AppSettings, ThemeColor } from "./settings.type";
import { useGamificationStore } from "@/components/sidebar.store";
import { usePomodoroStore } from "@/modules/Pomodoro/pomodoro.store";

export const THEME_COLORS: Record<ThemeColor, Record<string, string>> = {
  terracotta: {
    "--accent": "#c2622a",
    "--accent-soft": "#f5e9e1",
    "--accent-hover": "#a8511f",
  },
  ocean: {
    "--accent": "#0077b6",
    "--accent-soft": "#e0f2fe",
    "--accent-hover": "#005f92",
  },
  forest: {
    "--accent": "#2d7a4f",
    "--accent-soft": "#e5f3ec",
    "--accent-hover": "#245f3d",
  },
  lavender: {
    "--accent": "#7c5cbf",
    "--accent-soft": "#f0ebfb",
    "--accent-hover": "#6347a3",
  },
  rose: {
    "--accent": "#be3455",
    "--accent-soft": "#fde8ed",
    "--accent-hover": "#9e2a46",
  },
};

const DARK_VARS: Record<string, string> = {
  "--surface-bg": "#1a1714",
  "--surface-card": "#242019",
  "--surface-hover": "#2e2924",
  "--surface-border": "#3a342d",
  "--surface-muted": "#2a2520",
  "--ink-primary": "#f5f0eb",
  "--ink-secondary": "#b0a89e",
  "--ink-muted": "#7a7068",
  "--card-bg": "#242019",
  "--card-border": "#3a342d",
  "--input-bg": "#2e2924",
  "--input-border": "#4a4238",
  "--input-text": "#f5f0eb",
  "--sidebar-bg": "#1e1b17",
  "--sidebar-border": "#3a342d",
  "--nav-hover": "#2e2924",
};

const LIGHT_VARS: Record<string, string> = {
  "--surface-bg": "#f7f6f3",
  "--surface-card": "#ffffff",
  "--surface-hover": "#f0ede8",
  "--surface-border": "#e8e4de",
  "--surface-muted": "#f2efe9",
  "--ink-primary": "#1a1714",
  "--ink-secondary": "#6b6560",
  "--ink-muted": "#a09890",
  "--card-bg": "#ffffff",
  "--card-border": "#e7e5e4",
  "--input-bg": "#ffffff",
  "--input-border": "#d6d3d1",
  "--input-text": "#1a1714",
  "--sidebar-bg": "#ffffff",
  "--sidebar-border": "#e7e5e4",
  "--nav-hover": "#f5f5f4",
};

export const useSettingsStore = defineStore("settings", () => {
  const gamificationStore = useGamificationStore();
  const pomodoroStore = usePomodoroStore();

  const settings = ref<AppSettings>({
    darkMode: false,
    themeColor: "terracotta",
    notifications: {
      pomodoroEnd: true,
      breakEnd: true,
      taskDue: false,
      dailyReminder: false,
      dailyReminderTime: "09:00",
    },
  });

  const applyTheme = () => {
    const root = document.documentElement;
    const modeVars = settings.value.darkMode ? DARK_VARS : LIGHT_VARS;
    const colorVars = THEME_COLORS[settings.value.themeColor];
    Object.entries({ ...modeVars, ...colorVars }).forEach(([k, v]) => {
      root.style.setProperty(k, v);
    });
    if (settings.value.darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  };

  const persistSettings = async () => {
    try {
      await api.patch("/auth/settings", settings.value);
    } catch {
      console.error("Failed to persist settings");
    }
  };

  const loadSettings = (incoming: Partial<AppSettings>) => {
    settings.value = {
      ...settings.value,
      ...incoming,
      themeColor:
        (incoming.themeColor as ThemeColor) ?? settings.value.themeColor,
      notifications: {
        ...settings.value.notifications,
        ...incoming.notifications,
      },
    };
    applyTheme();
  };

  const setDarkMode = async (val: boolean) => {
    settings.value.darkMode = val;
    applyTheme();
    await persistSettings();
  };

  const setThemeColor = async (color: ThemeColor) => {
    settings.value.themeColor = color;
    applyTheme();
    await persistSettings();
  };

  const updateNotifications = async (
    patch: Partial<AppSettings["notifications"]>,
  ) => {
    settings.value.notifications = {
      ...settings.value.notifications,
      ...patch,
    };
    await persistSettings();
  };

  const updateDisplayName = (name: string) => {
    gamificationStore.profile.displayName = name;
  };

  const resetData = async () => {
    const { useQueryClient } = await import("@tanstack/vue-query");
    const queryClient = useQueryClient();
    queryClient.setQueryData(["tasks"], []);
    queryClient.setQueryData(["goals"], []);
    pomodoroStore.history.splice(0);
    pomodoroStore.sessionsCompleted = 0;
    gamificationStore.profile.currentXP = 0;
    gamificationStore.profile.totalXP = 0;
    gamificationStore.profile.level = 1;
    gamificationStore.profile.xpToNextLevel = 100;
    gamificationStore.profile.tasksCompleted = 0;
    gamificationStore.profile.pomodorosDone = 0;
    gamificationStore.profile.streakDays = 0;
  };

  applyTheme();

  return {
    settings,
    applyTheme,
    loadSettings,
    setDarkMode,
    setThemeColor,
    updateNotifications,
    updateDisplayName,
    resetData,
    themeColors: THEME_COLORS,
  };
});

import { defineStore } from "pinia";
import { ref } from "vue";
import type { AppSettings, ThemeColor } from "./settings.type";
import { useGamificationStore } from "@/components/sidebar.store";
import { useTasksStore } from "@/modules/Tasks/tasks.store";
import { useGoalsStore } from "@/modules/Goals/goals.store";
import { usePomodoroStore } from "@/modules/Pomodoro/pomodoro.store";

const THEME_COLORS: Record<ThemeColor, Record<string, string>> = {
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
};

export const useSettingsStore = defineStore("settings", () => {
  const gamificationStore = useGamificationStore();
  const tasksStore = useTasksStore();
  const goalsStore = useGoalsStore();
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

  const setDarkMode = (val: boolean) => {
    settings.value.darkMode = val;
    applyTheme();
  };

  const setThemeColor = (color: ThemeColor) => {
    settings.value.themeColor = color;
    applyTheme();
  };

  const updateNotifications = (
    patch: Partial<AppSettings["notifications"]>,
  ) => {
    settings.value.notifications = {
      ...settings.value.notifications,
      ...patch,
    };
  };

  const updateDisplayName = (name: string) => {
    gamificationStore.profile.displayName = name;
  };

  const resetData = () => {
    tasksStore.tasks.splice(0);
    goalsStore.goals.splice(0);
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

  // Apply theme on init
  applyTheme();

  return {
    settings,
    applyTheme,
    setDarkMode,
    setThemeColor,
    updateNotifications,
    updateDisplayName,
    resetData,
    themeColors: THEME_COLORS,
  };
});

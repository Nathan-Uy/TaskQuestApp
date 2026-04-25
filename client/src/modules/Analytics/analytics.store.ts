import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type {
  AnalyticsPeriod,
  DailyStats,
  WeekdayStats,
  AnalyticsTotals,
} from "./analytics.type";
import { useTasksQuery } from "@/modules/Tasks/tasks.tanstack";
import { usePomodoroStore } from "@/modules/Pomodoro/pomodoro.store";

export const useAnalyticsStore = defineStore("analytics", () => {
  const period = ref<AnalyticsPeriod>("7d");

  const { data: tasks } = useTasksQuery();
  const pomodoroStore = usePomodoroStore();

  const getDaysArray = (p: AnalyticsPeriod): string[] => {
    const days = p === "7d" ? 7 : p === "30d" ? 30 : 90;
    return Array.from({ length: days }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      return d.toDateString();
    });
  };

  const getDailyStats = computed(() => (p: AnalyticsPeriod): DailyStats[] => {
    const days = getDaysArray(p);
    return days.map((dateStr) => {
      const tasksCompleted = (tasks.value ?? []).filter(
        (t) =>
          t.status === "completed" &&
          t.completedAt &&
          new Date(t.completedAt).toDateString() === dateStr,
      ).length;

      const pomodoroSessions = pomodoroStore.history.filter(
        (s) =>
          s.phase === "work" &&
          new Date(s.completedAt).toDateString() === dateStr,
      ).length;

      const xpEarned = tasksCompleted * 20 + pomodoroSessions * 25;

      return { date: dateStr, tasksCompleted, pomodoroSessions, xpEarned };
    });
  });

  const getWeekdayStats = computed(
    () =>
      (p: AnalyticsPeriod): WeekdayStats[] => {
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const days = p === "7d" ? 7 : p === "30d" ? 30 : 90;

        const stats = dayNames.map((day) => ({
          day,
          tasksCompleted: 0,
          pomodoroSessions: 0,
        }));

        (tasks.value ?? [])
          .filter((t) => {
            if (t.status !== "completed" || !t.completedAt) return false;
            return (
              Date.now() - new Date(t.completedAt).getTime() <=
              days * 24 * 60 * 60 * 1000
            );
          })
          .forEach((t) => {
            const dow = new Date(t.completedAt!).getDay();
            const stat = stats[dow];
            if (stat) stat.tasksCompleted++;
          });

        pomodoroStore.history
          .filter((s) => {
            if (s.phase !== "work") return false;
            return (
              Date.now() - new Date(s.completedAt).getTime() <=
              days * 24 * 60 * 60 * 1000
            );
          })
          .forEach((s) => {
            const dow = new Date(s.completedAt).getDay();
            const stat = stats[dow];
            if (stat) stat.pomodoroSessions++;
          });

        return stats;
      },
  );

  const getTotals = computed(() => (p: AnalyticsPeriod): AnalyticsTotals => {
    const daily = getDailyStats.value(p);
    return {
      tasksCompleted: daily.reduce((s, d) => s + d.tasksCompleted, 0),
      pomodoroSessions: daily.reduce((s, d) => s + d.pomodoroSessions, 0),
      xpEarned: daily.reduce((s, d) => s + d.xpEarned, 0),
    };
  });

  return {
    period,
    getDailyStats,
    getWeekdayStats,
    getTotals,
  };
});

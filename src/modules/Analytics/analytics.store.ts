import { defineStore } from "pinia";
import { useTasksStore } from "@/modules/Tasks/tasks.store";
import { usePomodoroStore } from "@/modules/Pomodoro/pomodoro.store";
import { useGamificationStore } from "@/components/sidebar.store";
import type {
  DailyStats,
  WeekdayStats,
  AnalyticsPeriod,
} from "@/modules/Analytics/analytics.type";

export const useAnalyticsStore = defineStore("analytics", () => {
  const tasksStore = useTasksStore();
  const pomodoroStore = usePomodoroStore();
  const gamificationStore = useGamificationStore();

  const getDaysArray = (period: AnalyticsPeriod): string[] => {
    const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
    return Array.from({ length: days }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      return d.toDateString();
    });
  };

  const getDailyStats = (period: AnalyticsPeriod): DailyStats[] => {
    const days = getDaysArray(period);

    return days.map((dateStr) => {
      const tasksCompleted = tasksStore.tasks.filter(
        (t) =>
          t.status === "completed" && t.completedAt?.toDateString() === dateStr,
      ).length;

      const pomodoroSessions = pomodoroStore.history.filter(
        (s) => s.phase === "work" && s.completedAt.toDateString() === dateStr,
      ).length;

      const xpEarned = tasksCompleted * 20 + pomodoroSessions * 25;

      return { date: dateStr, tasksCompleted, pomodoroSessions, xpEarned };
    });
  };

  const getWeekdayStats = (period: AnalyticsPeriod): WeekdayStats[] => {
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;

    const stats = dayNames.map((day) => ({
      day,
      tasksCompleted: 0,
      pomodoroSessions: 0,
    }));

    tasksStore.tasks
      .filter((t) => {
        if (t.status !== "completed" || !t.completedAt) return false;
        const diffMs = Date.now() - t.completedAt.getTime();
        return diffMs <= days * 24 * 60 * 60 * 1000;
      })
      .forEach((t) => {
        const dow = new Date(t.completedAt!).getDay();
        const stat = stats[dow];
        if (stat) stat.tasksCompleted++;
      });

    pomodoroStore.history
      .filter((s) => {
        if (s.phase !== "work") return false;
        const diffMs = Date.now() - s.completedAt.getTime();
        return diffMs <= days * 24 * 60 * 60 * 1000;
      })
      .forEach((s) => {
        const dow = new Date(s.completedAt).getDay();
        const stat = stats[dow];
        if (stat) stat.pomodoroSessions++;
      });
    return stats;
  };

  const getTotals = (period: AnalyticsPeriod) => {
    const daily = getDailyStats(period);
    return {
      tasksCompleted: daily.reduce((s, d) => s + d.tasksCompleted, 0),
      pomodoroSessions: daily.reduce((s, d) => s + d.pomodoroSessions, 0),
      xpEarned: daily.reduce((s, d) => s + d.xpEarned, 0),
    };
  };

  return {
    getDailyStats,
    getWeekdayStats,
    getTotals,
  };
});

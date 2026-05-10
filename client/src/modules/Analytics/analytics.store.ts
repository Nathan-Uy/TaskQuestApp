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
import type { Task } from "@/modules/Tasks/tasks.type";
import type { PomodoroSession } from "@/modules/Pomodoro/pomodoro.type";

// ── Helpers ───────────────────────────────────────────────────────────────────

const periodToDays = (p: AnalyticsPeriod): number => {
  if (p === "7d") return 7;
  if (p === "30d") return 30;
  return 90;
};

const getDaysArray = (p: AnalyticsPeriod): string[] => {
  const days = periodToDays(p);
  return Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    return d.toDateString();
  });
};

const isWithinPeriod = (date: Date, days: number): boolean =>
  Date.now() - date.getTime() <= days * 24 * 60 * 60 * 1000;

const countTasksForDate = (tasks: Task[], dateStr: string): number =>
  tasks.filter(
    (t) =>
      t.status === "completed" &&
      t.completedAt &&
      new Date(t.completedAt).toDateString() === dateStr,
  ).length;

const countPomodorosForDate = (
  sessions: PomodoroSession[],
  dateStr: string,
): number =>
  sessions.filter(
    (s) =>
      s.phase === "work" && new Date(s.completedAt).toDateString() === dateStr,
  ).length;

// ── Store ─────────────────────────────────────────────────────────────────────

export const useAnalyticsStore = defineStore("analytics", () => {
  const period = ref<AnalyticsPeriod>("7d");

  const { data: tasks } = useTasksQuery();
  const pomodoroStore = usePomodoroStore();

  const getDailyStats = computed(
    () =>
      (p: AnalyticsPeriod): DailyStats[] =>
        getDaysArray(p).map((dateStr) => {
          const tasksCompleted = countTasksForDate(tasks.value ?? [], dateStr);
          const pomodoroSessions = countPomodorosForDate(
            pomodoroStore.history,
            dateStr,
          );
          const xpEarned = tasksCompleted * 25 + pomodoroSessions * 25;
          return { date: dateStr, tasksCompleted, pomodoroSessions, xpEarned };
        }),
  );

  const getWeekdayStats = computed(
    () =>
      (p: AnalyticsPeriod): WeekdayStats[] => {
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const days = periodToDays(p);

        const stats = dayNames.map((day) => ({
          day,
          tasksCompleted: 0,
          pomodoroSessions: 0,
        }));

        const completedTasks = (tasks.value ?? []).filter(
          (t) =>
            t.status === "completed" &&
            !!t.completedAt &&
            isWithinPeriod(new Date(t.completedAt), days),
        );

        for (const t of completedTasks) {
          const stat = stats[new Date(t.completedAt!).getDay()];
          if (stat) stat.tasksCompleted++;
        }

        const completedPomodoros = pomodoroStore.history.filter(
          (s) =>
            s.phase === "work" && isWithinPeriod(new Date(s.completedAt), days),
        );

        for (const s of completedPomodoros) {
          const stat = stats[new Date(s.completedAt).getDay()];
          if (stat) stat.pomodoroSessions++;
        }

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

  return { period, getDailyStats, getWeekdayStats, getTotals };
});

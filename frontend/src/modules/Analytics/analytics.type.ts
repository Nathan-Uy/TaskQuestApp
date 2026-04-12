export type AnalyticsPeriod = "7d" | "30d" | "90d";

export interface DailyStats {
  date: string;
  tasksCompleted: number;
  pomodoroSessions: number;
  xpEarned: number;
}

export interface WeekdayStats {
  day: string;
  tasksCompleted: number;
  pomodoroSessions: number;
}

export interface AnalyticsTotals {
  tasksCompleted: number;
  pomodoroSessions: number;
  xpEarned: number;
}

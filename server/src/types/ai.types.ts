import type { IGoal } from "../types/goals.types";
import type { ITask } from "../types/tasks.types";
import type { IUser } from "../types/user.types";

export interface ReportData {
  user: IUser | null;
  tasks: ITask[];
  goals: IGoal[];
  byDay: Record<string, number>;
  xpEarned: number;
  mostProductiveDay: string;
  priorityBreakdown: {
    high: number;
    medium: number;
    low: number;
  };
}

export interface ReportPeriod {
  start: Date;
  end: Date;
  label: string;
}

export interface GoalHealth {
  status: "on-track" | "at-risk" | "behind";
  summary: string;
  nextAction: string;
  recommendation: string;
}

export interface DailyFocusItem {
  taskId: string;
  title: string;
  reason: string;
  suggestedDuration: number;
}

export interface DailyFocusResult {
  focus: DailyFocusItem[];
  overallStrategy: string;
}

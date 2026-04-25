import type { IGoal } from "../types/goals.types";
import type { IPersonalTask } from "../types/personalTask.types";
import type { IUser } from "../types/user.types";

export interface ReportData {
  user: IUser | null;
  tasks: IPersonalTask[];
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

export interface TaskDescription {
  notes: string;
  duration: number;
}

export interface TriagedTask {
  taskId: string;
  title: string;
  action: "reschedule" | "delegate" | "drop";
  reason: string;
}

export interface GoalSuggestion {
  title: string;
  description: string;
}

export interface StreakCoach {
  habit: string;
  why: string;
  howToStart: string;
}

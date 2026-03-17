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

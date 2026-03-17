export interface TaskDescriptionResult {
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

export interface ReportData {
  period: string;
  tasksCompleted: number;
  goalsCompleted: number;
  xpEarned: number;
  priorityBreakdown: { high: number; medium: number; low: number };
  productivityByDay: Record<string, number>;
  mostProductiveDay: string;
  bullets: string[];
}

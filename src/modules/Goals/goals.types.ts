export type GoalStatus = "active" | "completed" | "archived";
export type GoalTimeframe = "daily" | "weekly" | "monthly" | "yearly";

export interface Goal {
  id: number;
  title: string;
  description?: string;
  timeframe: GoalTimeframe;
  status: GoalStatus;
  xpReward: number;
  linkedTaskIds: number[];
  createdAt: Date;
  completedAt?: Date;
  deadline?: Date;
}

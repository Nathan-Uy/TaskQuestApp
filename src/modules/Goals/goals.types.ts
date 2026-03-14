export type GoalStatus = "active" | "completed" | "archived";
export type GoalTimeframe = "daily" | "weekly" | "monthly" | "yearly";

export interface Goal {
  _id: string;
  title: string;
  description?: string;
  timeframe: GoalTimeframe;
  status: GoalStatus;
  xpReward: number;
  linkedTaskIds: string[];
  createdAt: Date;
  completedAt?: Date;
  deadline?: Date;
}

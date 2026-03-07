export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "active" | "completed";

export interface Task {
  id: number;
  title: string;
  notes?: string;
  priority: TaskPriority;
  categoryId?: string;
  goalId?: number;
  duration: number;
  remainingTime: number;
  isRunning: boolean;
  xpReward: number;
  status: TaskStatus;
  createdAt: Date;
  completedAt?: Date;
}

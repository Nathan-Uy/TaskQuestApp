export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "active" | "completed";

export interface Task {
  _id: string;
  id?: number;
  title: string;
  notes?: string;
  priority: TaskPriority;
  categoryId?: string;
  goalId?: string;
  duration: number;
  remainingTime?: number;
  isRunning?: boolean;
  xpReward: number;
  status: TaskStatus;
  createdAt: Date;
  completedAt?: Date;
  dueDate?: Date;
}

export interface CreateTaskPayload {
  title: string;
  priority: TaskPriority;
  duration: number;
  notes?: string;
  dueDate?: Date;
}

export interface CompleteTaskResponse {
  task: Task;
  user: {
    level: number;
    currentXP: number;
    xpToNextLevel: number;
    totalXP: number;
    tasksCompleted: number;
  };
}

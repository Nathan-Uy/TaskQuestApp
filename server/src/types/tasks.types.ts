import { Document } from "mongoose";

export type TaskStatus = "todo" | "in-progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface ITask extends Document {
  sprintId: string;
  teamId: string;
  title: string;
  description: string;
  taskType: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: string | null;
  createdBy: string;
  duration: number | null;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskBody {
  title: string;
  description?: string;
  taskType?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  assignedTo?: string | null;
  duration?: number | null;
  dueDate?: string | Date | null;
}

export interface UpdateTaskBody {
  title?: string;
  description?: string;
  taskType?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedTo?: string | null;
  duration?: number | null;
  dueDate?: string | Date | null;
}

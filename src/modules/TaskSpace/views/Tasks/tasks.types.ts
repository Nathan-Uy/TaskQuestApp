export type TaskStatus = "todo" | "in-progress" | "done";
export type TaskPriority = "low" | "medium" | "high";
export type TaskType =
  | "Frontend"
  | "Backend"
  | "Testing"
  | "Integration"
  | "Research and Development"
  | "Design"
  | "DevOps";

export interface Task {
  _id: string;
  sprintId: string;
  teamId: string;
  title: string;
  description?: string;
  taskType?: TaskType | string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: string;
  createdBy: string;
  duration?: number;
  dueDate?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  taskType?: TaskType | string;
  priority?: TaskPriority;
  status?: TaskStatus;
  assignedTo?: string;
  duration?: number;
  dueDate?: string | null;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  taskType?: TaskType | string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedTo?: string;
  duration?: number;
  dueDate?: string | null;
}

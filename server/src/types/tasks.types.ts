import { Document } from "mongoose";

export interface ITask extends Document {
  sprintId: string;
  teamId: string;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "done";
  priority: "low" | "medium" | "high";
  assignedTo?: string;
  createdBy: string;
  duration?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskBody {
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  assignedTo?: string;
  duration?: number;
}

export interface UpdateTaskBody {
  title?: string;
  description?: string;
  status?: "todo" | "in-progress" | "done";
  priority?: "low" | "medium" | "high";
  assignedTo?: string;
  duration?: number;
}

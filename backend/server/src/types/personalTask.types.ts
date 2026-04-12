import { Document } from "mongoose";

export interface IPersonalTask extends Document {
  userId: string;
  title: string;
  notes: string;
  priority: "low" | "medium" | "high";
  status: "active" | "completed";
  duration: number;
  xpReward: number;
  dueDate?: Date | null;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePersonalTaskDto {
  title: string;
  notes?: string;
  priority?: "low" | "medium" | "high";
  duration?: number;
  dueDate?: string | null;
}

export interface UpdatePersonalTaskDto {
  title?: string;
  notes?: string;
  status?: "active" | "completed";
  priority?: "low" | "medium" | "high";
  duration?: number;
  dueDate?: string | null;
}

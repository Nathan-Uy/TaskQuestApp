import { Types, Document } from "mongoose";

export interface ITask extends Document {
  userId: Types.ObjectId;
  title: string;
  notes?: string;
  priority: "low" | "medium" | "high";
  status: "active" | "completed";
  xpReward: number;
  duration: number;
  dueDate?: Date;
  completedAt?: Date;
}
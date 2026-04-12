import { Types, Document } from "mongoose";

export interface IGoal extends Document {
  userId: Types.ObjectId;
  title: string;
  description?: string;
  timeframe: "daily" | "weekly" | "monthly" | "yearly";
  status: "active" | "completed" | "archived";
  xpReward: number;
  linkedTaskIds: Types.ObjectId[];
  deadline?: Date;
  completedAt?: Date;
}

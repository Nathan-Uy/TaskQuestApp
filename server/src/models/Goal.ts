import { Schema, model, Document, Types } from "mongoose";

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

const GoalSchema = new Schema<IGoal>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String },
    timeframe: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly"],
      default: "weekly",
    },
    status: {
      type: String,
      enum: ["active", "completed", "archived"],
      default: "active",
    },
    xpReward: { type: Number, default: 100 },
    linkedTaskIds: [{ type: Schema.Types.ObjectId, ref: "Task" }],
    deadline: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true },
);

export const Goal = model<IGoal>("Goal", GoalSchema);

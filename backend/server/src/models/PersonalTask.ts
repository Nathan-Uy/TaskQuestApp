import { Schema, model } from "mongoose";
import { IPersonalTask } from "../types/personalTask.types";

const XP_MAP: Record<string, number> = {
  low: 10,
  medium: 20,
  high: 35,
};

const PersonalTaskSchema = new Schema<IPersonalTask>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    notes: { type: String, default: "" },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    status: { type: String, enum: ["active", "completed"], default: "active" },
    duration: { type: Number, default: 1500 },
    xpReward: { type: Number, default: 20 },
    dueDate: { type: Date, default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export default model<IPersonalTask>("PersonalTask", PersonalTaskSchema);

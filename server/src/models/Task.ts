import { Schema, model } from "mongoose";
import type{ ITask } from "../types/tasks.types";

const TaskSchema = new Schema<ITask>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    notes: { type: String },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    status: { type: String, enum: ["active", "completed"], default: "active" },
    xpReward: { type: Number, default: 25 },
    duration: { type: Number, default: 1500 },
    dueDate: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true },
);

export const Task = model<ITask>("Task", TaskSchema);

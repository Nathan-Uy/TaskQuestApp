import { Schema, model, Document, Types } from "mongoose";

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

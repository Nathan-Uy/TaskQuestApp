import { Schema, model } from "mongoose";
import { ITask } from "../types/tasks.types";

const TaskSchema = new Schema<ITask>(
  {
    sprintId: { type: String, required: true, ref: "Sprint", index: true },
    teamId: { type: String, required: true, ref: "Team", index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    status: {
      type: String,
      enum: ["todo", "in-progress", "done"],
      default: "todo",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    assignedTo: { type: String, default: null },
    createdBy: { type: String, required: true },
    duration: { type: Number, default: null },
  },
  { timestamps: true },
);

TaskSchema.index({ sprintId: 1 });
TaskSchema.index({ teamId: 1 });

export default model<ITask>("Task", TaskSchema);

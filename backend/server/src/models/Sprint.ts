import { Schema, model } from "mongoose";
import { ISprint } from "../types/sprint.types";

const SprintSchema = new Schema<ISprint>(
  {
    teamId: { type: String, required: true, ref: "Team", index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["planning", "active", "completed"],
      default: "planning",
    },
  },
  { timestamps: true },
);

export default model<ISprint>("Sprint", SprintSchema);

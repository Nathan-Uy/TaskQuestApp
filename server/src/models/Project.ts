import { Schema, model } from "mongoose";
import type { IProject } from "../types/project.types";

const ProjectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    owner: { type: String, required: true },
  },
  { timestamps: true },
);

export default model<IProject>("Project", ProjectSchema);

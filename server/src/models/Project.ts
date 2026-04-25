import { Schema, model } from "mongoose";
import type { IProject } from "../types/project.types";

const ProjectMemberSchema = new Schema(
  {
    userId: { type: String, required: true },
    email: { type: String, required: true },
    name: { type: String, required: true },
    role: {
      type: String,
      enum: ["owner", "admin", "member"],
      default: "member",
    },
    joinedAt: { type: Date, default: Date.now },
    inviteStatus: {
      type: String,
      enum: ["pending", "accepted"],
      default: "accepted",
    },
  },
  { _id: false },
);

const ProjectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    owner: { type: String, required: true },
    members: [ProjectMemberSchema],
    color: { type: String, default: null },
    coverPhoto: { type: String, default: null },
  },
  { timestamps: true },
);

export default model<IProject>("Project", ProjectSchema);

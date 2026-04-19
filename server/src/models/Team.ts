import { Schema, model } from "mongoose";
import type { ITeamMember, ITeam } from "../types/team.types";

const TeamMemberSchema = new Schema<ITeamMember>({
  userId: { type: String, required: true },
  email: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ["owner", "admin", "member"], default: "member" },
  joinedAt: { type: Date, default: Date.now },
  inviteStatus: {
    type: String,
    enum: ["pending", "accepted"],
    default: "accepted",
  },
});

const TeamSchema = new Schema<ITeam>(
  {
    projectId: { type: String, required: true, ref: "Project" },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    owner: { type: String, required: true },
    members: [TeamMemberSchema],
    color: { type: String, default: null },
    coverPhoto: { type: String, default: null },
  },
  { timestamps: true },
);

TeamSchema.index({ projectId: 1 });

export default model<ITeam>("Team", TeamSchema);

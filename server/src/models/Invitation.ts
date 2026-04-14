import { Schema, model, Document } from "mongoose";

export interface IInvitation extends Document {
  projectId: string;
  projectName: string;
  inviterId: string;
  inviterName: string;
  inviteeId: string;
  inviteeEmail: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

const InvitationSchema = new Schema<IInvitation>(
  {
    projectId: { type: String, required: true },
    projectName: { type: String, required: true },
    inviterId: { type: String, required: true },
    inviterName: { type: String, required: true },
    inviteeId: { type: String, required: true },
    inviteeEmail: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true },
);

InvitationSchema.index({ inviteeId: 1, status: 1 });
InvitationSchema.index({ projectId: 1 });

export default model<IInvitation>("Invitation", InvitationSchema);

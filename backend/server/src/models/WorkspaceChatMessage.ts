import { Schema, model, Document, Types } from "mongoose";

export interface IChatMessageDocument extends Document {
  teamId: Types.ObjectId;
  userId: string;
  userName: string;
  userEmail: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

const chatMessageSchema = new Schema<IChatMessageDocument>(
  {
    teamId: {
      type: Schema.Types.ObjectId,
      ref: "WorkspaceTeam",
      required: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

chatMessageSchema.index({ teamId: 1, createdAt: -1 });

export default model<IChatMessageDocument>(
  "WorkspaceChatMessage",
  chatMessageSchema,
);

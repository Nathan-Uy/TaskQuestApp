import { Schema, model, Document } from 'mongoose';
import { IChatMessage } from '../types/workspace.types';

interface IChatMessageDocument extends Omit<IChatMessage, '_id'>, Document {}

const chatMessageSchema = new Schema<IChatMessageDocument>(
  {
    teamId: {
      type: String,
      required: true,
      ref: 'WorkspaceTeam',
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
  }
);

chatMessageSchema.index({ teamId: 1, createdAt: -1 });

export default model<IChatMessageDocument>('WorkspaceChatMessage', chatMessageSchema);

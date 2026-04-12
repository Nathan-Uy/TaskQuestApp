import { Schema, model, Document } from 'mongoose';
import { ITeam, ITeamMember } from '../types/workspace.types';

interface ITeamDocument extends Omit<ITeam, '_id'>, Document {}

const teamMemberSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['owner', 'admin', 'member'],
    default: 'member',
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
  inviteStatus: {
    type: String,
    enum: ['pending', 'accepted'],
    default: 'pending',
  },
});

const teamSchema = new Schema<ITeamDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    owner: {
      type: String,
      required: true,
    },
    members: [teamMemberSchema],
  },
  {
    timestamps: true,
  }
);

teamSchema.index({ owner: 1 });
teamSchema.index({ 'members.userId': 1 });

export default model<ITeamDocument>('WorkspaceTeam', teamSchema);

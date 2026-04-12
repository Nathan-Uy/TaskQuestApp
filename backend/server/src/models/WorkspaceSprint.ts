import { Schema, model, Document } from 'mongoose';
import { ISprint } from '../types/workspace.types';

interface ISprintDocument extends Omit<ISprint, '_id'>, Document {}

const sprintSchema = new Schema<ISprintDocument>(
  {
    teamId: {
      type: String,
      required: true,
      ref: 'WorkspaceTeam',
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['planning', 'active', 'completed'],
      default: 'planning',
    },
  },
  {
    timestamps: true,
  }
);

sprintSchema.index({ teamId: 1 });
sprintSchema.index({ status: 1 });

export default model<ISprintDocument>('WorkspaceSprint', sprintSchema);

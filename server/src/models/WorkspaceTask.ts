import { Schema, model, Document } from 'mongoose';
import { IWorkspaceTask } from '../types/workspace.types';

interface IWorkspaceTaskDocument extends Omit<IWorkspaceTask, '_id'>, Document {}

const workspaceTaskSchema = new Schema<IWorkspaceTaskDocument>(
  {
    sprintId: {
      type: String,
      required: true,
      ref: 'WorkspaceSprint',
    },
    teamId: {
      type: String,
      required: true,
      ref: 'WorkspaceTeam',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'done'],
      default: 'todo',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    assignedTo: {
      type: String,
      default: null,
    },
    createdBy: {
      type: String,
      required: true,
    },
    dueDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

workspaceTaskSchema.index({ sprintId: 1 });
workspaceTaskSchema.index({ teamId: 1 });
workspaceTaskSchema.index({ status: 1 });
workspaceTaskSchema.index({ assignedTo: 1 });

export default model<IWorkspaceTaskDocument>('WorkspaceTask', workspaceTaskSchema);

// Workspace Types

export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';
export type MemberRole = 'owner' | 'admin' | 'member';

export interface ITeamMember {
  userId: string;
  email: string;
  name: string;
  role: MemberRole;
  joinedAt?: Date;
  inviteStatus: 'pending' | 'accepted';
}

export interface ITeam {
  name: string;
  description?: string;
  owner: string; // userId
  members: ITeamMember[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISprint {
  teamId: string;
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  status: 'planning' | 'active' | 'completed';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IWorkspaceTask {
  sprintId: string;
  teamId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: string | null; // userId
  createdBy: string; // userId
  createdAt?: Date;
  updatedAt?: Date;
  dueDate?: Date | null;
}

export interface IChatMessage {
  teamId: string;
  userId: string;
  userName: string;
  userEmail: string;
  message: string;
  createdAt?: Date;
}

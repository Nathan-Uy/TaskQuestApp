// Workspace Types

export type TaskStatus = "todo" | "in-progress" | "done";
export type TaskPriority = "low" | "medium" | "high";
export type MemberRole = "owner" | "admin" | "member";

export interface ITeamMember {
  userId: string;
  email: string;
  name: string;
  role: MemberRole;
  joinedAt?: Date;
  inviteStatus: "pending" | "accepted";
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
  status: "planning" | "active" | "completed";
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
  assignedTo?: string | null; // userId of the owner
  ownerName?: string | null; // display name of the owner (denormalized)
  createdBy: string; // userId of creator
  createdAt?: Date;
  updatedAt?: Date;
  dueDate?: Date | null; // keep for backward compatibility
  duration?: number | null; // estimated hours
}

export interface IChatMessage {
  _id: string;
  userId?: string;
  userName?: string;
  message?: string;
  content?: string;
  createdAt?: string | null;
  sender?: {
    _id?: string;
    name?: string;
  };
  user?: {
    _id?: string;
    name?: string;
  };
}

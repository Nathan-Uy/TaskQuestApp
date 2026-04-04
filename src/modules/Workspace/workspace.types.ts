export interface TeamMember {
  userId: string;
  email: string;
  name: string;
  role: "owner" | "admin" | "member";
  joinedAt: Date;
  inviteStatus: "pending" | "accepted";
}

export interface Team {
  _id: string;
  name: string;
  description?: string;
  owner: string;
  members: TeamMember[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Sprint {
  _id: string;
  teamId: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: "planning" | "active" | "completed";
  createdAt: Date;
  updatedAt: Date;
}

export type TaskStatus = "todo" | "in-progress" | "done";
export type TaskPriority = "low" | "medium" | "high";
export type MemberRole = "owner" | "admin" | "member";


export interface WorkspaceTask {
  _id: string;
  sprintId: string;
  teamId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: string | null;
  createdBy: string;
  ownerId?: string; 
  ownerName?: string; 
  duration?: number | null; 
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ChatMessage {
  _id: string;
  sender?: string;
  name: string;
  userId: string;
  userName: string;
  content: string;
  userEmail?: string; // Add this
  message: string;
  createdAt: string | null;
  displayName?: string;
}

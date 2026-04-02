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

export interface WorkspaceTask {
  _id: string;
  sprintId: string;
  teamId: string;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "done";
  priority: "low" | "medium" | "high";
  assignedTo?: string | null;
  createdBy: string;
  dueDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  _id: string;
  teamId: string;
  userId: string;
  userName: string;
  userEmail: string;
  message: string;
  createdAt: Date;
}

export interface Team {
  _id: string;
  teamName: string;
  description: string;
  ownerId: string;
  members: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Sprint {
  _id: string;
  teamId: string;
  name: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceTask {
  _id: string;
  sprintId: string;
  title: string;
  description: string;
  assignedTo: string | null;
  status: "todo" | "in-progress" | "done";
  priority: "low" | "medium" | "high";
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  _id: string;
  userId: string;
  teamId: string;
  displayName: string;
  email: string;
  role: "owner" | "admin" | "member";
  joinedAt: string;
}

export interface ChatMessage {
  _id: string;
  teamId: string;
  userId: string;
  displayName: string;
  content: string;
  createdAt: string;
}

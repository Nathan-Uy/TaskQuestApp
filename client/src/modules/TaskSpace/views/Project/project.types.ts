export interface ProjectMember {
  userId: string;
  email: string;
  name: string;
  role: "owner" | "admin" | "member";
  joinedAt: Date;
  inviteStatus: "pending" | "accepted";
}

export interface Project {
  _id: string;
  name: string;
  description: string;
  owner: string;
  members: ProjectMember[];
  color?: string | null;
  coverPhoto?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectDto {
  name: string;
  description?: string;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
}

export interface AddMemberDto {
  email: string;
  role?: "admin" | "member";
}

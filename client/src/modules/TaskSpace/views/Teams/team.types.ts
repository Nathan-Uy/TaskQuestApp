export interface TeamMember {
  userId: string;
  email: string;
  name: string;
  role: "owner" | "admin" | "member";
  joinedAt: Date | string;
}

export interface Team {
  _id: string;
  projectId: string;
  name: string;
  description?: string;
  owner: string;
  members: TeamMember[];
  createdAt: Date | string;
  updatedAt: Date | string;
  color?: string | null;
  coverPhoto?: string | null;
}

export interface CreateTeamDto {
  name: string;
  description?: string;
}

export interface UpdateTeamDto {
  name?: string;
  description?: string;
}

export interface AddMemberDto {
  email: string;
  role?: MemberRole;
}

export interface MemberRole {
  role?: "admin" | "member";
}

import { Document } from "mongoose";

export interface ITeamMember {
  userId: string;
  email: string;
  name: string;
  role: "owner" | "admin" | "member";
  joinedAt: Date;
  inviteStatus: "pending" | "accepted";
}

export interface ITeam extends Document {
  projectId: string;
  name: string;
  description: string;
  owner: string; // userId of the creator
  members: ITeamMember[];
  createdAt: Date;
  updatedAt: Date;
  color?: string;
  coverPhoto?: string;
}

// DTOs for API requests
export interface CreateTeamBody {
  name: string;
  description?: string;
}

export interface UpdateTeamBody {
  name?: string;
  description?: string;
}

export interface AddMemberBody {
  email: string;
  role?: "admin" | "member";
}

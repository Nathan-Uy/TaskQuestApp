import { Document } from "mongoose";

export interface IProjectMember {
  userId: string;
  email: string;
  name: string;
  role: "owner" | "admin" | "member";
  joinedAt: Date;
  inviteStatus: "pending" | "accepted";
}

export interface IProject extends Document {
  name: string;
  description: string;
  owner: string;
  members: IProjectMember[];
  createdAt: Date;
  updatedAt: Date;
  color?: string | null;
  coverPhoto?: string | null;
}

export interface CreateProjectBody {
  name: string;
  description?: string;
}

export interface UpdateProjectBody {
  name?: string;
  description?: string;
}

export interface AddMemberBody {
  email: string;
  role?: "admin" | "member";
}

export interface RemoveMemberBody {
  userId: string;
}

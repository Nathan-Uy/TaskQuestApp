// Backend types – used by Mongoose models and controllers

import { Document } from "mongoose";

export interface IProjectMember {
  userId: string;
  email: string;
  name: string;
  role: "owner" | "admin" | "member";
  joinedAt: Date;
}

export interface IProject extends Document {
  name: string;
  description: string;
  owner: string;
  members: IProjectMember[];
  createdAt: Date;
  updatedAt: Date;
}

// DTOs for request bodies
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

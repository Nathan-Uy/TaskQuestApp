import { Document } from "mongoose";

export interface IProject extends Document {
  name: string;
  description: string;
  owner: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectBody {
  name: string;
  description?: string;
}

export interface UpdateProjectBody {
  name?: string;
  description?: string;
}

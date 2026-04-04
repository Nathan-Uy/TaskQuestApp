import { Document } from "mongoose";

export interface ISprint extends Document {
  teamId: string;
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  status: "planning" | "active" | "completed";
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSprintBody {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  status?: "planning" | "active" | "completed";
}

export interface UpdateSprintBody {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: "planning" | "active" | "completed";
}

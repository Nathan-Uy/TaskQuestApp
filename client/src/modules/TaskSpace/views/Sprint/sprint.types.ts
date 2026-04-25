export interface Sprint {
  _id: string;
  teamId: string;
  name: string;
  description?: string;
  startDate: string | Date;
  endDate: string | Date;
  status: SprintStatus;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CreateSprintDto {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  status?: SprintStatus;
}

export interface UpdateSprintDto {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: SprintStatus;
}

export type SprintStatus = "planning" | "active" | "completed";

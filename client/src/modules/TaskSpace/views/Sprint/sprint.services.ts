import api from "@/api/axios";
import type { Sprint, CreateSprintDto, UpdateSprintDto } from "./sprint.types";

export const sprintApi = {
  getSprints: (teamId: string) => api.get<Sprint[]>(`/sprints/team/${teamId}`),
  getSprint: (sprintId: string) => api.get<Sprint>(`/sprints/${sprintId}`),
  createSprint: (teamId: string, data: CreateSprintDto) =>
    api.post<Sprint>(`/sprints/team/${teamId}`, data),
  updateSprint: (sprintId: string, data: UpdateSprintDto) =>
    api.put<Sprint>(`/sprints/${sprintId}`, data),
  deleteSprint: (sprintId: string) => api.delete(`/sprints/${sprintId}`),
};

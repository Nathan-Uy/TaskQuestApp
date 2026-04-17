import api from "@/api/axios";
import type {
  Project,
  CreateProjectDto,
  UpdateProjectDto,
  AddMemberDto,
} from "./project.types";

export const projectApi = {
  getProjects: () => api.get<Project[]>("/projects"),
  getProject: (projectId: string) => api.get<Project>(`/projects/${projectId}`),
  createProject: (data: CreateProjectDto) =>
    api.post<Project>("/projects", data),
  updateProject: (projectId: string, data: UpdateProjectDto) =>
    api.put<Project>(`/projects/${projectId}`, data),
  deleteProject: (projectId: string) => api.delete(`/projects/${projectId}`),

  addMember: (projectId: string, data: AddMemberDto) =>
    api.post<Project>(`/projects/${projectId}/members`, data),
  removeMember: (projectId: string, userId: string) =>
    api.delete(`/projects/${projectId}/members/${userId}`),
};

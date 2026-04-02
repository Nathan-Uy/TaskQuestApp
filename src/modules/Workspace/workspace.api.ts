import api from "@/api/axios";
import type {
  Team,
  Sprint,
  WorkspaceTask,
  ChatMessage,
  TeamMember,
} from "./workspace.types";

export const teamsApi = {
  createTeam: (data: { teamName: string; description: string }) =>
    api.post<Team>("/teams", data),
  listTeams: () => api.get<Team[]>("/teams"),
  getTeam: (teamId: string) => api.get<Team>(`/teams/${teamId}`),
  updateTeam: (teamId: string, data: Partial<Team>) =>
    api.patch<Team>(`/teams/${teamId}`, data),
  inviteMember: (teamId: string, email: string) =>
    api.post(`/teams/${teamId}/members/invite`, { email }),
  removeMember: (teamId: string, userId: string) =>
    api.delete(`/teams/${teamId}/members/${userId}`),
};

export const sprintsApi = {
  createSprint: (data: {
    teamId: string;
    name: string;
    startDate: string;
    endDate: string;
  }) => api.post<Sprint>("/sprints", data),
  listSprints: (teamId: string) =>
    api.get<Sprint[]>(`/teams/${teamId}/sprints`),
  updateSprint: (sprintId: string, data: Partial<Sprint>) =>
    api.patch<Sprint>(`/sprints/${sprintId}`, data),
  deleteSprint: (sprintId: string) => api.delete(`/sprints/${sprintId}`),
};

export const tasksApi = {
  createTask: (data: {
    sprintId: string;
    title: string;
    description: string;
    priority: string;
  }) => api.post<WorkspaceTask>(`/sprints/${data.sprintId}/tasks`, data),
  listTasks: (sprintId: string) =>
    api.get<WorkspaceTask[]>(`/sprints/${sprintId}/tasks`),
  updateTask: (taskId: string, data: Partial<WorkspaceTask>) =>
    api.patch<WorkspaceTask>(`/tasks/${taskId}`, data),
  deleteTask: (taskId: string) => api.delete(`/tasks/${taskId}`),
};

export const chatApi = {
  sendMessage: (teamId: string, content: string) =>
    api.post<ChatMessage>(`/teams/${teamId}/messages`, { content }),
  getMessages: (teamId: string, limit = 50, offset = 0) =>
    api.get<ChatMessage[]>(
      `/teams/${teamId}/messages?limit=${limit}&offset=${offset}`,
    ),
};

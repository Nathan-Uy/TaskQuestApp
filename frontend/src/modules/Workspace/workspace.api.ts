import api from "@/api/axios";
import type {
  Team,
  Sprint,
  WorkspaceTask,
  ChatMessage,
  TeamMember,
} from "./workspace.types";

export const teamsApi = {
  listTeams: () => api.get("/workspace/teams"),
  getTeam: (teamId: string) => api.get(`/workspace/teams/${teamId}`),
  createTeam: (data: { teamName: string; description: string }) =>
    api.post("/workspace/teams", data),
  updateTeam: (teamId: string, updates: any) =>
    api.put(`/workspace/teams/${teamId}`, updates),
  inviteMember: (teamId: string, email: string) =>
    api.post(`/workspace/teams/${teamId}/members/invite`, { email }),
  removeMember: (teamId: string, userId: string) =>
    api.delete(`/workspace/teams/${teamId}/members/${userId}`),
};

export const sprintsApi = {
  listSprints: (teamId: string) => api.get(`/workspace/sprints/team/${teamId}`),
  getSprint: (sprintId: string) => api.get(`/workspace/sprints/${sprintId}`),
  createSprint: (data: any) => api.post("/workspace/sprints", data),
  updateSprint: (sprintId: string, updates: any) =>
    api.put(`/workspace/sprints/${sprintId}`, updates),
  deleteSprint: (sprintId: string) =>
    api.delete(`/workspace/sprints/${sprintId}`),
};

export const tasksApi = {
  listTasks: (sprintId: string) =>
    api.get(`/workspace/tasks/sprint/${sprintId}`),
  getTask: (taskId: string) => api.get(`/workspace/tasks/${taskId}`),
  createTask: (data: {
    sprintId: string;
    title: string;
    description?: string;
    priority?: string;
    duration?: number | null;
    assignedTo?: string | null;
    ownerName?: string | null;
  }) => api.post(`/workspace/tasks/sprint/${data.sprintId}`, data),
  updateTask: (taskId: string, updates: any) =>
    api.put(`/workspace/tasks/${taskId}`, updates),
  deleteTask: (taskId: string) => api.delete(`/workspace/tasks/${taskId}`),
};

export const chatApi = {
  sendMessage: (teamId: string, message: string) =>
    api.post<ChatMessage>(`/workspace/chat/team/${teamId}`, { message }),

  getMessages: (teamId: string, limit = 50, page = 1) =>
    api.get<ChatMessage[]>(
      `/workspace/chat/team/${teamId}?limit=${limit}&page=${page}`,
    ),
};

import api from "@/api/axios";
import type {
  Team,
  Sprint,
  WorkspaceTask,
  ChatMessage,
  TeamMember,
} from "./workspace.types";

export const teamsApi = {
  createTeam: (data: {
    teamName?: string;
    name?: string;
    description: string;
  }) => {
    // Support both teamName and name for compatibility
    const payload = {
      name: data.name || data.teamName,
      description: data.description,
    };
    return api.post<Team>("/workspace/teams", payload);
  },

  listTeams: () => api.get<Team[]>("/workspace/teams"),
  getTeam: (teamId: string) => api.get<Team>(`/workspace/teams/${teamId}`),

  updateTeam: (teamId: string, data: Partial<Team>) =>
    api.put<Team>(`/workspace/teams/${teamId}`, data),

  inviteMember: (teamId: string, email: string) =>
    api.post(`/workspace/teams/${teamId}/members/invite`, { email }),

  removeMember: (teamId: string, userId: string) =>
    api.delete(`/workspace/teams/${teamId}/members/${userId}`),
};

export const sprintsApi = {
  createSprint: (data: {
    teamId: string;
    name: string;
    startDate: string;
    endDate: string;
  }) => api.post<Sprint>(`/workspace/sprints/team/${data.teamId}`, data),

  listSprints: (teamId: string) =>
    api.get<Sprint[]>(`/workspace/sprints/team/${teamId}`),

  updateSprint: (sprintId: string, data: Partial<Sprint>) =>
    api.put<Sprint>(`/workspace/sprints/${sprintId}`, data),

  deleteSprint: (sprintId: string) =>
    api.delete(`/workspace/sprints/${sprintId}`),
};

export const tasksApi = {
  createTask: (data: {
    sprintId: string;
    title: string;
    description: string;
    priority: string;
    dueDate: string | null;
  }) =>
    api.post<WorkspaceTask>(`/workspace/tasks/sprint/${data.sprintId}`, data),

  listTasks: (sprintId: string) =>
    api.get<WorkspaceTask[]>(`/workspace/tasks/sprint/${sprintId}`),

  updateTask: (taskId: string, data: Partial<WorkspaceTask>) =>
    api.put<WorkspaceTask>(`/workspace/tasks/${taskId}`, data),

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

import api from "@/api/axios";
import type {
  Team,
  CreateTeamDto,
  UpdateTeamDto,
  AddMemberDto,
} from "./team.types";

export const teamApi = {
  getTeams: (projectId: string) =>
    api.get<Team[]>(`/teams/project/${projectId}`),
  getTeam: (teamId: string) => api.get<Team>(`/teams/${teamId}`),
  createTeam: (projectId: string, data: CreateTeamDto) =>
    api.post<Team>(`/teams/project/${projectId}`, data),
  updateTeam: (teamId: string, data: UpdateTeamDto) =>
    api.put<Team>(`/teams/${teamId}`, data),
  deleteTeam: (teamId: string) => api.delete(`/teams/${teamId}`),
  addMember: (teamId: string, data: AddMemberDto) =>
    api.post<Team>(`/teams/${teamId}/members`, data),
  removeMember: (teamId: string, userId: string) =>
    api.delete(`/teams/${teamId}/members/${userId}`),
  updateCoverPhoto: (teamId: string, coverPhoto: string | null) =>
    api.patch(`/teams/${teamId}/cover`, { coverPhoto }),
  updateColor: (teamId: string, color: string | null) =>
    api.patch(`/teams/${teamId}/color`, { color }),
};

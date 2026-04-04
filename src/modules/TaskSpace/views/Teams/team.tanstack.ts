import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { teamApi } from "./team.services";
import type {
  Team,
  CreateTeamDto,
  UpdateTeamDto,
  AddMemberDto,
} from "./team.types";

export const teamKeys = {
  all: ["teams"] as const,
  lists: () => [...teamKeys.all, "list"] as const,
  list: (projectId: string) => [...teamKeys.lists(), projectId] as const,
  details: () => [...teamKeys.all, "detail"] as const,
  detail: (teamId: string) => [...teamKeys.details(), teamId] as const,
};

export const useTeams = (projectId: string) => {
  return useQuery({
    queryKey: teamKeys.list(projectId),
    queryFn: () => teamApi.getTeams(projectId),
    select: (data) => data.data,
    enabled: !!projectId,
  });
};

export const useTeam = (teamId: string) => {
  return useQuery({
    queryKey: teamKeys.detail(teamId),
    queryFn: () => teamApi.getTeam(teamId),
    select: (data) => data.data,
    enabled: !!teamId,
  });
};

export const useCreateTeam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      data,
    }: {
      projectId: string;
      data: CreateTeamDto;
    }) => teamApi.createTeam(projectId, data),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.list(projectId) });
    },
  });
};

export const useUpdateTeam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, data }: { teamId: string; data: UpdateTeamDto }) =>
      teamApi.updateTeam(teamId, data),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.detail(teamId) });
      // Also invalidate all lists? We don't know projectId, but we can refetch later.
    },
  });
};

export const useDeleteTeam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (teamId: string) => teamApi.deleteTeam(teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
    },
  });
};

export const useAddTeamMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, data }: { teamId: string; data: AddMemberDto }) =>
      teamApi.addMember(teamId, data),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.detail(teamId) });
    },
  });
};

export const useRemoveTeamMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) =>
      teamApi.removeMember(teamId, userId),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.detail(teamId) });
    },
  });
};

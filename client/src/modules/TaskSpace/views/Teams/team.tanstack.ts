import { computed, isRef, ref, type Ref } from "vue";
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

// ✅ Accept string | Ref<string> | ComputedRef<string>
export const useTeams = (projectId: string | Ref<string>) => {
  const id = isRef(projectId) ? projectId : ref(projectId);

  return useQuery({
    queryKey: computed(() => teamKeys.list(id.value)), // ✅ reactive key
    queryFn: () => teamApi.getTeams(id.value),
    select: (data) => data.data,
    enabled: computed(() => !!id.value), // ✅ reactive enabled
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
    }) => teamApi.createTeam(projectId, data).then((r) => r.data),
    onSuccess: (_, { projectId }) => {
      // ✅ Invalidate so the list refetches and TanStack cache stays fresh
      queryClient.invalidateQueries({ queryKey: teamKeys.list(projectId) });
    },
  });
};

export const useUpdateTeam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, data }: { teamId: string; data: UpdateTeamDto }) =>
      teamApi.updateTeam(teamId, data).then((r) => r.data),
    onSuccess: (updated: Team) => {
      queryClient.setQueryData<Team>(teamKeys.detail(updated._id), updated);
      // Invalidate all team lists since we don't know which projectId this belongs to
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
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
      teamApi.addMember(teamId, data).then((r) => r.data),
    onSuccess: (updated: Team) => {
      queryClient.setQueryData<Team>(teamKeys.detail(updated._id), updated);
    },
  });
};

export const useRemoveTeamMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) =>
      teamApi.removeMember(teamId, userId).then((r) => r.data as Team),
    onSuccess: (updated: Team) => {
      queryClient.setQueryData<Team>(teamKeys.detail(updated._id), updated);
    },
  });
};

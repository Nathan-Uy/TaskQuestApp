import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { sprintApi } from "./sprint.services";
import type { Sprint, CreateSprintDto, UpdateSprintDto } from "./sprint.types";

export const sprintKeys = {
  all: ["sprints"] as const,
  lists: () => [...sprintKeys.all, "list"] as const,
  list: (teamId: string) => [...sprintKeys.lists(), teamId] as const,
  details: () => [...sprintKeys.all, "detail"] as const,
  detail: (sprintId: string) => [...sprintKeys.details(), sprintId] as const,
};

export const useSprints = (teamId: string) =>
  useQuery({
    queryKey: sprintKeys.list(teamId),
    queryFn: () => sprintApi.getSprints(teamId).then((r) => r.data),
    staleTime: 1000 * 30,
    enabled: !!teamId,
  });

export const useSprint = (sprintId: string) =>
  useQuery({
    queryKey: sprintKeys.detail(sprintId),
    queryFn: () => sprintApi.getSprint(sprintId).then((r) => r.data),
    staleTime: 1000 * 30,
    enabled: !!sprintId,
  });

export const useCreateSprint = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, data }: { teamId: string; data: CreateSprintDto }) =>
      sprintApi.createSprint(teamId, data).then((r) => r.data as Sprint),
    onSuccess: (newSprint, { teamId }) => {
      queryClient.setQueryData<Sprint[]>(sprintKeys.list(teamId), (old) => [
        newSprint,
        ...(old ?? []),
      ]);
    },
  });
};

export const useUpdateSprint = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      sprintId,
      data,
    }: {
      sprintId: string;
      data: UpdateSprintDto;
    }) => sprintApi.updateSprint(sprintId, data).then((r) => r.data as Sprint),
    onSuccess: (updatedSprint) => {
      queryClient.setQueryData<Sprint>(
        sprintKeys.detail(updatedSprint._id),
        updatedSprint,
      );
      queryClient.setQueryData<Sprint[]>(
        sprintKeys.lists(),
        (old) =>
          old?.map((s) => (s._id === updatedSprint._id ? updatedSprint : s)) ??
          [],
      );
    },
  });
};

export const useDeleteSprint = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sprintId: string) =>
      sprintApi.deleteSprint(sprintId).then((r) => r.data),
    onSuccess: (_, sprintId) => {
      queryClient.setQueryData<Sprint[]>(
        sprintKeys.lists(),
        (old) => old?.filter((s) => s._id !== sprintId) ?? [],
      );
      queryClient.removeQueries({ queryKey: sprintKeys.detail(sprintId) });
    },
  });
};

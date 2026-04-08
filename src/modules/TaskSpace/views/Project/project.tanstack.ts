import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { projectApi } from "./project.services";
import type {
  Project,
  CreateProjectDto,
  UpdateProjectDto,
  AddMemberDto,
} from "./project.types";

export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  list: () => [...projectKeys.lists()] as const,
  details: () => [...projectKeys.all, "detail"] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
};

export const useProjects = () =>
  useQuery({
    queryKey: projectKeys.list(),
    queryFn: () => projectApi.getProjects().then((r) => r.data),
    staleTime: 1000 * 30,
  });

export const useProject = (projectId: string) =>
  useQuery({
    queryKey: projectKeys.detail(projectId),
    queryFn: () => projectApi.getProject(projectId).then((r) => r.data),
    staleTime: 1000 * 30,
    enabled: !!projectId,
    retry: false,
  });

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateProjectDto) => {
      const response = await projectApi.createProject(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.list() });
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      data,
    }: {
      projectId: string;
      data: UpdateProjectDto;
    }) =>
      projectApi.updateProject(projectId, data).then((r) => r.data as Project),
    onSuccess: (updated) => {
      queryClient.setQueryData<Project[]>(
        projectKeys.list(),
        (old) => old?.map((p) => (p._id === updated._id ? updated : p)) ?? [],
      );
      queryClient.setQueryData<Project>(
        projectKeys.detail(updated._id),
        updated,
      );
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (projectId: string) => projectApi.deleteProject(projectId),
    onSuccess: (_, projectId) => {
      queryClient.setQueryData<Project[]>(
        projectKeys.list(),
        (old) => old?.filter((p) => p._id !== projectId) ?? [],
      );
      queryClient.removeQueries({ queryKey: projectKeys.detail(projectId) });
    },
  });
};

export const useAddMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      data,
    }: {
      projectId: string;
      data: AddMemberDto;
    }) => projectApi.addMember(projectId, data).then((r) => r.data as Project),
    onSuccess: (updated) => {
      queryClient.setQueryData<Project[]>(
        projectKeys.list(),
        (old) => old?.map((p) => (p._id === updated._id ? updated : p)) ?? [],
      );
      queryClient.setQueryData<Project>(
        projectKeys.detail(updated._id),
        updated,
      );
    },
  });
};

export const useRemoveMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      userId,
    }: {
      projectId: string;
      userId: string;
    }) =>
      projectApi.removeMember(projectId, userId).then((r) => r.data as Project),
    onSuccess: (updated) => {
      queryClient.setQueryData<Project[]>(
        projectKeys.list(),
        (old) => old?.map((p) => (p._id === updated._id ? updated : p)) ?? [],
      );
      queryClient.setQueryData<Project>(
        projectKeys.detail(updated._id),
        updated,
      );
    },
  });
};

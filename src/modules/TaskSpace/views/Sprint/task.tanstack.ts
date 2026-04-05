import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { taskApi } from "./task.services";
import type { CreateTaskDto, UpdateTaskDto } from "./tasks.types";

export const taskKeys = {
  all: ["tasks"] as const,
  lists: () => [...taskKeys.all, "list"] as const,
  list: (sprintId: string) => [...taskKeys.lists(), sprintId] as const,
  details: () => [...taskKeys.all, "detail"] as const,
  detail: (taskId: string) => [...taskKeys.details(), taskId] as const,
};

export const useTasks = (sprintId: string) => {
  return useQuery({
    queryKey: taskKeys.list(sprintId),
    queryFn: () => taskApi.getTasks(sprintId),
    select: (data) => data.data,
    enabled: !!sprintId,
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      sprintId,
      data,
    }: {
      sprintId: string;
      data: CreateTaskDto;
    }) => taskApi.createTask(sprintId, data),
    onSuccess: (_, { sprintId }) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.list(sprintId) });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: UpdateTaskDto }) =>
      taskApi.updateTask(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => taskApi.deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
};

import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { tasksService } from "./tasks.service";
import { useGamificationStore } from "@/components/sidebar.store";
import type { Task, CreateTaskPayload } from "./tasks.type";

export const TASKS_KEY = ["tasks"] as const;

export const useTasksQuery = () =>
  useQuery({
    queryKey: TASKS_KEY,
    queryFn: tasksService.getAll,
    staleTime: 1000 * 30, // 30 seconds — won't refetch unless data is stale
  });

export const useCreateTaskMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTaskPayload) => tasksService.create(payload),
    onSuccess: (newTask) => {
      // Optimistically add to cache instead of invalidating
      queryClient.setQueryData<Task[]>(TASKS_KEY, (old) => [
        newTask,
        ...(old ?? []),
      ]);
    },
  });
};

export const useCompleteTaskMutation = () => {
  const queryClient = useQueryClient();
  const gamification = useGamificationStore();

  return useMutation({
    mutationFn: (id: string) => tasksService.complete(id),
    onSuccess: async (data) => {
      queryClient.setQueryData<Task[]>(
        TASKS_KEY,
        (old) =>
          old?.map((t) =>
            t._id === data.task._id ? { ...t, ...data.task } : t,
          ) ?? [],
      );
      if (data.user) {
        gamification.profile.level = data.user.level;
        gamification.profile.currentXP = data.user.currentXP;
        gamification.profile.xpToNextLevel = data.user.xpToNextLevel;
        gamification.profile.totalXP = data.user.totalXP;
        gamification.profile.tasksCompleted = data.user.tasksCompleted;
      }

      const { usePomodoroStore } =
        await import("@/modules/Pomodoro/pomodoro.store");
      const pomodoro = usePomodoroStore();
      if (pomodoro.linkedTaskId === data.task._id && pomodoro.isRunning) {
        pomodoro.pause();
        pomodoro.linkTask(null);
      }
    },
  });
};

export const useDeleteTaskMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tasksService.remove(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData<Task[]>(
        TASKS_KEY,
        (old) => old?.filter((t) => t._id !== id) ?? [],
      );
    },
  });
};

export const useUpdateTaskMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Task> }) =>
      tasksService.update(id, patch),
    onSuccess: (updatedTask) => {
      queryClient.setQueryData<Task[]>(
        TASKS_KEY,
        (old) =>
          old?.map((t) => (t._id === updatedTask._id ? updatedTask : t)) ?? [],
      );
    },
  });
};

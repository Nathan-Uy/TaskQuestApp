import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { goalsService } from "./goals.service";
import { useGamificationStore } from "@/components/sidebar.store";
import type { Goal, CreateGoalPayload } from "./goals.types";

export const GOALS_KEY = ["goals"] as const;

export const useGoalsQuery = () =>
  useQuery({
    queryKey: GOALS_KEY,
    queryFn: goalsService.getAll,
  });

export const useCreateGoalMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateGoalPayload) => goalsService.create(payload),
    onSuccess: (newGoal) => {
      queryClient.setQueryData<Goal[]>(GOALS_KEY, (old) =>
        old ? [newGoal, ...old] : [newGoal],
      );
    },
  });
};

export const useCompleteGoalMutation = () => {
  const queryClient = useQueryClient();
  const gamification = useGamificationStore();

  return useMutation({
    mutationFn: (id: string) => goalsService.complete(id),
    onSuccess: (data) => {
      queryClient.setQueryData<Goal[]>(
        GOALS_KEY,
        (old) =>
          old?.map((g) =>
            g._id === data.goal._id ? { ...g, ...data.goal } : g,
          ) ?? [],
      );
      if (data.user) {
        gamification.profile.level = data.user.level;
        gamification.profile.currentXP = data.user.currentXP;
        gamification.profile.xpToNextLevel = data.user.xpToNextLevel;
        gamification.profile.totalXP = data.user.totalXP;
      }
    },
  });
};

export const useDeleteGoalMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => goalsService.remove(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData<Goal[]>(
        GOALS_KEY,
        (old) => old?.filter((g) => g._id !== id) ?? [],
      );
    },
  });
};

export const useLinkTaskMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ goalId, taskId }: { goalId: string; taskId: string }) =>
      goalsService.linkTask(goalId, taskId),
    onSuccess: (updatedGoal) => {
      queryClient.setQueryData<Goal[]>(
        GOALS_KEY,
        (old) =>
          old?.map((g) => (g._id === updatedGoal._id ? updatedGoal : g)) ?? [],
      );
    },
  });
};

export const useUnlinkTaskMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ goalId, taskId }: { goalId: string; taskId: string }) =>
      goalsService.unlinkTask(goalId, taskId),
    onSuccess: (updatedGoal) => {
      queryClient.setQueryData<Goal[]>(
        GOALS_KEY,
        (old) =>
          old?.map((g) => (g._id === updatedGoal._id ? updatedGoal : g)) ?? [],
      );
    },
  });
};

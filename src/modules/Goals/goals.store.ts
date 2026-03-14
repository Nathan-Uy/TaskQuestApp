import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/api/axios";
import type { Goal } from "@/modules/Goals/goals.types";
import { useTasksStore } from "@/modules/Tasks/tasks.store";

export const useGoalsStore = defineStore("goals", () => {
  const goals = ref<Goal[]>([]);

  const activeGoals = computed(() =>
    goals.value.filter((g) => g.status === "active"),
  );
  const completedGoals = computed(() =>
    goals.value.filter((g) => g.status === "completed"),
  );

  const fetchGoals = async () => {
    const { data } = await api.get("/goals");
    goals.value = data;
  };

  const addGoal = async (payload: {
    title: string;
    description?: string;
    timeframe: "daily" | "weekly" | "monthly" | "yearly";
    xpReward?: number;
    deadline?: Date;
  }) => {
    const { data } = await api.post("/goals", payload);
    goals.value.unshift(data);
  };

  const completeGoal = async (id: string) => {
    const { data } = await api.patch(`/goals/${id}/complete`);
    const idx = goals.value.findIndex((g) => (g as any)._id === id);
    if (idx !== -1) goals.value[idx] = { ...goals.value[idx], ...data.goal };

    if (data.user) {
      const { useGamificationStore } =
        await import("@/components/sidebar.store");
      const gamification = useGamificationStore();
      gamification.profile.level = data.user.level;
      gamification.profile.currentXP = data.user.currentXP;
      gamification.profile.xpToNextLevel = data.user.xpToNextLevel;
      gamification.profile.totalXP = data.user.totalXP;
    }
  };

  const deleteGoal = async (id: string) => {
    await api.delete(`/goals/${id}`);
    goals.value = goals.value.filter((g) => (g as any)._id !== id);
  };

  const linkTask = async (goalId: string, taskId: string) => {
    const { data } = await api.patch(`/goals/${goalId}/link-task`, { taskId });
    const idx = goals.value.findIndex((g) => (g as any)._id === goalId);
    if (idx !== -1) goals.value[idx] = data;
  };

  const unlinkTask = async (goalId: string, taskId: string) => {
    const { data } = await api.patch(`/goals/${goalId}/unlink-task`, {
      taskId,
    });
    const idx = goals.value.findIndex((g) => (g as any)._id === goalId);
    if (idx !== -1) goals.value[idx] = data;
  };

  const getGoalProgress = (goal: any): number => {
    if (!goal.linkedTaskIds?.length) return 0;
    const tasksStore = useTasksStore();
    const linked = tasksStore.tasks.filter((t: any) =>
      goal.linkedTaskIds.includes((t as any)._id?.toString()),
    );
    if (!linked.length) return 0;
    return Math.round(
      (linked.filter((t: any) => t.status === "completed").length /
        linked.length) *
        100,
    );
  };

  return {
    goals,
    activeGoals,
    completedGoals,
    fetchGoals,
    addGoal,
    completeGoal,
    deleteGoal,
    linkTask,
    unlinkTask,
    getGoalProgress,
  };
});

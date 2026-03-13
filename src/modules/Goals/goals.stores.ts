import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Goal, GoalTimeframe } from "@/modules/Goals/goals.types";
import { useGamificationStore } from "@/components/sidebar.store";
import { useTasksStore } from "@/modules/Tasks/tasks.store";

export const useGoalsStore = defineStore("goals", () => {
  const gamification = useGamificationStore();
  const tasksStore = useTasksStore();

  const goals = ref<Goal[]>([]);

  const activeGoals = computed(() =>
    goals.value.filter((g) => g.status === "active"),
  );
  const completedGoals = computed(() =>
    goals.value.filter((g) => g.status === "completed"),
  );

  const getGoalProgress = (goal: Goal): number => {
    if (goal.linkedTaskIds.length === 0) return 0;
    const linked = tasksStore.tasks.filter((t) =>
      goal.linkedTaskIds.includes(t.id),
    );
    if (linked.length === 0) return 0;
    const completed = linked.filter((t) => t.status === "completed").length;
    return Math.round((completed / linked.length) * 100);
  };

  const addGoal = (payload: {
    title: string;
    description?: string;
    timeframe: GoalTimeframe;
    xpReward?: number;
    deadline?: Date;
  }) => {
    goals.value.push({
      id: Date.now(),
      title: payload.title,
      description: payload.description,
      timeframe: payload.timeframe,
      status: "active",
      xpReward: payload.xpReward ?? 100,
      linkedTaskIds: [],
      createdAt: new Date(),
      deadline: payload.deadline,
    });
  };

  const completeGoal = (id: number) => {
    const goal = goals.value.find((g) => g.id === id);
    if (!goal) return;
    goal.status = "completed";
    goal.completedAt = new Date();
    gamification.awardXP(goal.xpReward);
  };

  const deleteGoal = (id: number) => {
    goals.value = goals.value.filter((g) => g.id !== id);
  };

  const linkTask = (goalId: number, taskId: number) => {
    const goal = goals.value.find((g) => g.id === goalId);
    if (!goal || goal.linkedTaskIds.includes(taskId)) return;
    goal.linkedTaskIds.push(taskId);
  };

  const unlinkTask = (goalId: number, taskId: number) => {
    const goal = goals.value.find((g) => g.id === goalId);
    if (!goal) return;
    goal.linkedTaskIds = goal.linkedTaskIds.filter((id) => id !== taskId);
  };

  const updateGoal = (id: number, patch: Partial<Goal>) => {
    const goal = goals.value.find((g) => g.id === id);
    if (goal) Object.assign(goal, patch);
  };

  return {
    goals,
    activeGoals,
    completedGoals,
    getGoalProgress,
    addGoal,
    completeGoal,
    deleteGoal,
    linkTask,
    unlinkTask,
    updateGoal,
  };
});

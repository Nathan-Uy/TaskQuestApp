import { ref, computed } from "vue";
import type { Goal, GoalTimeframe } from "./goals.types";
import type { Task } from "@/modules/Tasks/tasks.type";

export const useGoalForm = () => {
  const form = ref({
    title: "",
    description: "",
    timeframe: "weekly" as GoalTimeframe,
    xpReward: 100,
    deadline: null as Date | null,
  });

  const resetForm = () => {
    form.value = {
      title: "",
      description: "",
      timeframe: "weekly",
      xpReward: 100,
      deadline: null,
    };
  };

  const timeframeOptions = [
    { label: "Daily", value: "daily" },
    { label: "Weekly", value: "weekly" },
    { label: "Monthly", value: "monthly" },
    { label: "Yearly", value: "yearly" },
  ];

  return { form, resetForm, timeframeOptions };
};

export const useGoalFormatters = () => {
  const timeframeColor = (timeframe: GoalTimeframe) =>
    ({
      daily: "bg-blue-50 text-blue-500",
      weekly: "bg-violet-50 text-violet-500",
      monthly: "bg-amber-50 text-amber-600",
      yearly: "bg-rose-50 text-rose-500",
    })[timeframe];

  const formatDeadline = (d: Date) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return { timeframeColor, formatDeadline };
};

export const useGoalFilters = (goals: () => Goal[] | undefined) => {
  const activeGoals = computed(
    () => goals()?.filter((g) => g.status === "active") ?? [],
  );

  const completedGoals = computed(
    () => goals()?.filter((g) => g.status === "completed") ?? [],
  );

  return { activeGoals, completedGoals };
};

export const useGoalProgress = (tasks: () => Task[] | undefined) => {
  const getGoalProgress = (goal: Goal): number => {
    if (!goal.linkedTaskIds?.length) return 0;
    const allTasks = tasks() ?? [];
    const linked = allTasks.filter((t) => goal.linkedTaskIds.includes(t._id));
    if (!linked.length) return 0;
    return Math.round(
      (linked.filter((t) => t.status === "completed").length / linked.length) *
        100,
    );
  };

  return { getGoalProgress };
};

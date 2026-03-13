import { ref, computed } from "vue";
import { storeToRefs } from "pinia";
import { useGoalsStore } from "@/modules/Goals/goals.store";
import { useTasksStore } from "@/modules/Tasks/tasks.store";
import type { GoalTimeframe } from "@/modules/Goals/goals.types";

export const useGoals = () => {
  const goalsStore = useGoalsStore();
  const tasksStore = useTasksStore();
  const { activeGoals, completedGoals } = storeToRefs(goalsStore);
  const { activeTasks } = storeToRefs(tasksStore);

  const showAddGoal = ref(false);
  const expandedGoalId = ref<number | null>(null);

  const form = ref({
    title: "",
    description: "",
    timeframe: "weekly" as GoalTimeframe,
    xpReward: 100,
    deadline: null as Date | null,
  });

  const timeframeOptions = [
    { label: "Daily", value: "daily" },
    { label: "Weekly", value: "weekly" },
    { label: "Monthly", value: "monthly" },
    { label: "Yearly", value: "yearly" },
  ];

  const timeframeColor = (timeframe: GoalTimeframe) =>
    ({
      daily: "bg-blue-50 text-blue-500",
      weekly: "bg-violet-50 text-violet-500",
      monthly: "bg-amber-50 text-amber-600",
      yearly: "bg-rose-50 text-rose-500",
    })[timeframe];

  const submitGoal = () => {
    if (!form.value.title.trim()) return;
    goalsStore.addGoal({
      title: form.value.title.trim(),
      description: form.value.description || undefined,
      timeframe: form.value.timeframe,
      xpReward: form.value.xpReward,
      deadline: form.value.deadline ?? undefined,
    });
    cancelAdd();
  };

  const cancelAdd = () => {
    showAddGoal.value = false;
    form.value = {
      title: "",
      description: "",
      timeframe: "weekly",
      xpReward: 100,
      deadline: null,
    };
  };

  const toggleExpand = (id: number) => {
    expandedGoalId.value = expandedGoalId.value === id ? null : id;
  };

  const getLinkedTasks = (linkedTaskIds: number[]) =>
    tasksStore.tasks.filter((t) => linkedTaskIds.includes(t.id));

  const formatDeadline = (d: Date) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return {
    // store
    activeGoals,
    completedGoals,
    getGoalProgress: goalsStore.getGoalProgress,
    linkTask: goalsStore.linkTask,
    unlinkTask: goalsStore.unlinkTask,
    completeGoal: goalsStore.completeGoal,
    deleteGoal: goalsStore.deleteGoal,

    // local
    activeTasks,
    showAddGoal,
    expandedGoalId,
    form,
    timeframeOptions,
    timeframeColor,
    submitGoal,
    cancelAdd,
    toggleExpand,
    getLinkedTasks,
    formatDeadline,
  };
};

import { defineStore } from "pinia";
import { ref } from "vue";

export const useGoalsStore = defineStore("goals", () => {
  const showAddGoal = ref(false);
  const expandedGoalId = ref<string | null>(null);

  const openAddGoal = () => {
    showAddGoal.value = true;
  };
  const closeAddGoal = () => {
    showAddGoal.value = false;
  };

  const toggleExpand = (id: string) => {
    expandedGoalId.value = expandedGoalId.value === id ? null : id;
  };

  return {
    showAddGoal,
    expandedGoalId,
    openAddGoal,
    closeAddGoal,
    toggleExpand,
  };
});

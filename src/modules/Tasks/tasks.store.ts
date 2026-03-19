import { defineStore } from "pinia";
import { ref } from "vue";

export const useTasksStore = defineStore("tasks", () => {
  const showAddTask = ref(false);

  const openAddTask = () => {
    showAddTask.value = true;
  };
  const closeAddTask = () => {
    showAddTask.value = false;
  };

  return {
    showAddTask,
    openAddTask,
    closeAddTask,
  };
});

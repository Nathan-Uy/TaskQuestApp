import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { tasksApi } from "./workspace.api";
import type { WorkspaceTask } from "./workspace.types";

export const useWorkspaceTasksStore = defineStore("workspaceTasks", () => {
  const tasks = ref<WorkspaceTask[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const tasksByStatus = computed(() => ({
    todo: tasks.value.filter((t) => t.status === "todo"),
    "in-progress": tasks.value.filter((t) => t.status === "in-progress"),
    done: tasks.value.filter((t) => t.status === "done"),
  }));

  const fetchTasks = async (sprintId: string) => {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await tasksApi.listTasks(sprintId);
      tasks.value = data;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch tasks";
    } finally {
      loading.value = false;
    }
  };

  const createTask = async (
    sprintId: string,
    title: string,
    description: string,
    priority: string,
  ) => {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await tasksApi.createTask({
        sprintId,
        title,
        description,
        priority,
      });
      tasks.value.push(data);
      return data;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to create task";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateTask = async (
    taskId: string,
    updates: Partial<WorkspaceTask>,
  ) => {
    try {
      const { data } = await tasksApi.updateTask(taskId, updates);
      const idx = tasks.value.findIndex((t) => t._id === taskId);
      if (idx !== -1) tasks.value[idx] = data;
      return data;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to update task";
      throw err;
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await tasksApi.deleteTask(taskId);
      tasks.value = tasks.value.filter((t) => t._id !== taskId);
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to delete task";
      throw err;
    }
  };

  const clearTasks = () => {
    tasks.value = [];
  };

  return {
    tasks,
    tasksByStatus,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    clearTasks,
  };
});

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/api/axios";
import type { Task } from "./tasks.type";

export const useTasksStore = defineStore("tasks", () => {
  const tasks = ref<Task[]>([]);
  const loading = ref(false);

  const activeTasks = computed(() =>
    tasks.value.filter((t) => t.status === "active"),
  );

  const completedToday = computed(() => {
    const today = new Date().toDateString();
    return tasks.value.filter(
      (t) =>
        t.status === "completed" &&
        t.completedAt &&
        new Date(t.completedAt).toDateString() === today,
    );
  });

  const fetchTasks = async () => {
    loading.value = true;
    try {
      const { data } = await api.get("/tasks");
      tasks.value = data;
    } finally {
      loading.value = false;
    }
  };

  const addTask = async (payload: {
    title: string;
    priority: "low" | "medium" | "high";
    duration: number;
    notes?: string;
    dueDate?: Date;
  }) => {
    const { data } = await api.post("/tasks", payload);
    tasks.value.unshift(data);
  };

  const completeTask = async (id: number | string) => {
    const { data } = await api.patch(`/tasks/${id}/complete`);
    const idx = tasks.value.findIndex(
      (t) => t.id === id || (t as any)._id === id,
    );
    if (idx !== -1) tasks.value[idx] = { ...tasks.value[idx], ...data.task };

    // Sync XP to gamification store
    if (data.user) {
      const { useGamificationStore } =
        await import("@/components/sidebar.store");
      const gamification = useGamificationStore();
      gamification.profile.level = data.user.level;
      gamification.profile.currentXP = data.user.currentXP;
      gamification.profile.xpToNextLevel = data.user.xpToNextLevel;
      gamification.profile.totalXP = data.user.totalXP;
      gamification.profile.tasksCompleted = data.user.tasksCompleted;
    }
  };

  const deleteTask = async (id: number | string) => {
    await api.delete(`/tasks/${id}`);
    tasks.value = tasks.value.filter(
      (t) => t.id !== id && (t as any)._id !== id,
    );
  };

  const updateTask = async (id: number | string, patch: Partial<Task>) => {
    const { data } = await api.put(`/tasks/${id}`, patch);
    const idx = tasks.value.findIndex(
      (t) => t.id === id || (t as any)._id === id,
    );
    if (idx !== -1) tasks.value[idx] = data;
  };

  return {
    tasks,
    loading,
    activeTasks,
    completedToday,
    fetchTasks,
    addTask,
    completeTask,
    deleteTask,
    updateTask,
  };
});

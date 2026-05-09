import { ref, computed } from "vue";
import { useCalendar } from "@/modules/Calendar/calendar.composable";
import type { Task, TaskPriority } from "./tasks.type";

export const useTaskForm = () => {
  const form = ref({
    title: "",
    priority: "medium" as TaskPriority,
    hours: 0,
    minutes: 25,
    seconds: 0,
    notes: "",
    dueDate: null as Date | null,
  });

  const resetForm = () => {
    form.value = {
      title: "",
      priority: "medium",
      hours: 0,
      minutes: 25,
      seconds: 0,
      notes: "",
      dueDate: null,
    };
  };

  const getDuration = () =>
    form.value.hours * 3600 + form.value.minutes * 60 + form.value.seconds ||
    1500;

  const priorityOptions = [
    { label: "Low", value: "low" },
    { label: "Medium", value: "medium" },
    { label: "High", value: "high" },
  ];

  return { form, resetForm, getDuration, priorityOptions };
};

export const useTaskFilters = (tasks: () => Task[] | undefined) => {
  const selectedDate = ref<Date | null>(null);
  const sortBy = ref<"created" | "priority" | "dueDate" | "duration">(
    "created",
  );

  const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };

  const activeTasks = computed(() => {
    const list = tasks()?.filter((t) => t.status === "active") ?? [];
    return [...list].sort((a, b) => {
      if (sortBy.value === "priority")
        return (
          (priorityOrder[a.priority] ?? 1) - (priorityOrder[b.priority] ?? 1)
        );
      if (sortBy.value === "dueDate") {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (sortBy.value === "duration")
        return (a.duration ?? 0) - (b.duration ?? 0);
      return 0;
    });
  });

  const completedToday = computed(() => {
    const today = new Date().toDateString();
    return (
      tasks()?.filter(
        (t) =>
          t.status === "completed" &&
          t.completedAt &&
          new Date(t.completedAt).toDateString() === today,
      ) ?? []
    );
  });

  const allCompleted = computed(
    () => tasks()?.filter((t) => t.status === "completed") ?? [],
  );

  // Defaults to today when no date filter is selected
  const filteredCompleted = computed(() => {
    if (selectedDate.value) {
      const selected = new Date(selectedDate.value).toDateString();
      return allCompleted.value.filter(
        (t) =>
          t.completedAt && new Date(t.completedAt).toDateString() === selected,
      );
    }
    const today = new Date().toDateString();
    return allCompleted.value.filter(
      (t) => t.completedAt && new Date(t.completedAt).toDateString() === today,
    );
  });

  const overdueCount = computed(() => {
    const now = new Date();
    return activeTasks.value.filter(
      (t) => t.dueDate && new Date(t.dueDate) < now,
    ).length;
  });

  const clearDateFilter = () => {
    selectedDate.value = null;
  };

  return {
    activeTasks,
    completedToday,
    allCompleted,
    filteredCompleted,
    overdueCount,
    selectedDate,
    sortBy,
    clearDateFilter,
  };
};

export const useTaskDate = () => {
  const today = computed(() =>
    new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    }),
  );
  return { today };
};

export const useTaskFormatters = () => {
  const { isToday, isOverdue, formatDueDate } = useCalendar();

  const formatDuration = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return { isToday, isOverdue, formatDueDate, formatDuration };
};

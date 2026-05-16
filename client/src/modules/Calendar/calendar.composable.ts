import { computed } from "vue";
import { useCalendarStore } from "./calendar.store";
import {
  useTasksQuery,
  useCreateTaskMutation,
} from "@/modules/Tasks/tasks.tanstack";
import type { Task, TaskPriority } from "@/modules/Tasks/tasks.type";

export const useCalendarFormatters = () => {
  const isToday = (d: Date | string) => {
    const date = new Date(d);
    const t = new Date();
    return (
      date.getDate() === t.getDate() &&
      date.getMonth() === t.getMonth() &&
      date.getFullYear() === t.getFullYear()
    );
  };

  const isSameDay = (a: Date, b: Date) =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();

  const isOverdue = (d: Date | string) => {
    const date = new Date(d);
    date.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const formatDayHeader = (d: Date) =>
    d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  const formatWeekDay = (d: Date) =>
    d.toLocaleDateString("en-US", { weekday: "short" });

  const formatDueDate = (d: Date | string) => {
    const date = new Date(d);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return {
    isToday,
    isSameDay,
    isOverdue,
    formatDayHeader,
    formatWeekDay,
    formatDueDate,
  };
};

export const useCalendarTasks = (tasks: () => Task[] | undefined) => {
  const { isSameDay } = useCalendarFormatters();

  const getTasksForDay = (day: Date): Task[] =>
    (tasks() ?? []).filter(
      (t) => t.dueDate && isSameDay(new Date(t.dueDate), day),
    );

  return { getTasksForDay };
};

export const useCalendar = () => {
  const calendarStore = useCalendarStore();
  const { data: tasks } = useTasksQuery();
  const { mutate: createTask } = useCreateTaskMutation();

  const {
    isToday,
    isSameDay,
    isOverdue,
    formatDayHeader,
    formatWeekDay,
    formatDueDate,
  } = useCalendarFormatters();

  const { getTasksForDay } = useCalendarTasks(() => tasks.value);

  const views = [
    { key: "day", label: "Day" },
    { key: "week", label: "Week" },
    { key: "month", label: "Month" },
  ];

  const tasksForCursor = computed(() => getTasksForDay(calendarStore.cursor));

  const headerSubtitle = computed(() => {
    const { currentView, cursor, weekDays } = calendarStore;
    if (currentView === "day") return formatDayHeader(cursor);
    if (currentView === "week") {
      const start: Date | undefined = weekDays[0];
      const end: Date | undefined = weekDays[6];
      if (!start || !end) return "";
      return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} — ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
    }
    return cursor.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  });

  // Accepts full form object from TaskForm
  const addTask = (form: {
    title: string;
    priority: TaskPriority;
    hours: number;
    minutes: number;
    seconds: number;
    notes: string;
    dueDate: Date | null;
  }) => {
    if (!form.title.trim()) return;
    const duration =
      form.hours * 3600 + form.minutes * 60 + form.seconds || 1500;
    createTask({
      title: form.title.trim(),
      priority: form.priority,
      duration,
      notes: form.notes || undefined,
      dueDate: form.dueDate ?? new Date(calendarStore.cursor),
    });
  };

  return {
    currentView: computed(() => calendarStore.currentView),
    cursor: computed(() => calendarStore.cursor),
    weekDays: computed(() => calendarStore.weekDays),
    monthGrid: computed(() => calendarStore.monthGrid),
    navigate: calendarStore.navigate,
    goToToday: calendarStore.goToToday,
    setView: calendarStore.setView,
    setCursor: calendarStore.setCursor,
    views,
    tasksForCursor,
    headerSubtitle,
    isToday,
    isSameDay,
    isOverdue,
    formatDayHeader,
    formatWeekDay,
    formatDueDate,
    getTasksForDay,
    addTask,
  };
};

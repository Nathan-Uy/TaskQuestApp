import { computed, ref } from "vue";
import { useTasksStore } from "@/modules/Tasks/tasks.store";

export const useTasksComposable = () => {
  const tasksStore = useTasksStore();
  const today = computed(() =>
    new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    }),
  );

  const priorityOptions = [
    { label: "Low", value: "low" },
    { label: "Medium", value: "medium" },
    { label: "High", value: "high" },
  ];

  const showAddTask = ref(false);
  const form = ref({
    title: "",
    priority: "medium" as "low" | "medium" | "high",
    hours: 0,
    minutes: 25,
    seconds: 0,
    notes: "",
  });

  const submitTask = () => {
    if (!form.value.title.trim()) return;
    const duration =
      form.value.hours * 3600 + form.value.minutes * 60 + form.value.seconds;
    tasksStore.addTask({
      title: form.value.title.trim(),
      priority: form.value.priority,
      duration: duration || 1500,
      notes: form.value.notes || undefined,
    });
    cancelAdd();
  }

  const cancelAdd = () => {
    showAddTask.value = false;
    form.value = {
      title: "",
      priority: "medium",
      hours: 0,
      minutes: 25,
      seconds: 0,
      notes: "",
    };
  }

  return{
    today,
    priorityOptions,
    showAddTask,
    form,
    submitTask,
    cancelAdd,
  }
};

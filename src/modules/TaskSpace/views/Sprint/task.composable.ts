import { computed, ref } from "vue";
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";
import {
  useTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
} from "./task.tanstack";
import type {
  Task,
  CreateTaskDto,
  TaskPriority,
  TaskStatus,
} from "./tasks.types";

export function useTaskManager(sprintId: string) {
  const toast = useToast();
  const confirm = useConfirm();

  const { data: tasksData, isLoading, error, refetch } = useTasks(sprintId);
  const tasks = computed(() => tasksData.value || []);

  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const showDialog = ref(false);
  const dialogHeader = ref("");
  const editingTask = ref<Task | null>(null);
  const defaultStatus = ref<TaskStatus>("todo"); // ✅ fixed type
  const saving = ref(false);
  const form = ref({
    title: "",
    description: "",
    priority: "medium" as TaskPriority,
    duration: null as number | null,
    assignedTo: null as string | null,
    status: "todo" as TaskStatus,
  });

  const openCreateDialog = (status: TaskStatus) => {
    // ✅ fixed parameter type
    defaultStatus.value = status;
    editingTask.value = null;
    form.value = {
      title: "",
      description: "",
      priority: "medium",
      duration: null,
      assignedTo: null,
      status: "todo",
    };
    dialogHeader.value = "Create Task";
    showDialog.value = true;
  };

  const openEditDialog = (task: Task) => {
    editingTask.value = task;
    form.value = {
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      duration: task.duration ?? null,
      assignedTo: task.assignedTo || null,
      status: task.status,
    };
    dialogHeader.value = "Edit Task";
    showDialog.value = true;
  };

  const saveTask = async () => {
    if (!form.value.title) return;
    saving.value = true;
    try {
      const data: CreateTaskDto = {
        title: form.value.title,
        description: form.value.description,
        priority: form.value.priority,
        duration: form.value.duration ?? undefined,
        assignedTo: form.value.assignedTo ?? undefined,
        status: editingTask.value ? undefined : defaultStatus.value,
      };
      if (editingTask.value) {
        await updateTask.mutateAsync({ taskId: editingTask.value._id, data });
        toast.add({ severity: "success", summary: "Task updated", life: 3000 });
      } else {
        await createTask.mutateAsync({ sprintId, data });
        toast.add({ severity: "success", summary: "Task created", life: 3000 });
      }
      showDialog.value = false;
      await refetch();
    } catch (error: any) {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: error.response?.data?.error || "Failed to save task",
        life: 4000,
      });
    } finally {
      saving.value = false;
    }
  };

  const confirmDelete = (task: Task) => {
    confirm.require({
      message: `Delete task "${task.title}"?`,
      header: "Delete Task",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
        try {
          await deleteTask.mutateAsync(task._id);
          toast.add({
            severity: "success",
            summary: "Task deleted",
            life: 3000,
          });
          await refetch();
        } catch (error: any) {
          toast.add({
            severity: "error",
            summary: "Error",
            detail: error.response?.data?.error || "Failed to delete task",
            life: 4000,
          });
        }
      },
    });
  };

  return {
    tasks,
    isLoading,
    error,
    showDialog,
    dialogHeader,
    form,
    saving,
    openCreateDialog,
    openEditDialog,
    saveTask,
    confirmDelete,
    refetch,
  };
}

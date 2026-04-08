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
  UpdateTaskDto,
  TaskPriority,
  TaskStatus,
  TaskType,
} from "./tasks.types";

export function useTaskManager(sprintId: string) {
  const toast = useToast();
  const confirm = useConfirm();

  const { data: tasksData, isLoading, error, refetch } = useTasks(sprintId);
  const tasks = computed(() => tasksData.value ?? []);

  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();
  const deleteMutation = useDeleteTask();

  const showDialog = ref(false);
  const dialogHeader = ref("");
  const editingTask = ref<Task | null>(null);
  const defaultStatus = ref<TaskStatus>("todo");
  const saving = ref(false);

  const form = ref<{
    title: string;
    description: string;
    taskType: TaskType | string;
    priority: TaskPriority;
    duration: number | null;
    assignedTo: string | null;
    dueDate: string | null;
    status: TaskStatus;
  }>({
    title: "",
    description: "",
    taskType: "",
    priority: "medium",
    duration: null,
    assignedTo: null,
    dueDate: null,
    status: "todo",
  });

  const openCreateDialog = (status: TaskStatus = "todo") => {
    defaultStatus.value = status;
    editingTask.value = null;
    form.value = {
      title: "",
      description: "",
      taskType: "",
      priority: "medium",
      duration: null,
      assignedTo: null,
      dueDate: null,
      status: "todo",
    };
    dialogHeader.value = "Create Task";
    showDialog.value = true;
  };

  const openEditDialog = (task: Task) => {
    editingTask.value = task;
    form.value = {
      title: task.title,
      description: task.description ?? "",
      taskType: task.taskType ?? "",
      priority: task.priority,
      duration: task.duration ?? null,
      assignedTo: task.assignedTo ?? null,
      dueDate:
        task.dueDate != null
          ? (new Date(task.dueDate).toISOString().split("T")[0] ?? null)
          : null,
      status: task.status,
    };
    dialogHeader.value = "Edit Task";
    showDialog.value = true;
  };

  const saveTask = async () => {
    if (!form.value.title.trim()) return;
    saving.value = true;
    try {
      const dto: CreateTaskDto = {
        title: form.value.title.trim(),
        description: form.value.description || undefined,
        taskType: form.value.taskType || undefined,
        priority: form.value.priority,
        duration: form.value.duration ?? undefined,
        assignedTo: form.value.assignedTo ?? undefined,
        dueDate: form.value.dueDate ?? null,
        status: editingTask.value ? undefined : defaultStatus.value,
      };

      if (editingTask.value) {
        await updateMutation.mutateAsync({
          taskId: editingTask.value._id,
          data: dto as UpdateTaskDto,
        });
        toast.add({ severity: "success", summary: "Task updated", life: 3000 });
      } else {
        await createMutation.mutateAsync({ sprintId, data: dto });
        toast.add({ severity: "success", summary: "Task created", life: 3000 });
      }
      showDialog.value = false;
    } catch (e: any) {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: e.response?.data?.error || "Failed to save task",
        life: 4000,
      });
    } finally {
      saving.value = false;
    }
  };

  const saveInlineTask = async (
    taskId: string | undefined,
    patch: Partial<Task>,
  ) => {
    try {
      if (taskId) {
        const dto: UpdateTaskDto = {
          title: patch.title,
          description: patch.description,
          taskType: patch.taskType,
          priority: patch.priority,
          status: patch.status,
          assignedTo: patch.assignedTo,
          duration: patch.duration,
          dueDate: patch.dueDate ?? null,
        };
        await updateMutation.mutateAsync({ taskId, data: dto });
      } else {
        const dto: CreateTaskDto = {
          title: patch.title ?? "",
          description: patch.description,
          taskType: patch.taskType || undefined,
          priority: patch.priority || "medium",
          status: patch.status || "todo",
          assignedTo: patch.assignedTo || undefined,
          duration: patch.duration || undefined,
          dueDate: patch.dueDate ?? null,
        };
        await createMutation.mutateAsync({ sprintId, data: dto });
      }
    } catch (e: any) {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: e.response?.data?.error || "Failed to save task",
        life: 4000,
      });
      throw e;
    }
  };

  const confirmDelete = (task: Task) => {
    confirm.require({
      message: `Delete task "${task.title}"?`,
      header: "Delete Task",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
        try {
          await deleteMutation.mutateAsync({ taskId: task._id, sprintId });
          toast.add({
            severity: "success",
            summary: "Task deleted",
            life: 3000,
          });
        } catch (e: any) {
          toast.add({
            severity: "error",
            summary: "Error",
            detail: e.response?.data?.error || "Failed to delete task",
            life: 4000,
          });
        }
      },
    });
  };

  const deleteInlineTask = async (taskId: string) => {
    try {
      await deleteMutation.mutateAsync({ taskId, sprintId });
    } catch (e: any) {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: e.response?.data?.error || "Failed to delete task",
        life: 4000,
      });
      throw e;
    }
  };

  return {
    tasks,
    isLoading,
    error,
    refetch,
    showDialog,
    dialogHeader,
    form,
    saving,
    editingTask,
    openCreateDialog,
    openEditDialog,
    saveTask,
    confirmDelete,
    saveInlineTask,
    deleteInlineTask,
  };
}

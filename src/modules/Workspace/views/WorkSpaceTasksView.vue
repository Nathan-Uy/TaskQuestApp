<template>
  <div class="flex flex-col h-full gap-6 pl-8 pr-8 py-8">
    <div class="flex items-center justify-between">
      <div>
        <h1
          class="font-serif text-3xl leading-tight"
          style="color: var(--ink-primary)"
        >
          Sprint Tasks
        </h1>
        <p class="text-xs mt-1" style="color: var(--ink-muted)">
          Organize and track your work
        </p>
      </div>
      <Button
        label="New Task"
        icon="pi pi-plus"
        class="bg-(--accent)! border-none! rounded-[10px]! text-sm! font-semibold! shadow-sm! hover:shadow-md! hover:-translate-y-px! transition-all! duration-150!"
        @click="showCreateTaskModal = true"
      />
    </div>

    <div
      v-if="tasksStore.loading"
      class="flex items-center justify-center py-20"
    >
      <i
        class="pi pi-spinner pi-spin text-2xl"
        style="color: var(--ink-muted)"
      />
    </div>

    <div
      v-else-if="tasksStore.error"
      class="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-600 flex items-center gap-2"
    >
      <i class="pi pi-exclamation-circle text-red-500" />
      {{ tasksStore.error }}
    </div>

    <div v-else class="flex gap-5 flex-1 overflow-x-auto pb-4">
      <div
        v-for="col in columns"
        :key="col.key"
        class="shrink-0 w-80 flex flex-col gap-3"
        @dragover.prevent
        @drop="handleDrop(col.key)"
        :class="{ 'opacity-75 scale-[0.98]': draggedOverColumn === col.key }"
      >
        <div
          class="flex items-center justify-between px-3 py-2 rounded-xl"
          :style="{ background: col.bg }"
        >
          <div class="flex items-center gap-2">
            <i
              :class="['pi text-sm', col.icon]"
              :style="{ color: col.color }"
            />
            <span
              class="text-xs font-semibold uppercase tracking-widest"
              :style="{ color: col.color }"
              >{{ col.label }}</span
            >
          </div>
          <span
            class="text-[0.7rem] font-semibold rounded-full px-2 py-0.5"
            :style="{ background: col.color + '22', color: col.color }"
            >{{ tasksStore.tasksByStatus[col.key].length }}</span
          >
        </div>

        <div
          class="flex flex-col gap-2 flex-1 rounded-2xl border min-h-48 p-3 transition-all duration-150"
          :style="{
            background: 'var(--card-bg)',
            borderColor:
              draggedOverColumn === col.key ? col.color : 'var(--card-border)',
          }"
        >
          <div
            v-if="tasksStore.tasksByStatus[col.key].length === 0"
            class="flex-1 flex items-center justify-center text-xs"
            style="color: var(--ink-muted)"
          >
            No tasks
          </div>
          <TaskCard
            v-for="task in tasksStore.tasksByStatus[col.key]"
            :key="task._id"
            :task="task"
            :accent-color="col.color"
            @update="handleUpdateTask"
            @delete="handleDeleteTask"
            @dragstart="handleDragStart($event, task)"
            @dragend="handleDragEnd"
          />
        </div>
      </div>
    </div>

    <Dialog
      v-model:visible="showCreateTaskModal"
      header="New Task"
      :modal="true"
      :draggable="false"
      class="w-full max-w-md rounded-2xl!"
    >
      <CreateTaskModal
        :sprint-id="route.params.sprintId as string"
        @close="showCreateTaskModal = false"
        @created="handleTaskCreated"
      />
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import { useWorkspaceTasksStore } from "../workspace-tasks.store";
import TaskCard from "../components/TaskCard.vue";
import CreateTaskModal from "../components/CreateTaskModal.vue";
import type { WorkspaceTask } from "../workspace.types";

const route = useRoute();
const tasksStore = useWorkspaceTasksStore();

const showCreateTaskModal = ref(false);
const draggedOverColumn = ref<string | null>(null);
const draggedTask = ref<WorkspaceTask | null>(null);

const columns = [
  {
    key: "todo",
    label: "To Do",
    icon: "pi-list",
    color: "#6366f1",
    bg: "#eef2ff",
  },
  {
    key: "in-progress",
    label: "In Progress",
    icon: "pi-spinner",
    color: "#f59e0b",
    bg: "#fffbeb",
  },
  {
    key: "done",
    label: "Done",
    icon: "pi-check-circle",
    color: "#10b981",
    bg: "#ecfdf5",
  },
] as const;

onMounted(() => {
  const sprintId = route.params.sprintId as string;
  if (sprintId) tasksStore.fetchTasks(sprintId);
});

const handleDragStart = (event: DragEvent, task: WorkspaceTask) => {
  draggedTask.value = task;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", task._id);
  }
};

const handleDragEnd = () => {
  draggedOverColumn.value = null;
  draggedTask.value = null;
};

const handleDrop = async (newStatus: string) => {
  draggedOverColumn.value = null;
  if (!draggedTask.value) return;
  if (draggedTask.value.status === newStatus) {
    draggedTask.value = null;
    return;
  }
  try {
    await tasksStore.updateTask(draggedTask.value._id, {
      status: newStatus as WorkspaceTask["status"],
    });
  } catch {
    console.error("Failed to update task status");
  } finally {
    draggedTask.value = null;
  }
};

const handleUpdateTask = async (
  taskId: string,
  updates: Partial<WorkspaceTask>,
) => {
  try {
    await tasksStore.updateTask(taskId, updates);
  } catch {
    console.error("Failed to update task");
  }
};

const handleDeleteTask = async (taskId: string) => {
  if (!confirm("Delete this task?")) return;
  try {
    await tasksStore.deleteTask(taskId);
  } catch {
    console.error("Failed to delete task");
  }
};

const handleTaskCreated = () => {
  showCreateTaskModal.value = false;
};
</script>

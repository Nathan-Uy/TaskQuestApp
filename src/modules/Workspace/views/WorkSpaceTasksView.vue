<template>
  <div class="flex flex-col h-full gap-3 pl-8 pr-8">
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
        @click="openCreateModal"
      />
    </div>

    <div v-if="isLoading" class="flex items-center justify-center py-20">
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

    <div v-else class="flex gap-5 flex-1 overflow-hidden overflow-x-auto pb-4">
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
            >
              {{ col.label }}
            </span>
          </div>
          <span
            class="text-[0.7rem] font-semibold rounded-full px-2 py-0.5"
            :style="{ background: col.color + '22', color: col.color }"
          >
            {{ tasksStore.tasksByStatus[col.key].length }}
          </span>
        </div>

        <div
          class="flex flex-col gap-2 flex-1 rounded-2xl border min-h-48 p-3 overflow-y-auto max-h-[calc(100vh-200px)] transition-all duration-150"
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
            @edit="openEditModal"
            @delete="handleDeleteTask"
            @dragstart="handleDragStart($event, task)"
            @dragend="handleDragEnd"
          />
        </div>
      </div>
    </div>

    <!-- Task Form Modal -->
    <Dialog
      v-model:visible="showTaskFormModal"
      :header="editingTask ? 'Edit Task' : 'New Task'"
      :modal="true"
      :draggable="false"
      class="w-full max-w-md rounded-2xl!"
    >
      <TaskForm
        :sprint-id="sprintId"
        :task="editingTask"
        :team-members="teamMembers"
        @close="closeTaskForm"
        @saved="handleTaskSaved"
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
import { useWorkspaceTeamsStore } from "../workspace-team.store";
import { useWorkspaceSprintsStore } from "../workspace-sprints.store";
import TaskCard from "../components/TaskCard.vue";
import TaskForm from "../components/TaskForm.vue";
import type { WorkspaceTask } from "../workspace.types";

const route = useRoute();
const tasksStore = useWorkspaceTasksStore();
const teamsStore = useWorkspaceTeamsStore();
const sprintsStore = useWorkspaceSprintsStore();

const sprintId = route.params.sprintId as string;
const showTaskFormModal = ref(false);
const editingTask = ref<WorkspaceTask | null>(null);
const draggedOverColumn = ref<string | null>(null);
const draggedTask = ref<WorkspaceTask | null>(null);
const teamMembers = ref<{ userId: string; name: string }[]>([]);
const isLoading = ref(true);

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

const loadTeamMembers = async () => {
  try {
    // 1. Fetch the sprint to get teamId
    const sprint = await sprintsStore.fetchSprintById(sprintId);
    const teamId = sprint.teamId;
    if (!teamId) {
      console.warn("Sprint has no teamId");
      return;
    }
    // 2. Fetch the team to get members
    const team = await teamsStore.fetchTeamById(teamId);
    if (team?.members) {
      teamMembers.value = team.members.map((member: any) => ({
        userId: member.userId,
        name: member.name,
      }));
      console.log("Loaded team members:", teamMembers.value);
    } else {
      console.warn("Team not found or no members", teamId);
    }
  } catch (error) {
    console.error("Failed to load team members:", error);
  }
};

onMounted(async () => {
  try {
    isLoading.value = true;
    if (sprintId) {
      await Promise.all([tasksStore.fetchTasks(sprintId), loadTeamMembers()]);
    }
  } finally {
    isLoading.value = false;
  }
});

const openCreateModal = () => {
  editingTask.value = null;
  showTaskFormModal.value = true;
};

const openEditModal = (task: WorkspaceTask) => {
  editingTask.value = task;
  showTaskFormModal.value = true;
};

const closeTaskForm = () => {
  showTaskFormModal.value = false;
  editingTask.value = null;
};

const handleTaskSaved = () => {
  closeTaskForm();
  if (sprintId) tasksStore.fetchTasks(sprintId);
};

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

const handleDeleteTask = async (taskId: string) => {
  if (!confirm("Delete this task?")) return;
  try {
    await tasksStore.deleteTask(taskId);
  } catch {
    console.error("Failed to delete task");
  }
};
</script>

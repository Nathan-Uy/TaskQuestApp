<template>
  <div
    class="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition cursor-pointer border-l-4"
    :class="priorityBorderClass"
  >
    <!-- Title -->
    <h4 class="font-semibold text-gray-800 line-clamp-2 mb-2">
      {{ task.title }}
    </h4>

    <!-- Description -->
    <p v-if="task.description" class="text-sm text-gray-600 line-clamp-2 mb-3">
      {{ task.description }}
    </p>

    <!-- Priority & Status Badge -->
    <div class="flex gap-2 mb-3 flex-wrap">
      <span
        class="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
        :class="priorityClass"
      >
        {{ priorityLabel }}
      </span>
    </div>

    <!-- Assigned To & Due Date -->
    <div class="text-xs text-gray-500 space-y-1 mb-3">
      <div v-if="task.assignedTo" class="flex items-center gap-1">
        👤 <span>Assigned</span>
      </div>
      <div v-if="task.dueDate" class="flex items-center gap-1">
        📅 <span>{{ formatDate(task.dueDate) }}</span>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex gap-2 justify-end">
      <button
        @click.stop="openStatusMenu"
        class="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition"
      >
        Change Status
      </button>
      <button
        @click.stop="$emit('delete', task._id)"
        class="px-2 py-1 text-xs bg-red-50 hover:bg-red-100 text-red-600 rounded transition"
      >
        Delete
      </button>
    </div>

    <!-- Status Menu -->
    <div
      v-if="showStatusMenu"
      class="absolute bg-white border rounded-lg shadow-lg z-10 mt-1"
    >
      <button
        v-for="status in ['todo', 'in-progress', 'done']"
        :key="status"
        @click="changeStatus(status)"
        class="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
      >
        {{ statusLabel(status) }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import type { WorkspaceTask } from "../workspace.types";

interface Props {
  task: WorkspaceTask;
}

interface Emits {
  (e: "update", taskId: string, updates: Partial<WorkspaceTask>): void;
  (e: "delete", taskId: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const showStatusMenu = ref(false);

const priorityLabel = computed(() => {
  const labels: Record<string, string> = {
    low: "🟢 Low",
    medium: "🟡 Medium",
    high: "🔴 High",
  };
  return labels[props.task.priority] || "Medium";
});

const priorityClass = computed(() => {
  const classes: Record<string, string> = {
    low: "bg-green-50 text-green-700",
    medium: "bg-yellow-50 text-yellow-700",
    high: "bg-red-50 text-red-700",
  };
  return classes[props.task.priority] || "bg-gray-50 text-gray-700";
});

const priorityBorderClass = computed(() => {
  const classes: Record<string, string> = {
    low: "border-green-300",
    medium: "border-yellow-300",
    high: "border-red-400",
  };
  return classes[props.task.priority] || "border-gray-300";
});

const formatDate = (date: Date | string) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const statusLabel = (status: string) => {
  const labels: Record<string, string> = {
    todo: "📋 To Do",
    "in-progress": "🔄 In Progress",
    done: "✅ Done",
  };
  return labels[status] || status;
};

const openStatusMenu = () => {
  showStatusMenu.value = !showStatusMenu.value;
};

const changeStatus = (newStatus: string) => {
  emit("update", props.task._id, { status: newStatus as any });
  showStatusMenu.value = false;
};
</script>

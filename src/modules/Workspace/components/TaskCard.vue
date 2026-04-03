<template>
  <div
    draggable="true"
    class="group relative rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-grab active:cursor-grabbing"
    style="
      padding: 12px 14px;
      background: var(--card-bg);
      border-color: var(--card-border);
    "
    @dragstart="$emit('dragstart', $event)"
    @dragend="$emit('dragend')"
  >
    <div
      class="absolute left-0 top-3 bottom-3 w-0.5 rounded-full"
      :style="{ background: accentColor }"
    />

    <div class="flex items-start justify-between gap-2 mb-2">
      <p
        class="text-sm font-semibold leading-snug flex-1"
        style="color: var(--ink-primary)"
      >
        {{ task.title }}
      </p>
      <span
        class="text-[0.65rem] font-semibold px-2 py-0.5 rounded-md shrink-0 capitalize"
        :style="{ background: priorityBg, color: priorityColor }"
        >{{ task.priority }}</span
      >
    </div>

    <p
      v-if="task.description"
      class="text-xs leading-relaxed mb-3 line-clamp-2"
      style="color: var(--ink-muted)"
    >
      {{ task.description }}
    </p>

    <div class="flex items-center justify-between mt-2">
      <span
        v-if="task.dueDate"
        :class="[
          'inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md',
          isOverdue ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500',
        ]"
      >
        <i class="pi pi-calendar text-[0.65rem]" />
        {{ formatDate(task.dueDate) }}
      </span>
      <span v-else />

      <div
        class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-150"
      >
        <Button
          icon="pi pi-pencil"
          text
          rounded
          severity="secondary"
          class="w-7! h-7!"
          @click.stop="$emit('update', task._id, {})"
        />
        <Button
          icon="pi pi-times"
          text
          rounded
          severity="danger"
          class="w-7! h-7!"
          @click.stop="$emit('delete', task._id)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import Button from "primevue/button";
import type { WorkspaceTask } from "../workspace.types";

const props = defineProps<{
  task: WorkspaceTask;
  accentColor: string;
}>();

defineEmits<{
  update: [taskId: string, updates: Partial<WorkspaceTask>];
  delete: [taskId: string];
  dragstart: [event: DragEvent];
  dragend: [];
}>();

const priorityColor = computed(
  () =>
    ({
      low: "#2d7a4f",
      medium: "#a07620",
      high: "#b53a2f",
    })[props.task.priority] ?? "#a07620",
);

const priorityBg = computed(
  () =>
    ({
      low: "#e5f3ec",
      medium: "#fdf3dc",
      high: "#fbeae8",
    })[props.task.priority] ?? "#fdf3dc",
);

const isOverdue = computed(() => {
  if (!props.task.dueDate) return false;
  return new Date(props.task.dueDate) < new Date();
});

const formatDate = (date: Date | string) => {
  const d = new Date(date);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};
</script>

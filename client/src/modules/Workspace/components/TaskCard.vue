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
      >
        {{ task.priority }}
      </span>
    </div>

    <p
      v-if="task.description"
      class="text-xs leading-relaxed mb-3 line-clamp-2"
      style="color: var(--ink-muted)"
    >
      {{ task.description }}
    </p>

    <div class="flex items-center justify-between mt-2 text-xs">
      <div class="flex items-center gap-2">
        <div class="flex items-center gap-1.5">
          <Avatar
            :label="getInitials(task.ownerName || 'U')"
            size="small"
            shape="circle"
            class="w-5 h-5 text-[0.65rem]"
            :style="{ backgroundColor: accentColor, color: 'white' }"
          />
          <span style="color: var(--ink-muted)" class="text-xs">
            {{ task.ownerName || "Unassigned" }}
          </span>
        </div>
        <div
          v-if="task.duration"
          class="flex items-center gap-1 px-2 py-0.5 rounded-md"
          style="background: var(--surface-hover)"
        >
          <i
            class="pi pi-clock text-[0.65rem]"
            style="color: var(--ink-muted)"
          />
          <span style="color: var(--ink-secondary)" class="text-[0.7rem]">
            {{ task.duration }}h
          </span>
        </div>
      </div>

      <div
        class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-150"
      >
        <Button
          icon="pi pi-pencil"
          text
          rounded
          severity="secondary"
          class="w-7! h-7!"
          @click.stop="$emit('edit', task)"
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
import Avatar from "primevue/avatar";
import type { WorkspaceTask } from "../workspace.types";

const props = defineProps<{
  task: WorkspaceTask;
  accentColor: string;
}>();

defineEmits<{
  edit: [task: WorkspaceTask];
  delete: [taskId: string];
  dragstart: [event: DragEvent];
  dragend: [];
}>();

const priorityColor = computed(() => {
  const map: Record<string, string> = {
    low: "#2d7a4f",
    medium: "#a07620",
    high: "#b53a2f",
  };
  return map[props.task.priority] ?? "#a07620";
});

const priorityBg = computed(() => {
  const map: Record<string, string> = {
    low: "#e5f3ec",
    medium: "#fdf3dc",
    high: "#fbeae8",
  };
  return map[props.task.priority] ?? "#fdf3dc";
});

const getInitials = (name: string) => {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
};
</script>

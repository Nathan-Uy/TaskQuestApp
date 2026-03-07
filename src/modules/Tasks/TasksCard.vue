<template>
  <div
    :class="[
      'flex items-start gap-3 bg-white border border-stone-200 rounded-xl px-4 py-3.5 transition-all duration-150 hover:-translate-y-px hover:shadow-sm group',
      task.status === 'completed' && 'opacity-50',
    ]"
  >
    <!-- Checkbox -->
    <button
      v-if="!readonly"
      :class="[
        'mt-0.5 w-5 h-5 shrink-0 rounded-full border transition-all duration-150 flex items-center justify-center',
        task.status === 'completed'
          ? 'bg-emerald-500 border-emerald-500 text-white'
          : 'bg-white border-stone-300 hover:border-emerald-400',
      ]"
      :title="task.status === 'completed' ? 'Completed' : 'Mark complete'"
      @click="emit('complete', task.id)"
    >
      <i
        v-if="task.status === 'completed'"
        class="pi pi-check text-white text-[0.55rem]"
      />
    </button>
    <div
      v-else
      class="mt-0.5 w-5 h-5 shrink-0 rounded-full bg-emerald-500 border-emerald-500 flex items-center justify-center"
    >
      <i class="pi pi-check text-white text-[0.55rem]" />
    </div>

    <!-- Body -->
    <div class="flex-1 min-w-0">
      <p class="text-sm font-medium text-stone-800 mb-1">{{ task.title }}</p>
      <p v-if="task.notes" class="text-xs text-stone-400 mb-1.5">
        {{ task.notes }}
      </p>

      <div class="flex items-center gap-2 flex-wrap">
        <Tag
          :value="task.priority"
          :severity="prioritySeverity"
          class="text-xs! capitalize!"
        />

        <span
          v-if="task.duration"
          class="inline-flex items-center gap-1 text-xs text-stone-400"
        >
          <i class="pi pi-clock text-[0.7rem]" />
          {{ formatDuration(task.duration) }}
        </span>

        <span
          class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-violet-50 text-violet-500"
        >
          +{{ task.xpReward }} XP
        </span>
      </div>
    </div>

    <!-- Delete -->
    <Button
      v-if="!readonly"
      icon="pi pi-times"
      severity="danger"
      text
      rounded
      size="small"
      class="opacity-0 group-hover:opacity-100 transition-opacity duration-150 w-7! h-7!"
      title="Delete"
      @click="emit('delete', task.id)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import Tag from "primevue/tag";
import Button from "primevue/button";
import type { Task } from "@/modules/Tasks/tasks.type";

const props = defineProps<{ task: Task; readonly?: boolean }>();
const emit = defineEmits<{ complete: [id: number]; delete: [id: number] }>();

const prioritySeverity = computed(
  () =>
    (
      ({
        low: "secondary",
        medium: "warn",
        high: "danger",
      }) as const
    )[props.task.priority],
);

function formatDuration(secs: number) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
</script>

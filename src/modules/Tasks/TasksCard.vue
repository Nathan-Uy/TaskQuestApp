<!-- TasksCard.vue -->
<template>
  <div
    :class="[
      'group relative flex items-start gap-4 bg-white rounded-2xl border transition-all duration-200 hover:-translate-y-0.5',
      task.status === 'completed'
        ? 'border-stone-100 opacity-60'
        : 'border-stone-200 hover:border-stone-300 hover:shadow-md',
    ]"
    style="padding: 14px 16px"
  >
    <!-- Priority accent bar -->
    <div
      class="absolute left-0 top-3 bottom-3 w-0.5 rounded-full"
      :style="{ background: priorityColor }"
    />

    <!-- Checkbox -->
    <button
      v-if="!readonly"
      :class="[
        'mt-0.5 w-5 h-5 shrink-0 rounded-full border-2 transition-all duration-200 flex items-center justify-center',
        task.status === 'completed'
          ? 'border-emerald-400 bg-emerald-400'
          : 'border-stone-300 bg-white hover:border-emerald-400 hover:scale-110',
      ]"
      @click="emit('complete', task._id)"
    >
      <i
        v-if="task.status === 'completed'"
        class="pi pi-check text-white"
        style="font-size: 0.5rem"
      />
    </button>
    <div
      v-else
      class="mt-0.5 w-5 h-5 shrink-0 rounded-full border-2 border-emerald-400 bg-emerald-400 flex items-center justify-center"
    >
      <i class="pi pi-check text-white" style="font-size: 0.5rem" />
    </div>

    <!-- Body -->
    <div class="flex-1 min-w-0">
      <p
        :class="[
          'text-sm font-semibold leading-snug',
          task.status === 'completed'
            ? 'line-through text-stone-400'
            : 'text-stone-800',
        ]"
        style="margin-bottom: 4px"
      >
        {{ task.title }}
      </p>
      <p
        v-if="task.notes"
        class="text-xs text-stone-400 leading-relaxed"
        style="margin-bottom: 8px"
      >
        {{ task.notes }}
      </p>

      <div
        class="flex items-center flex-wrap"
        style="gap: 6px; margin-top: 6px"
      >
        <!-- Priority badge -->
        <span
          class="inline-flex items-center rounded-md text-xs font-semibold capitalize"
          style="padding: 2px 8px"
          :style="{ background: priorityBg, color: priorityColor }"
        >
          {{ task.priority }}
        </span>

        <!-- Duration -->
        <span
          v-if="task.duration"
          class="inline-flex items-center gap-1 text-xs text-stone-400"
        >
          <i class="pi pi-clock" style="font-size: 0.65rem" />
          {{ formatDuration(task.duration) }}
        </span>

        <!-- XP -->
        <span
          class="inline-flex items-center rounded-md text-xs font-semibold"
          style="padding: 2px 8px; background: var(--xp-soft); color: var(--xp)"
        >
          +{{ task.xpReward }} XP
        </span>
      </div>
    </div>
    <span
      v-if="task.dueDate"
      :class="[
        'inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md',
        isOverdue(task.dueDate)
          ? 'bg-red-50 text-red-500'
          : isToday(task.dueDate)
            ? 'bg-stone-50 text-stone-400'
            : 'bg-blue-50 text-blue-500',
      ]"
    >
      <i class="pi pi-calendar text-[0.65rem]" />
      {{ formatDueDate(task.dueDate) }}
    </span>

    <!-- Delete -->
    <button
      v-if="!readonly"
      class="opacity-0 group-hover:opacity-100 transition-all duration-150 w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50 shrink-0"
      style="margin-top: 1px; color: #b53a2f"
      title="Delete"
      @click="emit('delete', task._id)"
    >
      <i class="pi pi-times" style="font-size: 0.7rem" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Task } from "@/modules/Tasks/tasks.type";
import { useCalendar } from "@/modules/Calendar/calendar.composable";

const { isOverdue, isToday, formatDueDate } = useCalendar();
const props = defineProps<{ task: Task; readonly?: boolean }>();
const emit = defineEmits<{
  complete: [id: string];
  delete: [id: string];
}>();

const priorityColor = computed(
  () =>
    ({
      low: "#2d7a4f",
      medium: "#a07620",
      high: "#b53a2f",
    })[props.task.priority],
);

const priorityBg = computed(
  () =>
    ({
      low: "#e5f3ec",
      medium: "#fdf3dc",
      high: "#fbeae8",
    })[props.task.priority],
);

function formatDuration(secs: number) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
</script>

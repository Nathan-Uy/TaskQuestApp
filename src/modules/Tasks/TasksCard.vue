<template>
  <div
    :class="[
      'group relative flex flex-col bg-white rounded-2xl border transition-all duration-200',
      task.status === 'completed'
        ? 'border-stone-100 opacity-60'
        : 'border-stone-200 hover:border-stone-300 hover:shadow-md',
      isEditing ? 'shadow-md border-stone-300' : 'hover:-translate-y-0.5',
    ]"
    style="padding: 14px 16px"
  >
    <div
      class="absolute left-0 top-3 bottom-3 w-0.5 rounded-full"
      :style="{ background: priorityColor }"
    />

    <div class="flex items-start gap-4">
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
          class="pi pi-check text-white text-[0.5rem]"
        />
      </button>
      <div
        v-else
        class="mt-0.5 w-5 h-5 shrink-0 rounded-full border-2 border-emerald-400 bg-emerald-400 flex items-center justify-center"
      >
        <i class="pi pi-check text-white text-[0.5rem]" />
      </div>

      <div class="flex-1 min-w-0">
        <div v-if="isEditing">
          <p
            class="font-semibold text-stone-800 mb-3"
            style="font-size: 0.85rem"
          >
            Edit Task
          </p>
          <TaskForm
            v-model:form="editForm"
            submit-label="Save"
            :loading="isSaving"
            @submit="saveEdit"
            @cancel="cancelEdit"
          />
        </div>

        <template v-else>
          <p
            :class="[
              'text-sm font-semibold leading-snug',
              task.status === 'completed'
                ? 'line-through text-stone-400'
                : 'text-stone-800',
              !readonly
                ? 'cursor-pointer hover:text-(--accent) transition-colors duration-150'
                : '',
            ]"
            style="margin-bottom: 4px"
            @click="!readonly && startEdit()"
          >
            {{ task.title }}
          </p>

          <p
            v-if="task.notes"
            :class="[
              'text-xs text-stone-400 leading-relaxed',
              !readonly
                ? 'cursor-pointer hover:text-stone-600 transition-colors duration-150'
                : '',
            ]"
            style="margin-bottom: 8px"
            @click="!readonly && startEdit()"
          >
            {{ task.notes }}
          </p>

          <div
            class="flex items-center flex-wrap"
            style="gap: 6px; margin-top: 6px"
          >
            <span
              class="inline-flex items-center rounded-md text-xs font-semibold capitalize"
              style="padding: 2px 8px"
              :style="{ background: priorityBg, color: priorityColor }"
              >{{ task.priority }}</span
            >

            <span
              v-if="task.duration"
              class="inline-flex items-center gap-1 text-xs text-stone-400"
            >
              <i class="pi pi-clock" style="font-size: 0.65rem" />
              {{ formatDuration(task.duration) }}
            </span>

            <span
              class="inline-flex items-center rounded-md text-xs font-semibold"
              style="
                padding: 2px 8px;
                background: var(--xp-soft);
                color: var(--xp);
              "
              >+{{ task.xpReward }} XP</span
            >
          </div>
        </template>
      </div>

      <div v-if="!isEditing" class="flex items-center gap-1 shrink-0">
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

        <button
          v-if="!readonly"
          class="opacity-0 group-hover:opacity-100 transition-all duration-150 w-7 h-7 rounded-lg flex items-center justify-center hover:bg-stone-100 text-stone-400 hover:text-stone-600 shrink-0"
          title="Edit"
          @click="startEdit"
        >
          <i class="pi pi-pencil text-xs" />
        </button>

        <button
          v-if="!readonly"
          class="opacity-0 group-hover:opacity-100 transition-all duration-150 w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50 shrink-0"
          style="color: #b53a2f"
          title="Delete"
          @click="emit('delete', task._id)"
        >
          <i class="pi pi-times" style="font-size: 0.7rem" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import type { Task, TaskPriority } from "@/modules/Tasks/tasks.type";
import { useCalendarFormatters } from "@/modules/Calendar/calendar.composable";
import { useUpdateTaskMutation } from "@/modules/Tasks/tasks.tanstack";
import TaskForm from "./TaskForm.vue";

const { isOverdue, isToday, formatDueDate } = useCalendarFormatters();
const { mutate: updateTask, isPending: isSaving } = useUpdateTaskMutation();

const props = defineProps<{ task: Task; readonly?: boolean }>();
const emit = defineEmits<{
  complete: [id: string];
  delete: [id: string];
}>();

const isEditing = ref(false);

const editForm = ref({
  title: "",
  notes: "",
  priority: "medium" as TaskPriority,
  dueDate: null as Date | null,
  hours: 0,
  minutes: 25,
  seconds: 0,
});

const startEdit = () => {
  const totalSeconds = props.task.duration ?? 1500;
  editForm.value = {
    title: props.task.title,
    notes: props.task.notes ?? "",
    priority: props.task.priority,
    dueDate: props.task.dueDate ? new Date(props.task.dueDate) : null,
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
  isEditing.value = true;
};

const cancelEdit = () => {
  isEditing.value = false;
};

const saveEdit = () => {
  if (!editForm.value.title.trim()) return;
  const duration =
    editForm.value.hours * 3600 +
    editForm.value.minutes * 60 +
    editForm.value.seconds;
  updateTask(
    {
      id: props.task._id,
      patch: {
        title: editForm.value.title.trim(),
        notes: editForm.value.notes || undefined,
        priority: editForm.value.priority,
        dueDate: editForm.value.dueDate ?? undefined,
        duration: duration || 1500,
      },
    },
    {
      onSuccess: () => {
        isEditing.value = false;
      },
    },
  );
};

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

const formatDuration = (secs: number) => {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};
</script>

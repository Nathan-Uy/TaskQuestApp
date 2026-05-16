<template>
  <div
    :class="[
      'group relative flex flex-col transition-all duration-100',
      isEditing ? '' : 'hover:-translate-y-px',
    ]"
    :style="{
      padding: '14px 16px',
      background: task.status === 'completed' ? '#f5f3ef' : 'var(--card-bg)',
      border: '2px solid var(--ink-primary)',
      boxShadow:
        task.status === 'completed' ? '2px 2px 0 #1a1714' : '4px 4px 0 #1a1714',
      opacity: task.status === 'completed' ? '0.7' : '1',
    }"
  >
    <!-- Priority stripe — left border accent -->
    <div
      class="absolute left-0 top-0 bottom-0 w-1"
      :style="{ background: priorityColor }"
    />

    <div class="flex items-start gap-4">
      <!-- Complete button -->
      <button
        v-if="!readonly"
        :class="[
          'mt-0.5 w-5 h-5 shrink-0 flex items-center justify-center transition-all duration-100',
          task.status === 'completed' ? '' : 'hover:scale-110',
        ]"
        :style="{
          border:
            '2px solid ' +
            (task.status === 'completed' ? '#2d7a4f' : '#1a1714'),
          background:
            task.status === 'completed' ? '#2d7a4f' : 'var(--card-bg)',
          borderRadius: '0',
        }"
        @click="emit('complete', task._id)"
      >
        <i
          v-if="task.status === 'completed'"
          class="pi pi-check text-white text-[0.5rem]"
        />
      </button>
      <div
        v-else
        style="
          margin-top: 2px;
          width: 20px;
          height: 20px;
          flex-shrink: 0;
          border: 2px solid #2d7a4f;
          background: #2d7a4f;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0;
        "
      >
        <i class="pi pi-check text-white text-[0.5rem]" />
      </div>

      <div class="flex-1 min-w-0">
        <div v-if="isEditing">
          <p
            style="
              font-size: 0.85rem;
              font-weight: 800;
              color: var(--ink-primary);
              margin-bottom: 12px;
              text-transform: uppercase;
              letter-spacing: 0.03em;
            "
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
              'text-sm leading-snug',
              task.status === 'completed' ? 'line-through' : '',
              !readonly ? 'cursor-pointer' : '',
            ]"
            :style="{
              fontWeight: '700',
              color:
                task.status === 'completed'
                  ? 'var(--ink-muted)'
                  : 'var(--ink-primary)',
              marginBottom: '6px',
            }"
            @click="!readonly && startEdit()"
          >
            {{ task.title }}
          </p>

          <p
            v-if="task.notes"
            :class="[
              'text-xs leading-relaxed',
              !readonly ? 'cursor-pointer' : '',
            ]"
            :style="{
              color: 'var(--ink-muted)',
              marginBottom: '8px',
              fontWeight: '400',
            }"
            @click="!readonly && startEdit()"
          >
            {{ task.notes }}
          </p>

          <div
            class="flex items-center flex-wrap"
            style="gap: 6px; margin-top: 6px"
          >
            <span
              style="
                font-size: 0.65rem;
                font-weight: 800;
                padding: 2px 7px;
                text-transform: uppercase;
                letter-spacing: 0.06em;
                border: 1.5px solid currentColor;
              "
              :style="{ background: priorityBg, color: priorityColor }"
              >{{ task.priority }}</span
            >

            <span
              v-if="task.duration"
              style="
                font-size: 0.75rem;
                font-weight: 600;
                color: var(--ink-muted);
                display: inline-flex;
                align-items: center;
                gap: 3px;
              "
            >
              <i class="pi pi-clock" style="font-size: 0.6rem" />
              {{ formatDuration(task.duration) }}
            </span>

            <span
              style="
                font-size: 0.65rem;
                font-weight: 800;
                padding: 2px 7px;
                text-transform: uppercase;
                letter-spacing: 0.06em;
                border: 1.5px solid var(--xp);
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
          :style="{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.7rem',
            fontWeight: '700',
            padding: '2px 7px',
            border:
              '1.5px solid ' +
              (isOverdue(task.dueDate)
                ? '#b53a2f'
                : isToday(task.dueDate)
                  ? '#1a1714'
                  : '#1d4ed8'),
            background: isOverdue(task.dueDate)
              ? '#fbeae8'
              : isToday(task.dueDate)
                ? '#f5f3ef'
                : '#dbeafe',
            color: isOverdue(task.dueDate)
              ? '#b53a2f'
              : isToday(task.dueDate)
                ? '#1a1714'
                : '#1d4ed8',
          }"
        >
          <i class="pi pi-calendar" style="font-size: 0.6rem" />
          {{ formatDueDate(task.dueDate) }}
        </span>

        <Button
          v-if="!readonly"
          icon="pi pi-pencil"
          text
          rounded
          severity="secondary"
          class="opacity-0 group-hover:opacity-100 w-7! h-7! transition-all duration-100"
          @click="startEdit"
        />
        <Button
          v-if="!readonly"
          icon="pi pi-times"
          text
          rounded
          severity="danger"
          class="opacity-0 group-hover:opacity-100 w-7! h-7! transition-all duration-100"
          @click="emit('delete', task._id)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import Button from "primevue/button";
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

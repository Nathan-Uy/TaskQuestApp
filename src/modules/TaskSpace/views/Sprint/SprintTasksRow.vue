<template>
  <tr
    :class="[
      'group transition-colors duration-100 border-b',
      isEditing || isNew ? '' : 'hover:bg-(--surface-hover) cursor-pointer',
    ]"
    :style="{
      borderColor: 'var(--card-border)',
      background: isEditing || isNew ? 'var(--accent-soft)' : 'var(--card-bg)',
    }"
    @click="!isEditing && !isNew && startEdit()"
  >
    <td class="px-3 py-2 text-xs" style="color: var(--ink-muted)">
      {{ index }}
    </td>

    <td class="px-2 py-1.5">
      <input
        v-if="isEditing || isNew"
        v-model="form.title"
        placeholder="Task title..."
        class="w-full px-2 py-1 text-sm rounded-lg border outline-none"
        style="
          background: var(--input-bg);
          border-color: var(--input-border);
          color: var(--input-text);
        "
        autofocus
        @keyup.enter="save"
        @keyup.escape="cancel"
      />
      <span
        v-else
        class="text-sm font-medium px-2"
        style="color: var(--ink-primary)"
      >
        {{ task.title || "—" }}
      </span>
    </td>

    <td class="px-2 py-1.5">
      <select
        v-if="isEditing || isNew"
        v-model="form.taskType"
        class="text-xs rounded-lg px-2 py-1 border outline-none w-full"
        style="
          background: var(--input-bg);
          border-color: var(--input-border);
          color: var(--input-text);
        "
      >
        <option value="Frontend">Frontend</option>
        <option value="Backend">Backend</option>
        <option value="Testing">Testing</option>
        <option value="Integration">Integration</option>
        <option value="Research and Development">R&D</option>
        <option value="Design">Design</option>
        <option value="DevOps">DevOps</option>
      </select>
      <span
        v-else
        class="text-xs font-medium px-2 py-0.5 rounded-md"
        :style="getTypeStyle(task.taskType)"
        >{{ task.taskType || "—" }}</span
      >
    </td>

    <td class="px-2 py-1.5">
      <select
        v-if="isEditing || isNew"
        v-model="form.assignedTo"
        class="text-xs rounded-lg px-2 py-1 border outline-none w-full"
        style="
          background: var(--input-bg);
          border-color: var(--input-border);
          color: var(--input-text);
        "
      >
        <option value="">Unassigned</option>
        <option v-for="m in teamMembers" :key="m.userId" :value="m.userId">
          {{ m.name }}
        </option>
      </select>
      <span v-else class="text-xs px-2" style="color: var(--ink-secondary)">
        {{ getAssigneeName(task.assignedTo) || "—" }}
      </span>
    </td>

    <td class="px-2 py-1.5">
      <input
        v-if="isEditing || isNew"
        v-model.number="form.duration"
        type="number"
        min="0"
        step="0.5"
        class="w-full text-xs rounded-lg px-2 py-1 border outline-none text-center"
        style="
          background: var(--input-bg);
          border-color: var(--input-border);
          color: var(--input-text);
        "
      />
      <span v-else class="text-xs px-2" style="color: var(--ink-secondary)">
        {{ task.duration ? `${task.duration}h` : "—" }}
      </span>
    </td>

    <td class="px-2 py-1.5">
      <input
        v-if="isEditing || isNew"
        v-model="form.dueDate"
        type="date"
        class="text-xs rounded-lg px-2 py-1 border outline-none w-full"
        style="
          background: var(--input-bg);
          border-color: var(--input-border);
          color: var(--input-text);
        "
      />
      <span v-else class="text-xs px-2" style="color: var(--ink-secondary)">
        {{ task.dueDate ? formatDate(task.dueDate) : "—" }}
      </span>
    </td>

    <td class="px-2 py-1.5">
      <select
        v-if="isEditing || isNew"
        v-model="form.status"
        class="text-xs rounded-lg px-2 py-1 border outline-none w-full"
        style="
          background: var(--input-bg);
          border-color: var(--input-border);
          color: var(--input-text);
        "
      >
        <option value="todo">To Do</option>
        <option value="in-progress">In Progress</option>
        <option value="done">Done</option>
      </select>
      <span
        v-else
        class="text-xs font-semibold px-2 py-0.5 rounded-md"
        :style="getStatusStyle(task.status)"
        >{{ formatStatus(task.status) }}</span
      >
    </td>

    <td class="px-2 py-1.5">
      <select
        v-if="isEditing || isNew"
        v-model="form.priority"
        class="text-xs rounded-lg px-2 py-1 border outline-none w-full"
        style="
          background: var(--input-bg);
          border-color: var(--input-border);
          color: var(--input-text);
        "
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
      <span
        v-else
        class="text-xs font-semibold px-2 py-0.5 rounded-md capitalize"
        :style="getPriorityStyle(task.priority)"
        >{{ task.priority || "—" }}</span
      >
    </td>

    <td class="px-2 py-1.5">
      <div class="flex items-center gap-1 justify-end">
        <template v-if="isEditing || isNew">
          <Button
            icon="pi pi-check"
            text
            rounded
            class="w-7! h-7! text-emerald-500!"
            @click.stop="save"
          />
          <Button
            icon="pi pi-times"
            text
            rounded
            severity="secondary"
            class="w-7! h-7!"
            @click.stop="cancel"
          />
        </template>
        <template v-else>
          <Button
            icon="pi pi-pencil"
            text
            rounded
            severity="secondary"
            class="w-7! h-7! opacity-0 group-hover:opacity-100 transition-opacity"
            @click.stop="startEdit"
          />
          <Button
            icon="pi pi-times"
            text
            rounded
            severity="danger"
            class="w-7! h-7! opacity-0 group-hover:opacity-100 transition-opacity"
            @click.stop="emit('delete')"
          />
        </template>
      </div>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import Button from "primevue/button";
import type { Task } from "../Tasks/tasks.types";

interface RowTask extends Partial<Task> {
  tempId?: string;
  _isNew?: boolean;
}
interface TeamMember {
  userId: string;
  name: string;
}

const props = defineProps<{
  task: RowTask;
  index: number;
  teamMembers: TeamMember[];
  isNew?: boolean;
}>();

const emit = defineEmits<{
  update: [patch: Partial<Task>];
  save: [patch: Partial<Task>];
  delete: [];
  cancel: [];
}>();

const isEditing = ref(false);

const form = ref({
  title: props.task.title ?? "",
  taskType: props.task.taskType ?? "",
  assignedTo: props.task.assignedTo ?? "",
  duration: props.task.duration ?? 0,
  dueDate: props.task.dueDate
    ? new Date(props.task.dueDate as string).toISOString().split("T")[0]
    : "",
  status: props.task.status ?? "todo",
  priority: props.task.priority ?? "medium",
  description: props.task.description ?? "",
});

watch(
  () => props.task,
  (t) => {
    if (!isEditing.value) {
      form.value = {
        title: t.title ?? "",
        taskType: t.taskType ?? "",
        assignedTo: t.assignedTo ?? "",
        duration: t.duration ?? 0,
        dueDate: props.task.dueDate
          ? (new Date(props.task.dueDate as string)
              .toISOString()
              .split("T")[0] ?? "")
          : "",
        status: t.status ?? "todo",
        priority: t.priority ?? "medium",
        description: t.description ?? "",
      };
    }
  },
  { deep: true },
);

const startEdit = () => {
  isEditing.value = true;
};

const save = () => {
  if (!form.value.title.trim()) return;
  emit("save", {
    ...form.value,
    dueDate: form.value.dueDate || undefined,
  } as Partial<Task>);
  isEditing.value = false;
};

const cancel = () => {
  isEditing.value = false;
  if (props.isNew) emit("cancel");
  else {
    form.value = {
      title: props.task.title ?? "",
      taskType: props.task.taskType ?? "",
      assignedTo: props.task.assignedTo ?? "",
      duration: props.task.duration ?? 0,
      dueDate: props.task.dueDate
        ? (new Date(props.task.dueDate as string).toISOString().split("T")[0] ??
          "")
        : "",
      status: props.task.status ?? "todo",
      priority: props.task.priority ?? "medium",
      description: props.task.description ?? "",
    };
  }
};

const getAssigneeName = (userId?: string) =>
  props.teamMembers.find((m) => m.userId === userId)?.name ?? "";

const formatDate = (date: string | Date) =>
  new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

const formatStatus = (status?: string) =>
  ({
    todo: "To Do",
    "in-progress": "In Progress",
    done: "Done",
  })[status ?? ""] ??
  status ??
  "—";

const getStatusStyle = (status?: string) =>
  ({
    todo: { background: "#eef2ff", color: "#6366f1" },
    "in-progress": { background: "#fffbeb", color: "#f59e0b" },
    done: { background: "#ecfdf5", color: "#10b981" },
  })[status ?? ""] ?? {
    background: "var(--surface-muted)",
    color: "var(--ink-muted)",
  };

const getPriorityStyle = (priority?: string) =>
  ({
    low: { background: "#e5f3ec", color: "#2d7a4f" },
    medium: { background: "#fdf3dc", color: "#a07620" },
    high: { background: "#fbeae8", color: "#b53a2f" },
  })[priority ?? ""] ?? {
    background: "var(--surface-muted)",
    color: "var(--ink-muted)",
  };

const getTypeStyle = (type?: string) => {
  const map: Record<string, { background: string; color: string }> = {
    Frontend: { background: "#e0f2fe", color: "#0077b6" },
    Backend: { background: "#f0ebfb", color: "#7c5cbf" },
    Testing: { background: "#fde8ed", color: "#be3455" },
    Integration: { background: "#fdf3dc", color: "#a07620" },
    "Research and Development": { background: "#e5f3ec", color: "#2d7a4f" },
    Design: { background: "#f5e9e1", color: "#c2622a" },
    DevOps: { background: "#f0ede8", color: "#6b6560" },
  };
  return (
    map[type ?? ""] ?? {
      background: "var(--surface-muted)",
      color: "var(--ink-muted)",
    }
  );
};
</script>

<template>
  <tr
    :class="['group transition-colors duration-100']"
    :style="{
      borderBottom: '2px solid var(--ink-primary)',
      background: isEditing || isNew ? 'var(--accent-soft)' : 'var(--card-bg)',
      cursor: isEditing || isNew ? 'default' : 'pointer',
    }"
    @click="!isEditing && !isNew && startEdit()"
  >
    <!-- Index -->
    <td
      style="
        padding: 8px 12px;
        font-size: 0.7rem;
        font-weight: 700;
        color: var(--ink-muted);
        border-right: 1px solid var(--card-border);
      "
    >
      {{ index }}
    </td>

    <!-- Title -->
    <td style="padding: 6px 8px; border-right: 1px solid var(--card-border)">
      <input
        v-if="isEditing || isNew"
        v-model="form.title"
        placeholder="Task title..."
        autofocus
        style="
          width: 100%;
          padding: 6px 8px;
          font-size: 0.8rem;
          font-weight: 600;
          border: 2px solid var(--ink-primary);
          background: #fff;
          color: var(--ink-primary);
          outline: none;
          box-shadow: 2px 2px 0 var(--ink-primary);
        "
        @keyup.enter="save"
        @keyup.escape="cancel"
      />
      <span
        v-else
        style="
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--ink-primary);
          padding: 0 4px;
        "
      >
        {{ task.title || "—" }}
      </span>
    </td>

    <!-- Type -->
    <td style="padding: 6px 8px; border-right: 1px solid var(--card-border)">
      <select
        v-if="isEditing || isNew"
        v-model="form.taskType"
        style="
          width: 100%;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 6px 8px;
          border: 2px solid var(--ink-primary);
          background: #fff;
          color: var(--ink-primary);
          outline: none;
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
        style="
          font-size: 0.65rem;
          font-weight: 800;
          padding: 3px 7px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border: 1.5px solid currentColor;
          display: inline-block;
        "
        :style="getTypeStyle(task.taskType)"
      >
        {{ task.taskType || "—" }}
      </span>
    </td>

    <!-- Assigned -->
    <td style="padding: 6px 8px; border-right: 1px solid var(--card-border)">
      <select
        v-if="isEditing || isNew"
        v-model="form.assignedTo"
        style="
          width: 100%;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 6px 8px;
          border: 2px solid var(--ink-primary);
          background: #fff;
          color: var(--ink-primary);
          outline: none;
        "
      >
        <option value="">Unassigned</option>
        <option v-for="m in teamMembers" :key="m.userId" :value="m.userId">
          {{ m.name }}
        </option>
      </select>
      <span
        v-else
        style="
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--ink-secondary);
          padding: 0 4px;
        "
      >
        {{ getAssigneeName(task.assignedTo) || "—" }}
      </span>
    </td>

    <!-- Duration -->
    <td style="padding: 6px 8px; border-right: 1px solid var(--card-border)">
      <input
        v-if="isEditing || isNew"
        v-model.number="form.duration"
        type="number"
        min="0"
        step="0.5"
        style="
          width: 100%;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 6px 8px;
          border: 2px solid var(--ink-primary);
          background: #fff;
          color: var(--ink-primary);
          outline: none;
          text-align: center;
        "
      />
      <span
        v-else
        style="
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--ink-secondary);
          padding: 0 4px;
        "
      >
        {{ task.duration ? `${task.duration}h` : "—" }}
      </span>
    </td>

    <!-- Due Date -->
    <td style="padding: 6px 8px; border-right: 1px solid var(--card-border)">
      <input
        v-if="isEditing || isNew"
        v-model="form.dueDate"
        type="date"
        style="
          width: 100%;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 6px 8px;
          border: 2px solid var(--ink-primary);
          background: #fff;
          color: var(--ink-primary);
          outline: none;
        "
      />
      <span
        v-else
        style="
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--ink-secondary);
          padding: 0 4px;
        "
      >
        {{ task.dueDate ? formatDate(task.dueDate) : "—" }}
      </span>
    </td>

    <!-- Status -->
    <td style="padding: 6px 8px; border-right: 1px solid var(--card-border)">
      <select
        v-if="isEditing || isNew"
        v-model="form.status"
        style="
          width: 100%;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 6px 8px;
          border: 2px solid var(--ink-primary);
          background: #fff;
          color: var(--ink-primary);
          outline: none;
        "
      >
        <option value="todo">To Do</option>
        <option value="in-progress">In Progress</option>
        <option value="done">Done</option>
      </select>
      <span
        v-else
        style="
          font-size: 0.65rem;
          font-weight: 800;
          padding: 3px 7px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border: 1.5px solid currentColor;
          display: inline-block;
        "
        :style="getStatusStyle(task.status)"
      >
        {{ formatStatus(task.status) }}
      </span>
    </td>

    <!-- Priority -->
    <td style="padding: 6px 8px; border-right: 1px solid var(--card-border)">
      <select
        v-if="isEditing || isNew"
        v-model="form.priority"
        style="
          width: 100%;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 6px 8px;
          border: 2px solid var(--ink-primary);
          background: #fff;
          color: var(--ink-primary);
          outline: none;
        "
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
      <span
        v-else
        style="
          font-size: 0.65rem;
          font-weight: 800;
          padding: 3px 7px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border: 1.5px solid currentColor;
          display: inline-block;
        "
        :style="getPriorityStyle(task.priority)"
      >
        {{ task.priority || "—" }}
      </span>
    </td>

    <!-- Actions -->
    <td style="padding: 6px 8px">
      <div
        style="
          display: flex;
          align-items: center;
          gap: 4px;
          justify-content: flex-end;
        "
      >
        <template v-if="isEditing || isNew">
          <button
            style="
              width: 26px;
              height: 26px;
              background: var(--success-soft);
              border: 2px solid var(--success);
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              box-shadow: 2px 2px 0 var(--success);
              transition: all 80ms ease;
            "
            @mouseenter="
              ($event.currentTarget as HTMLElement).style.transform =
                'translate(1px,1px)';
              ($event.currentTarget as HTMLElement).style.boxShadow =
                '1px 1px 0 var(--success)';
            "
            @mouseleave="
              ($event.currentTarget as HTMLElement).style.transform = 'none';
              ($event.currentTarget as HTMLElement).style.boxShadow =
                '2px 2px 0 var(--success)';
            "
            @click.stop="save"
          >
            <i
              class="pi pi-check"
              style="font-size: 0.65rem; color: var(--success)"
            />
          </button>
          <button
            style="
              width: 26px;
              height: 26px;
              background: var(--surface-muted);
              border: 2px solid var(--ink-primary);
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              box-shadow: 2px 2px 0 var(--ink-primary);
              transition: all 80ms ease;
            "
            @mouseenter="
              ($event.currentTarget as HTMLElement).style.transform =
                'translate(1px,1px)';
              ($event.currentTarget as HTMLElement).style.boxShadow =
                '1px 1px 0 var(--ink-primary)';
            "
            @mouseleave="
              ($event.currentTarget as HTMLElement).style.transform = 'none';
              ($event.currentTarget as HTMLElement).style.boxShadow =
                '2px 2px 0 var(--ink-primary)';
            "
            @click.stop="cancel"
          >
            <i
              class="pi pi-times"
              style="font-size: 0.65rem; color: var(--ink-primary)"
            />
          </button>
        </template>
        <template v-else>
          <button
            style="
              width: 26px;
              height: 26px;
              background: #fff;
              border: 2px solid var(--ink-primary);
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              box-shadow: 2px 2px 0 var(--ink-primary);
              opacity: 0;
              transition: all 80ms ease;
            "
            class="group-hover:opacity-100"
            @mouseenter="
              ($event.currentTarget as HTMLElement).style.transform =
                'translate(1px,1px)';
              ($event.currentTarget as HTMLElement).style.boxShadow =
                '1px 1px 0 var(--ink-primary)';
            "
            @mouseleave="
              ($event.currentTarget as HTMLElement).style.transform = 'none';
              ($event.currentTarget as HTMLElement).style.boxShadow =
                '2px 2px 0 var(--ink-primary)';
            "
            @click.stop="startEdit"
          >
            <i
              class="pi pi-pencil"
              style="font-size: 0.65rem; color: var(--ink-primary)"
            />
          </button>
          <button
            style="
              width: 26px;
              height: 26px;
              background: var(--danger-soft);
              border: 2px solid var(--danger);
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              box-shadow: 2px 2px 0 var(--danger);
              opacity: 0;
              transition: all 80ms ease;
            "
            class="group-hover:opacity-100"
            @mouseenter="
              ($event.currentTarget as HTMLElement).style.transform =
                'translate(1px,1px)';
              ($event.currentTarget as HTMLElement).style.boxShadow =
                '1px 1px 0 var(--danger)';
            "
            @mouseleave="
              ($event.currentTarget as HTMLElement).style.transform = 'none';
              ($event.currentTarget as HTMLElement).style.boxShadow =
                '2px 2px 0 var(--danger)';
            "
            @click.stop="emit('delete')"
          >
            <i
              class="pi pi-times"
              style="font-size: 0.65rem; color: var(--danger)"
            />
          </button>
        </template>
      </div>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
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
        dueDate: t.dueDate
          ? new Date(t.dueDate as string).toISOString().split("T")[0]
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
        ? new Date(props.task.dueDate as string).toISOString().split("T")[0]
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
  ({ todo: "To Do", "in-progress": "In Progress", done: "Done" })[
    status ?? ""
  ] ??
  status ??
  "—";

const getStatusStyle = (status?: string) =>
  ({
    todo: { color: "#7c5cbf", background: "var(--xp-soft)" },
    "in-progress": {
      color: "var(--warning)",
      background: "var(--warning-soft)",
    },
    done: { color: "var(--success)", background: "var(--success-soft)" },
  })[status ?? ""] ?? {
    color: "var(--ink-muted)",
    background: "var(--surface-muted)",
  };

const getPriorityStyle = (priority?: string) =>
  ({
    low: { color: "var(--success)", background: "var(--success-soft)" },
    medium: { color: "var(--warning)", background: "var(--warning-soft)" },
    high: { color: "var(--danger)", background: "var(--danger-soft)" },
  })[priority ?? ""] ?? {
    color: "var(--ink-muted)",
    background: "var(--surface-muted)",
  };

const getTypeStyle = (type?: string) => {
  const map: Record<string, { color: string; background: string }> = {
    Frontend: { color: "#0077b6", background: "#e0f2fe" },
    Backend: { color: "var(--xp)", background: "var(--xp-soft)" },
    Testing: { color: "#be3455", background: "#fde8ed" },
    Integration: { color: "var(--warning)", background: "var(--warning-soft)" },
    "Research and Development": {
      color: "var(--success)",
      background: "var(--success-soft)",
    },
    Design: { color: "var(--accent)", background: "var(--accent-soft)" },
    DevOps: {
      color: "var(--ink-secondary)",
      background: "var(--surface-muted)",
    },
  };
  return (
    map[type ?? ""] ?? {
      color: "var(--ink-muted)",
      background: "var(--surface-muted)",
    }
  );
};
</script>

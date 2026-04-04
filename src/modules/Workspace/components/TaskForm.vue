<template>
  <div class="p-1">
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label
          class="block text-sm font-semibold mb-1"
          style="color: var(--ink-primary)"
        >
          Title *
        </label>
        <InputText
          v-model="form.title"
          type="text"
          placeholder="Task title"
          class="w-full"
          required
          autofocus
        />
      </div>

      <div>
        <label
          class="block text-sm font-semibold mb-1"
          style="color: var(--ink-primary)"
        >
          Description
        </label>
        <Textarea
          v-model="form.description"
          rows="3"
          placeholder="Optional description"
          class="w-full"
        />
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label
            class="block text-sm font-semibold mb-1"
            style="color: var(--ink-primary)"
          >
            Priority
          </label>
          <Select
            v-model="form.priority"
            :options="priorityOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full"
          />
        </div>
        <div>
          <label
            class="block text-sm font-semibold mb-1"
            style="color: var(--ink-primary)"
          >
            Duration (hours)
          </label>
          <InputNumber
            v-model="form.duration"
            :min="0"
            :step="0.5"
            placeholder="e.g., 2.5"
            class="w-full"
            suffix=" h"
          />
        </div>
      </div>

      <div>
        <label
          class="block text-sm font-semibold mb-1"
          style="color: var(--ink-primary)"
        >
          Assign to
        </label>
        <Select
          v-model="form.ownerId"
          :options="teamMembers"
          optionLabel="name"
          optionValue="userId"
          placeholder="Select member (optional)"
          class="w-full"
          @change="updateOwnerName"
        >
          <template #empty>No team members available</template>
        </Select>
      </div>

      <div class="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          label="Cancel"
          severity="secondary"
          text
          @click="$emit('close')"
        />
        <Button
          type="submit"
          :label="isEditing ? 'Update' : 'Create'"
          :loading="submitting"
          :disabled="!form.title.trim()"
        />
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import Select from "primevue/select";
import InputNumber from "primevue/inputnumber";
import Button from "primevue/button";
import { useWorkspaceTasksStore } from "../workspace-tasks.store";
import type { WorkspaceTask, TaskPriority } from "../workspace.types";

interface Props {
  sprintId: string;
  task?: WorkspaceTask | null;
  teamMembers: { userId: string; name: string }[];
}

interface Emits {
  (e: "close"): void;
  (e: "saved"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const tasksStore = useWorkspaceTasksStore();
const submitting = ref(false);

const priorityOptions = [
  { label: "Low", value: "low" as TaskPriority },
  { label: "Medium", value: "medium" as TaskPriority },
  { label: "High", value: "high" as TaskPriority },
];

const form = reactive({
  title: "",
  description: "",
  priority: "medium" as TaskPriority,
  duration: null as number | null,
  ownerId: "",
  ownerName: "",
});

const isEditing = computed(() => !!props.task);

const updateOwnerName = () => {
  const selected = props.teamMembers.find((m) => m.userId === form.ownerId);
  form.ownerName = selected?.name || "";
};

const initializeForm = () => {
  if (props.task) {
    form.title = props.task.title || "";
    form.description = props.task.description || "";
    form.priority = props.task.priority || "medium";
    form.duration = props.task.duration ?? null;
    form.ownerId = props.task.assignedTo || "";
    form.ownerName = props.task.ownerName || "";
  } else {
    form.title = "";
    form.description = "";
    form.priority = "medium";
    form.duration = null;
    form.ownerId = "";
    form.ownerName = "";
  }
};

const toUndefined = <T,>(value: T | null | undefined): T | undefined => {
  return value === null ? undefined : value;
};

const handleSubmit = async () => {
  if (!form.title.trim()) return;
  submitting.value = true;
  try {
    if (isEditing.value && props.task) {
      await tasksStore.updateTask(props.task._id, {
        title: form.title,
        description: form.description,
        priority: form.priority,
        duration: toUndefined(form.duration),
        assignedTo: toUndefined(form.ownerId),
        ownerName: toUndefined(form.ownerName),
      });
    } else {
      await tasksStore.createTask({
        sprintId: props.sprintId,
        title: form.title,
        description: form.description,
        priority: form.priority,
        duration: toUndefined(form.duration),
        assignedTo: toUndefined(form.ownerId),
        ownerName: toUndefined(form.ownerName),
      });
    }
    emit("saved");
    emit("close");
  } catch (error) {
    console.error("Failed to save task", error);
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  initializeForm();
});
</script>

<template>
  <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
    <div class="flex flex-col gap-1.5">
      <label class="text-xs font-medium" style="color: var(--ink-secondary)"
        >Task title</label
      >
      <InputText
        v-model="form.title"
        placeholder="What needs to be done?"
        class="w-full"
        autofocus
      />
    </div>

    <div class="flex flex-col gap-1.5">
      <label class="text-xs font-medium" style="color: var(--ink-secondary)">
        Description
        <span class="font-normal" style="color: var(--ink-muted)"
          >(optional)</span
        >
      </label>
      <Textarea
        v-model="form.description"
        :rows="3"
        placeholder="Any details..."
        class="w-full resize-none"
      />
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-medium" style="color: var(--ink-secondary)"
          >Priority</label
        >
        <Select
          v-model="form.priority"
          :options="priorityOptions"
          option-label="label"
          option-value="value"
          class="w-full"
        />
      </div>
      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-medium" style="color: var(--ink-secondary)">
          Due date
          <span class="font-normal" style="color: var(--ink-muted)"
            >(optional)</span
          >
        </label>
        <DatePicker
          v-model="form.dueDate"
          show-icon
          icon-display="input"
          date-format="M dd, yy"
          class="w-full"
        />
      </div>
    </div>

    <div
      v-if="error"
      class="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2"
    >
      {{ error }}
    </div>

    <div class="flex justify-end gap-2 pt-1">
      <Button
        label="Cancel"
        severity="secondary"
        text
        @click="emit('close')"
        :disabled="isLoading"
      />
      <Button
        :label="isLoading ? 'Creating...' : 'Create Task'"
        :loading="isLoading"
        :disabled="!form.title.trim() || isLoading"
        type="submit"
        class="bg-(--accent)! border-none! rounded-[10px]! text-sm! font-semibold!"
      />
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from "vue";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import Select from "primevue/select";
import DatePicker from "primevue/datepicker";
import Button from "primevue/button";
import { useWorkspaceTasksStore } from "../workspace-tasks.store";

const props = defineProps<{ sprintId: string }>();
const emit = defineEmits<{ close: []; created: [] }>();

const tasksStore = useWorkspaceTasksStore();
const error = ref("");
const isLoading = ref(false);

const priorityOptions = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
];

const form = ref({
  title: "",
  description: "",
  priority: "medium",
  dueDate: null as Date | null,
});

const handleSubmit = async () => {
  if (!form.value.title.trim()) {
    error.value = "Task title is required";
    return;
  }
  isLoading.value = true;
  error.value = "";
  try {
    const dueDate = form.value.dueDate
      ? (() => {
          const d = form.value.dueDate!;
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        })()
      : null;
    await tasksStore.createTask(
      props.sprintId,
      form.value.title.trim(),
      form.value.description.trim(),
      form.value.priority,
      dueDate,
    );
    emit("created");
    emit("close");
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Failed to create task";
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <Dialog
    v-model:visible="visible"
    header="New Project"
    :modal="true"
    :draggable="false"
    class="w-full max-w-md"
    @hide="resetForm"
  >
    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-1.5">
        <label
          for="project-name"
          style="
            font-size: 0.7rem;
            font-weight: 800;
            color: var(--ink-primary);
            text-transform: uppercase;
            letter-spacing: 0.08em;
          "
        >
          Project name
        </label>
        <InputText
          v-model="name"
          placeholder="e.g. Mobile App, Website Redesign"
          class="w-full"
          autofocus
        />
      </div>

      <div class="flex flex-col gap-1.5">
        <label
          for="project-description"
          style="
            font-size: 0.7rem;
            font-weight: 800;
            color: var(--ink-primary);
            text-transform: uppercase;
            letter-spacing: 0.08em;
          "
        >
          Description
          <span
            style="
              font-weight: 500;
              text-transform: none;
              letter-spacing: 0;
              color: var(--ink-muted);
            "
            >(optional)</span
          >
        </label>
        <Textarea
          v-model="description"
          :rows="3"
          placeholder="What's this project about?"
          class="w-full resize-none"
        />
      </div>

      <div
        v-if="error"
        style="
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--danger);
          background: var(--danger-soft);
          border: 2px solid var(--danger);
          padding: 8px 12px;
        "
      >
        {{ error }}
      </div>

      <div
        style="
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          border-top: 2px solid var(--surface-muted);
          padding-top: 16px;
          margin-top: 4px;
        "
      >
        <Button
          label="Cancel"
          severity="secondary"
          text
          @click="visible = false"
        />
        <Button
          label="Create Project"
          :disabled="!name.trim()"
          style="background: var(--accent); color: #fff; font-weight: 800"
          @click="handleSubmit"
        />
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import Button from "primevue/button";

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  create: [payload: { name: string; description: string }];
}>();

const visible = ref(props.modelValue);
const name = ref("");
const description = ref("");
const error = ref("");

watch(
  () => props.modelValue,
  (v) => {
    visible.value = v;
  },
);
watch(visible, (v) => emit("update:modelValue", v));

const resetForm = () => {
  name.value = "";
  description.value = "";
  error.value = "";
};

const handleSubmit = () => {
  if (!name.value.trim()) {
    error.value = "Project name is required";
    return;
  }
  emit("create", {
    name: name.value.trim(),
    description: description.value.trim(),
  });
  visible.value = false;
};
</script>

<template>
  <Dialog
    v-model:visible="visible"
    header="New Project"
    :modal="true"
    :draggable="false"
    class="w-full max-w-md"
    @hide="resetForm"
  >
    <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-medium" style="color: var(--ink-secondary)"
          >Project name</label
        >
        <InputText
          v-model="name"
          placeholder="e.g. Mobile App, Website Redesign"
          class="w-full"
          autofocus
        />
      </div>
      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-medium" style="color: var(--ink-secondary)">
          Description
          <span style="color: var(--ink-muted)" class="font-normal"
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
        class="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2"
      >
        {{ error }}
      </div>
      <div class="flex justify-end gap-2 pt-1">
        <Button
          label="Cancel"
          severity="secondary"
          text
          class="rounded-xl! text-sm!"
          @click="visible = false"
        />
        <Button
          label="Create Project"
          type="submit"
          :disabled="!name.trim()"
          class="bg-(--accent)! border-none! rounded-xl! text-sm! font-semibold!"
        />
      </div>
    </form>
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

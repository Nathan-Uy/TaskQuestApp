<template>
  <Dialog
    v-model:visible="visible"
    header="Create New Team"
    :modal="true"
    class="w-full max-w-md"
    @hide="onHide"
  >
    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-1.5">
        <label
          for="team-name"
          style="
            font-size: 0.7rem;
            font-weight: 800;
            color: var(--ink-primary);
            text-transform: uppercase;
            letter-spacing: 0.08em;
          "
        >
          Team Name *
        </label>
        <InputText
          v-model="localName"
          placeholder="e.g., Engineering, Marketing"
          class="w-full"
          autofocus
        />
      </div>

      <div class="flex flex-col gap-1.5">
        <label
          for="description"
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
          v-model="localDescription"
          :rows="3"
          placeholder="What's this team for?"
          class="w-full resize-none"
        />
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
          label="Create"
          :loading="loading"
          :disabled="!localName.trim()"
          style="background: var(--accent); color: #fff; font-weight: 800"
          @click="handleSubmit"
        />
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import Button from "primevue/button";

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "create", payload: { name: string; description: string }): void;
}>();

const localName = ref("");
const localDescription = ref("");
const loading = ref(false);

const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit("update:modelValue", value),
});

const resetForm = () => {
  localName.value = "";
  localDescription.value = "";
};

watch(
  () => props.modelValue,
  (val) => {
    if (!val) resetForm();
  },
);
const onHide = () => resetForm();

const handleSubmit = async () => {
  if (!localName.value.trim()) return;
  loading.value = true;
  try {
    emit("create", {
      name: localName.value.trim(),
      description: localDescription.value.trim(),
    });
    visible.value = false;
  } finally {
    loading.value = false;
  }
};
</script>

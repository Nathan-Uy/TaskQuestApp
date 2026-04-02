<template>
  <Dialog
    :visible="true"
    modal
    header="Create Sprint"
    :style="{ width: '28rem' }"
    :closable="true"
    :dismissableMask="true"
    @update:visible="handleClose"
    :pt="{
      root: {
        style: {
          background: 'var(--surface-card)',
          color: 'var(--ink-primary)',
          borderRadius: '0.75rem',
          overflow: 'hidden',
        },
      },
      header: {
        style: {
          background: 'var(--surface-card)',
          color: 'var(--ink-primary)',
          borderBottom: '1px solid var(--surface-border)',
          padding: '1.25rem 1.5rem',
        },
      },
      content: {
        style: {
          background: 'var(--surface-card)',
          color: 'var(--ink-primary)',
          padding: '1.5rem',
        },
      },
      footer: {
        style: {
          background: 'var(--surface-card)',
          borderTop: '1px solid var(--surface-border)',
          padding: '1rem 1.5rem',
        },
      },
    }"
  >
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-semibold mb-2">Sprint Name</label>
        <InputText
          v-model="sprintName"
          placeholder="e.g., Sprint 1"
          class="w-full rounded-lg"
          :pt="{
            root: {
              style: {
                background: 'var(--input-bg)',
                border: '1px solid var(--input-border)',
                color: 'var(--input-text)',
              },
            },
          }"
          @keyup.enter="createSprint"
        />
      </div>

      <div>
        <label class="block text-sm font-semibold mb-2">Start Date</label>
        <DatePicker
          v-model="startDate"
          showIcon
          dateFormat="yy-mm-dd"
          class="w-full"
          :pt="{
            input: {
              style: {
                background: 'var(--input-bg)',
                border: '1px solid var(--input-border)',
                color: 'var(--input-text)',
              },
            },
          }"
        />
      </div>

      <div>
        <label class="block text-sm font-semibold mb-2">End Date</label>
        <DatePicker
          v-model="endDate"
          showIcon
          dateFormat="yy-mm-dd"
          class="w-full"
          :pt="{
            input: {
              style: {
                background: 'var(--input-bg)',
                border: '1px solid var(--input-border)',
                color: 'var(--input-text)',
              },
            },
          }"
        />
      </div>
    </div>

    <template #footer>
      <div class="flex gap-2 w-full">
        <Button
          label="Cancel"
          class="flex-1 rounded-lg font-semibold"
          severity="secondary"
          :style="{
            background: 'var(--surface-hover)',
            border: 'none',
            color: 'var(--ink-primary)',
          }"
          @click="handleClose"
        />

        <Button
          label="Create"
          class="flex-1 rounded-lg font-semibold"
          :loading="loading"
          :disabled="!isFormValid"
          :style="{
            background: 'var(--accent)',
            border: 'none',
            color: 'white',
          }"
          @click="createSprint"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import { useWorkspaceSprintsStore } from "../workspace-sprints.store";

// PrimeVue
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import DatePicker from "primevue/datepicker";
import Button from "primevue/button";

const emit = defineEmits<{
  close: [];
  created: [];
}>();

const route = useRoute();
const sprintsStore = useWorkspaceSprintsStore();

const sprintName = ref("");
const startDate = ref<Date | null>(null);
const endDate = ref<Date | null>(null);
const loading = ref(false);

const teamId = route.params.teamId as string;

const handleClose = () => {
  emit("close");
};

const formatDateForApi = (date: Date): string => {
  return date.toISOString().slice(0, 10);
};

const isFormValid = computed(() => {
  return (
    sprintName.value.trim() &&
    startDate.value &&
    endDate.value &&
    startDate.value <= endDate.value
  );
});

const createSprint = async () => {
  if (!isFormValid.value || !startDate.value || !endDate.value) return;

  loading.value = true;

  try {
    await sprintsStore.createSprint(
      teamId,
      sprintName.value,
      formatDateForApi(startDate.value),
      formatDateForApi(endDate.value),
    );

    emit("created");
  } catch (error) {
    console.error("Failed to create sprint:", error);
  } finally {
    loading.value = false;
  }
};
</script>

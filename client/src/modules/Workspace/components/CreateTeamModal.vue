<template>
  <Dialog
    :visible="true"
    modal
    header="Create Team"
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
        <label class="block text-sm font-semibold mb-2">Team Name</label>
        <InputText
          v-model="teamName"
          placeholder="e.g., Frontend Team"
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
          @keyup.enter="createTeam"
        />
      </div>

      <div>
        <label class="block text-sm font-semibold mb-2">Description</label>
        <Textarea
          v-model="description"
          placeholder="Team description..."
          rows="3"
          autoResize
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
          :disabled="!teamName.trim()"
          :style="{
            background: 'var(--accent)',
            border: 'none',
            color: 'white',
          }"
          @click="createTeam"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useWorkspaceTeamsStore } from "../workspace-team.store";

// PrimeVue
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import Button from "primevue/button";

const emit = defineEmits<{
  close: [];
  created: [];
}>();

const teamsStore = useWorkspaceTeamsStore();

const teamName = ref("");
const description = ref("");
const loading = ref(false);

const handleClose = () => {
  emit("close");
};

const createTeam = async () => {
  if (!teamName.value.trim()) return;

  loading.value = true;

  try {
    await teamsStore.createTeam(teamName.value, description.value);
    emit("created");
  } catch (error) {
    console.error("Failed to create team:", error);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold" style="color: var(--ink-primary)">
        Sprints
      </h2>

      <Button
        label="New Sprint"
        icon="pi pi-plus"
        class="rounded-lg font-semibold"
        :style="{
          background: 'var(--accent)',
          border: 'none',
          color: 'white',
        }"
        @click="showCreateSprint = true"
      />
    </div>

    <!-- Sprints List -->
    <div v-if="sprints.length" class="space-y-3">
      <Card
        v-for="sprint in sprints"
        :key="sprint._id"
        class="cursor-pointer transition-all hover:shadow-md"
        :pt="{
          root: {
            style: {
              background: 'var(--surface-card)',
              border: '1px solid var(--surface-border)',
              borderRadius: '0.75rem',
            },
          },
          body: {
            style: {
              padding: '1rem',
            },
          },
        }"
        @click="selectSprint(sprint._id)"
      >
        <template #content>
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <h3 class="font-semibold mb-1" style="color: var(--ink-primary)">
                {{ sprint.name }}
              </h3>
              <p class="text-sm" style="color: var(--ink-muted)">
                {{ formatDate(sprint.startDate) }} -
                {{ formatDate(sprint.endDate) }}
              </p>
            </div>

            <i
              class="pi pi-chevron-right"
              style="color: var(--ink-secondary)"
            />
          </div>
        </template>
      </Card>
    </div>

    <!-- Empty State -->
    <Card
      v-else
      class="text-center"
      :pt="{
        root: {
          style: {
            background: 'var(--surface-card)',
            border: '1px solid var(--surface-border)',
            borderRadius: '0.75rem',
          },
        },
        body: {
          style: {
            padding: '3rem 1rem',
          },
        },
      }"
    >
      <template #content>
        <div class="flex flex-col items-center gap-3">
          <i class="pi pi-calendar text-4xl" style="color: var(--ink-muted)" />
          <p style="color: var(--ink-muted)">
            No sprints yet. Create one to start planning!
          </p>
        </div>
      </template>
    </Card>

    <!-- Create Sprint Modal -->
    <CreateSprintModal
      v-if="showCreateSprint"
      @close="showCreateSprint = false"
      @created="handleSprintCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { useWorkspaceSprintsStore } from "../workspace-sprints.store";
import { useWorkspaceTasksStore } from "../workspace-tasks.store";
import CreateSprintModal from "../components/CreateSprintModal.vue";

// PrimeVue
import Button from "primevue/button";
import Card from "primevue/card";

const router = useRouter();
const route = useRoute();
const sprintsStore = useWorkspaceSprintsStore();
const tasksStore = useWorkspaceTasksStore();

const { sprints } = storeToRefs(sprintsStore);
const showCreateSprint = ref(false);

const teamId = route.params.teamId as string;

onMounted(() => {
  if (teamId) {
    sprintsStore.fetchSprints(teamId);
  }
});

const formatDate = (date: string) => new Date(date).toLocaleDateString();

const selectSprint = (sprintId: string) => {
  sprintsStore.setCurrentSprint(sprintId);
  tasksStore.fetchTasks(sprintId);
  router.push(`/workspace/sprints/${sprintId}/tasks`);
};

const handleSprintCreated = () => {
  showCreateSprint.value = false;
};
</script>

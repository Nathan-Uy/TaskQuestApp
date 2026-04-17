<template>
  <div class="p-4">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Sprints</h1>
      <Button
        label="Create Sprint"
        icon="pi pi-plus"
        @click="openCreateDialog"
      />
    </div>

    <div v-if="isLoading" class="flex justify-center py-8">
      <ProgressSpinner />
    </div>
    <div v-else-if="error" class="text-red-500">Failed to load sprints.</div>
    <div
      v-else-if="sprints.length === 0"
      class="text-center py-8 text-gray-500"
    >
      No sprints yet. Create a sprint to start planning.
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card
        v-for="sprint in sprints"
        :key="sprint._id"
        class="cursor-pointer hover:shadow-md transition-shadow"
        @click="goToSprint(sprint._id)"
      >
        <template #content>
          <div class="flex justify-between items-start">
            <div>
              <h3 class="text-lg font-semibold">{{ sprint.name }}</h3>
              <p class="text-sm text-gray-500">
                {{ formatDate(sprint.startDate) }} –
                {{ formatDate(sprint.endDate) }}
              </p>
              <Tag
                :value="sprint.status"
                :severity="getStatusSeverity(sprint.status)"
                class="mt-2"
              />
            </div>
            <div class="flex gap-1">
              <Button
                icon="pi pi-pencil"
                text
                rounded
                size="small"
                @click.stop="openEditDialog(sprint)"
              />
              <Button
                icon="pi pi-trash"
                text
                rounded
                severity="danger"
                size="small"
                @click.stop="confirmDelete(sprint)"
              />
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Sprint Dialog Component -->
    <CreateSprintDialog
      v-model="showDialog"
      :sprint="editingSprint"
      @save="handleSaveSprint"
    />
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { useSprintManager } from "./sprint.composable";
import Card from "primevue/card";
import Button from "primevue/button";
import Tag from "primevue/tag";
import ProgressSpinner from "primevue/progressspinner";
import CreateSprintDialog from "./CreateSprintDialog.vue";

const route = useRoute();
const teamId = route.params.teamId as string;

const {
  sprints,
  isLoading,
  error,
  showDialog,
  editingSprint,
  openCreateDialog,
  openEditDialog,
  handleSaveSprint,
  confirmDelete,
  goToSprint,
} = useSprintManager(teamId);

const formatDate = (date: string | Date) => new Date(date).toLocaleDateString();
const getStatusSeverity = (status: string) => {
  switch (status) {
    case "planning":
      return "info";
    case "active":
      return "success";
    case "completed":
      return "secondary";
    default:
      return "info";
  }
};
</script>

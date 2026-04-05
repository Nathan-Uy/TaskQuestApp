<template>
  <div class="p-4">
    <div class="flex justify-between items-center mb-4">
      <div>
        <h1 class="text-2xl font-bold">{{ sprint?.name || "Tasks" }}</h1>
        <p v-if="sprint" class="text-gray-500 text-sm">
          {{ formatDate(sprint.startDate) }} – {{ formatDate(sprint.endDate) }}
        </p>
      </div>
      <Button
        label="New Task"
        icon="pi pi-plus"
        @click="openCreateDialog('todo')"
      />
    </div>

    <div v-if="isLoading" class="flex justify-center py-8">
      <ProgressSpinner />
    </div>
    <div v-else-if="error" class="text-red-500">Failed to load tasks.</div>

    <div class="flex gap-4 overflow-x-auto pb-4">
      <div v-for="column in columns" :key="column.key" class="w-80 shrink-0">
        <div class="flex items-center justify-between px-2 py-2 mb-2">
          <span
            class="font-semibold text-sm uppercase"
            :style="{ color: column.color }"
            >{{ column.label }}</span
          >
          <span class="text-xs text-gray-500">{{
            getTasksByStatus(column.key).length
          }}</span>
        </div>
        <div class="space-y-2">
          <TaskCard
            v-for="task in getTasksByStatus(column.key)"
            :key="task._id"
            :task="task"
            @edit="openEditDialog"
            @delete="confirmDelete"
          />
          <Button
            label="Add task"
            icon="pi pi-plus"
            text
            size="small"
            class="w-full justify-start text-gray-400"
            @click="openCreateDialog(column.key as TaskStatus)"
          />
        </div>
      </div>
    </div>

    <!-- Task Dialog -->
    <Dialog
      v-model:visible="showDialog"
      :header="dialogHeader"
      :modal="true"
      class="w-full max-w-md"
    >
      <form @submit.prevent="saveTask">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Title *</label>
            <InputText v-model="form.title" class="w-full" required autofocus />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Description</label>
            <Textarea v-model="form.description" rows="3" class="w-full" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium mb-1">Priority</label>
              <Select
                v-model="form.priority"
                :options="priorityOptions"
                optionLabel="label"
                optionValue="value"
                class="w-full"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1"
                >Duration (hours)</label
              >
              <InputNumber
                v-model="form.duration"
                :min="0"
                :step="0.5"
                class="w-full"
                suffix=" h"
              />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Assign to</label>
            <Select
              v-model="form.assignedTo"
              :options="teamMembers"
              optionLabel="name"
              optionValue="userId"
              placeholder="Select member"
              class="w-full"
            />
          </div>
        </div>
        <div class="flex justify-end gap-2 mt-4">
          <Button
            label="Cancel"
            severity="secondary"
            @click="showDialog = false"
          />
          <Button type="submit" label="Save" :loading="saving" />
        </div>
      </form>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useSprint } from "./sprint.tanstack";
import { useTeam } from "@/modules/TaskSpace/views/Teams/team.tanstack";
import { useTaskManager } from "./task.composable";
import TaskCard from "./TaskCard.vue";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import Select from "primevue/select";
import InputNumber from "primevue/inputnumber";
import ProgressSpinner from "primevue/progressspinner";
import type { TaskStatus } from "./tasks.types";

const route = useRoute();
const teamId = route.params.teamId as string;
const sprintId = route.params.sprintId as string;

const { data: sprintData } = useSprint(sprintId);
const sprint = computed(() => sprintData?.value);
const { data: teamData } = useTeam(teamId);
const teamMembers = computed(() => teamData?.value?.members || []);

const {
  tasks,
  isLoading,
  error,
  showDialog,
  dialogHeader,
  form,
  saving,
  openCreateDialog,
  openEditDialog,
  saveTask,
  confirmDelete,
} = useTaskManager(sprintId);

const columns = [
  { key: "todo" as TaskStatus, label: "To Do", color: "#6366f1" },
  { key: "in-progress" as TaskStatus, label: "In Progress", color: "#f59e0b" },
  { key: "done" as TaskStatus, label: "Done", color: "#10b981" },
];

const priorityOptions = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
];

const getTasksByStatus = (status: TaskStatus) =>
  tasks.value.filter((t) => t.status === status);
const formatDate = (date: string | Date) => new Date(date).toLocaleDateString();
</script>

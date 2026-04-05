<template>
  <div class="flex flex-col h-full pl-8 pr-8 py-8 gap-6">
    <div class="flex items-center justify-between">
      <div>
        <h1
          class="font-serif text-3xl leading-tight"
          style="color: var(--ink-primary)"
        >
          {{ sprint?.name || "Sprint Tasks" }}
        </h1>
        <p v-if="sprint" class="text-xs mt-1" style="color: var(--ink-muted)">
          {{ formatDate(sprint.startDate) }} — {{ formatDate(sprint.endDate) }}
        </p>
      </div>
      <Button
        label="Add Row"
        icon="pi pi-plus"
        class="bg-(--accent)! border-none! rounded-[10px]! text-sm! font-semibold! shadow-sm! hover:shadow-md! hover:-translate-y-px! transition-all! duration-150!"
        @click="addRow"
      />
    </div>

    <div v-if="isLoading" class="flex items-center justify-center py-20">
      <i
        class="pi pi-spinner pi-spin text-2xl"
        style="color: var(--ink-muted)"
      />
    </div>

    <div
      v-else
      class="rounded-2xl border overflow-hidden"
      style="border-color: var(--card-border)"
    >
      <div class="overflow-x-auto">
        <table class="w-full text-sm border-collapse">
          <thead>
            <tr
              style="
                background: var(--surface-muted);
                border-bottom: 1px solid var(--card-border);
              "
            >
              <th
                class="w-8 px-3 py-2.5 text-left"
                style="
                  color: var(--ink-muted);
                  font-size: 0.7rem;
                  font-weight: 600;
                  text-transform: uppercase;
                  letter-spacing: 0.05em;
                "
              >
                #
              </th>
              <th
                class="px-3 py-2.5 text-left min-w-64"
                style="
                  color: var(--ink-muted);
                  font-size: 0.7rem;
                  font-weight: 600;
                  text-transform: uppercase;
                  letter-spacing: 0.05em;
                "
              >
                Task
              </th>
              <th
                class="px-3 py-2.5 text-left w-28"
                style="
                  color: var(--ink-muted);
                  font-size: 0.7rem;
                  font-weight: 600;
                  text-transform: uppercase;
                  letter-spacing: 0.05em;
                "
              >
                Type
              </th>
              <th
                class="px-3 py-2.5 text-left w-28"
                style="
                  color: var(--ink-muted);
                  font-size: 0.7rem;
                  font-weight: 600;
                  text-transform: uppercase;
                  letter-spacing: 0.05em;
                "
              >
                Assigned
              </th>
              <th
                class="px-3 py-2.5 text-left w-24"
                style="
                  color: var(--ink-muted);
                  font-size: 0.7rem;
                  font-weight: 600;
                  text-transform: uppercase;
                  letter-spacing: 0.05em;
                "
              >
                Est. Hours
              </th>
              <th
                class="px-3 py-2.5 text-left w-28"
                style="
                  color: var(--ink-muted);
                  font-size: 0.7rem;
                  font-weight: 600;
                  text-transform: uppercase;
                  letter-spacing: 0.05em;
                "
              >
                Target Date
              </th>
              <th
                class="px-3 py-2.5 text-left w-28"
                style="
                  color: var(--ink-muted);
                  font-size: 0.7rem;
                  font-weight: 600;
                  text-transform: uppercase;
                  letter-spacing: 0.05em;
                "
              >
                Status
              </th>
              <th
                class="px-3 py-2.5 text-left w-20"
                style="
                  color: var(--ink-muted);
                  font-size: 0.7rem;
                  font-weight: 600;
                  text-transform: uppercase;
                  letter-spacing: 0.05em;
                "
              >
                Priority
              </th>
              <th class="w-16 px-3 py-2.5" />
            </tr>
          </thead>
          <tbody>
            <SprintTasksRow
              v-for="(task, idx) in rows"
              :key="task._id || task.tempId"
              :task="task"
              :index="idx + 1"
              :team-members="teamMembers"
              :is-new="!task._id"
              @update="handleUpdate(task, $event)"
              @save="handleSave(task, $event)"
              @delete="handleDelete(task)"
              @cancel="handleCancel(task)"
            />
            <tr v-if="rows.length === 0">
              <td
                colspan="9"
                class="px-4 py-12 text-center text-sm"
                style="color: var(--ink-muted)"
              >
                No tasks yet. Click "Add Row" to get started.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-if="rows.length > 0"
        class="flex items-center justify-between px-4 py-2.5 border-t text-xs"
        style="
          border-color: var(--card-border);
          background: var(--surface-muted);
          color: var(--ink-muted);
        "
      >
        <span>{{ rows.length }} task{{ rows.length !== 1 ? "s" : "" }}</span>
        <span>
          {{ rows.filter((t) => t.status === "done").length }} completed ·
          {{ rows.filter((t) => t.status === "in-progress").length }} in
          progress · {{ rows.filter((t) => t.status === "todo").length }} to do
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import Button from "primevue/button";
import { useSprint } from "./sprint.tanstack";
import { useTeam } from "@/modules/TaskSpace/views/Teams/team.tanstack";
import { useTaskManager } from "./task.composable";
import SprintTasksRow from "./SprintTasksRow.vue";
import type { Task } from "./tasks.types";

const route = useRoute();
const teamId = route.params.teamId as string;
const sprintId = route.params.sprintId as string;

const { data: sprintData } = useSprint(sprintId);
const sprint = computed(() => sprintData?.value);

const { data: teamData } = useTeam(teamId);
const teamMembers = computed(() => teamData?.value?.members ?? []);

const { tasks, isLoading, error, saveInlineTask, deleteInlineTask } =
  useTaskManager(sprintId);

interface RowTask extends Partial<Task> {
  tempId?: string;
  _isNew?: boolean;
}

const newRows = ref<RowTask[]>([]);
const rows = computed<RowTask[]>(() => [
  ...(tasks.value ?? []),
  ...newRows.value,
]);

const addRow = () => {
  newRows.value.push({
    tempId: crypto.randomUUID(),
    _isNew: true,
    title: "",
    description: "",
    priority: "medium",
    status: "todo",
    duration: 0,
  });
};

const handleUpdate = (task: RowTask, patch: Partial<Task>) => {
  if (task._isNew) {
    Object.assign(task, patch);
  }
};

const handleSave = async (task: RowTask, patch: Partial<Task>) => {
  if (task._isNew) {
    await saveInlineTask(undefined, { ...patch, sprintId } as Partial<Task> & {
      sprintId: string;
    });
    newRows.value = newRows.value.filter((r) => r.tempId !== task.tempId);
  } else if (task._id) {
    await saveInlineTask(task._id, patch);
  }
};

const handleDelete = async (task: RowTask) => {
  if (task._isNew) {
    newRows.value = newRows.value.filter((r) => r.tempId !== task.tempId);
  } else if (task._id) {
    await deleteInlineTask(task._id);
  }
};

const handleCancel = (task: RowTask) => {
  newRows.value = newRows.value.filter((r) => r.tempId !== task.tempId);
};

const formatDate = (date: string | Date) =>
  new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
</script>

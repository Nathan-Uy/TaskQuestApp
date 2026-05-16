<template>
  <div class="flex flex-col h-full pl-8 pr-8 py-8 gap-6">
    <div class="flex items-center justify-between">
      <div>
        <h1
          style="
            font-size: 2.5rem;
            font-weight: 900;
            letter-spacing: -0.03em;
            color: var(--ink-primary);
            line-height: 1;
            margin: 0;
          "
        >
          {{ sprint?.name || "Sprint Tasks" }}
        </h1>
        <p
          v-if="sprint"
          style="
            font-size: 0.75rem;
            margin-top: 6px;
            color: var(--ink-muted);
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.08em;
          "
        >
          {{ formatDate(sprint.startDate) }} — {{ formatDate(sprint.endDate) }}
        </p>
      </div>
      <Button label="+ Add Row" style="font-weight: 800" @click="addRow" />
    </div>

    <div
      v-if="isLoading"
      style="display: flex; justify-content: center; padding: 5rem 0"
    >
      <i
        class="pi pi-spinner pi-spin"
        style="font-size: 1.5rem; color: var(--ink-muted)"
      />
    </div>

    <div
      v-else
      style="
        border: 2px solid var(--ink-primary);
        box-shadow: 4px 4px 0 var(--ink-primary);
        overflow: hidden;
      "
    >
      <div class="overflow-x-auto">
        <table
          style="width: 100%; border-collapse: collapse; font-size: 0.875rem"
        >
          <thead>
            <tr style="background: var(--ink-primary)">
              <th
                style="
                  width: 32px;
                  padding: 10px 12px;
                  text-align: left;
                  font-size: 0.65rem;
                  font-weight: 800;
                  color: #fff;
                  text-transform: uppercase;
                  letter-spacing: 0.1em;
                  border-right: 1px solid rgba(255, 255, 255, 0.1);
                "
              >
                #
              </th>
              <th
                style="
                  padding: 10px 12px;
                  text-align: left;
                  min-width: 256px;
                  font-size: 0.65rem;
                  font-weight: 800;
                  color: #fff;
                  text-transform: uppercase;
                  letter-spacing: 0.1em;
                  border-right: 1px solid rgba(255, 255, 255, 0.1);
                "
              >
                Task
              </th>
              <th
                style="
                  padding: 10px 12px;
                  text-align: left;
                  width: 112px;
                  font-size: 0.65rem;
                  font-weight: 800;
                  color: #fff;
                  text-transform: uppercase;
                  letter-spacing: 0.1em;
                  border-right: 1px solid rgba(255, 255, 255, 0.1);
                "
              >
                Type
              </th>
              <th
                style="
                  padding: 10px 12px;
                  text-align: left;
                  width: 112px;
                  font-size: 0.65rem;
                  font-weight: 800;
                  color: #fff;
                  text-transform: uppercase;
                  letter-spacing: 0.1em;
                  border-right: 1px solid rgba(255, 255, 255, 0.1);
                "
              >
                Assigned
              </th>
              <th
                style="
                  padding: 10px 12px;
                  text-align: left;
                  width: 96px;
                  font-size: 0.65rem;
                  font-weight: 800;
                  color: #fff;
                  text-transform: uppercase;
                  letter-spacing: 0.1em;
                  border-right: 1px solid rgba(255, 255, 255, 0.1);
                "
              >
                Est. Hrs
              </th>
              <th
                style="
                  padding: 10px 12px;
                  text-align: left;
                  width: 112px;
                  font-size: 0.65rem;
                  font-weight: 800;
                  color: #fff;
                  text-transform: uppercase;
                  letter-spacing: 0.1em;
                  border-right: 1px solid rgba(255, 255, 255, 0.1);
                "
              >
                Target Date
              </th>
              <th
                style="
                  padding: 10px 12px;
                  text-align: left;
                  width: 112px;
                  font-size: 0.65rem;
                  font-weight: 800;
                  color: #fff;
                  text-transform: uppercase;
                  letter-spacing: 0.1em;
                  border-right: 1px solid rgba(255, 255, 255, 0.1);
                "
              >
                Status
              </th>
              <th
                style="
                  padding: 10px 12px;
                  text-align: left;
                  width: 80px;
                  font-size: 0.65rem;
                  font-weight: 800;
                  color: #fff;
                  text-transform: uppercase;
                  letter-spacing: 0.1em;
                  border-right: 1px solid rgba(255, 255, 255, 0.1);
                "
              >
                Priority
              </th>
              <th style="width: 64px; padding: 10px 12px" />
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
                style="
                  padding: 3rem 1rem;
                  text-align: center;
                  font-size: 0.875rem;
                  font-weight: 700;
                  color: var(--ink-muted);
                  text-transform: uppercase;
                  letter-spacing: 0.05em;
                  border-top: 2px dashed var(--ink-primary);
                "
              >
                No tasks yet. Click "+ Add Row" to get started.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-if="rows.length > 0"
        style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 16px;
          border-top: 2px solid var(--ink-primary);
          background: var(--surface-muted);
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--ink-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        "
      >
        <span>{{ rows.length }} task{{ rows.length !== 1 ? "s" : "" }}</span>
        <span>
          {{ rows.filter((t) => t.status === "done").length }} done ·
          {{ rows.filter((t) => t.status === "in-progress").length }} in
          progress · {{ rows.filter((t) => t.status === "todo").length }} to do
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import Button from "primevue/button";
import { useSprint } from "./sprint.tanstack";
import { useTeam } from "@/modules/TaskSpace/views/Teams/team.tanstack";
import { useTaskManager } from "../Tasks/task.composable";
import SprintTasksRow from "./SprintTasksRow.vue";
import type { Task } from "../Tasks/tasks.types";

const route = useRoute();
const teamId = route.params.teamId as string;
const sprintId = route.params.sprintId as string;

const { data: sprintData } = useSprint(sprintId);
const sprint = computed(() => sprintData?.value);

const { data: teamData } = useTeam(teamId);
const teamMembers = computed(() => teamData?.value?.members ?? []);

const { tasks, isLoading, saveInlineTask, deleteInlineTask } =
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
  if (task._isNew) Object.assign(task, patch);
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

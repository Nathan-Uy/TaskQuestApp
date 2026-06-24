<template>
  <div class="flex flex-col pl-8">
    <Toast position="bottom-right" />

    <div class="flex items-center justify-between" style="margin-bottom: 28px">
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
          Tasks
        </h1>
        <p
          style="
            font-size: 0.75rem;
            margin-top: 6px;
            color: var(--ink-muted);
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.08em;
          "
        >
          {{ today }}
        </p>
      </div>
      <Button
        label="+ New Task"
        class="bg-(--accent)! text-white! border-2! border-[#1a1714]!"
        style="font-weight: 800; letter-spacing: 0.02em"
        @click="openAddTask"
      />
    </div>

    <div class="grid grid-cols-4 gap-3" style="margin-bottom: 28px">
      <div
        style="
          padding: 16px 18px;
          background: var(--accent);
          border: 2px solid var(--ink-primary);
          box-shadow: 4px 4px 0 var(--ink-primary);
        "
      >
        <p
          style="
            font-size: 2rem;
            font-weight: 900;
            line-height: 1;
            margin-bottom: 6px;
            color: #fff;
          "
        >
          {{ visibleActiveTasks.length }}
        </p>
        <p
          style="
            font-size: 0.65rem;
            font-weight: 800;
            color: rgba(255, 255, 255, 0.8);
            text-transform: uppercase;
            letter-spacing: 0.1em;
          "
        >
          Active
        </p>
      </div>

      <div
        style="
          padding: 16px 18px;
          background: var(--card-bg);
          border: 2px solid var(--ink-primary);
          box-shadow: 4px 4px 0 var(--ink-primary);
        "
      >
        <p
          style="
            font-size: 2rem;
            font-weight: 900;
            line-height: 1;
            margin-bottom: 6px;
            color: var(--ink-primary);
          "
        >
          {{ completedToday.length }}
        </p>
        <p
          style="
            font-size: 0.65rem;
            font-weight: 800;
            color: var(--ink-muted);
            text-transform: uppercase;
            letter-spacing: 0.1em;
          "
        >
          Done Today
        </p>
      </div>

      <div
        style="
          padding: 16px 18px;
          background: var(--card-bg);
          border: 2px solid var(--ink-primary);
          box-shadow: 4px 4px 0 var(--ink-primary);
        "
      >
        <p
          style="
            font-size: 2rem;
            font-weight: 900;
            line-height: 1;
            margin-bottom: 6px;
            color: var(--ink-primary);
          "
        >
          {{ profile.tasksCompleted }}
        </p>
        <p
          style="
            font-size: 0.65rem;
            font-weight: 800;
            color: var(--ink-muted);
            text-transform: uppercase;
            letter-spacing: 0.1em;
          "
        >
          All Time
        </p>
      </div>

      <div
        style="
          padding: 16px 18px;
          background: var(--xp);
          border: 2px solid var(--ink-primary);
          box-shadow: 4px 4px 0 var(--ink-primary);
        "
      >
        <p
          style="
            font-size: 2rem;
            font-weight: 900;
            line-height: 1;
            margin-bottom: 6px;
            color: #fff;
          "
        >
          +{{ completedToday.reduce((s, t) => s + t.xpReward, 0) }}
        </p>
        <p
          style="
            font-size: 0.65rem;
            font-weight: 800;
            color: rgba(255, 255, 255, 0.75);
            text-transform: uppercase;
            letter-spacing: 0.1em;
          "
        >
          XP Today
        </p>
      </div>
    </div>

    <Dialog
      v-model:visible="showAddTask"
      modal
      header="New Task"
      :style="{ width: '520px' }"
      :draggable="false"
      @hide="resetForm"
    >
      <TaskForm
        :form="form as any"
        submit-label="Add Task"
        :loading="isCreating"
        @update:form="Object.assign(form, $event)"
        @submit="submitTask"
        @cancel="closeAddTask"
      >
        <template #default>
          </template>

        <template #ai-button>
          <Button
            :icon="descLoading ? 'pi pi-spinner pi-spin' : 'pi pi-sparkles'"
            :label="descLoading ? 'Thinking...' : 'AI Fill'"
            :disabled="!form.title.trim() || descLoading"
            class="bg-(--accent-soft)! text-(--accent)! text-xs! font-bold!"
            @click="generateDescription"
          />
        </template>
      </TaskForm>
    </Dialog>

    <Transition
      enter-active-class="transition-all duration-150 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      leave-active-class="transition-all duration-100 ease-in"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="triageResult.length > 0"
        style="
          border: 2px solid #a07620;
          box-shadow: 4px 4px 0 #a07620;
          padding: 20px;
          background: var(--warning-soft);
          margin-bottom: 24px;
        "
      >
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <i
              class="pi pi-exclamation-triangle text-sm"
              style="color: var(--warning)"
            />
            <p
              style="
                font-size: 0.875rem;
                font-weight: 800;
                color: var(--ink-primary);
              "
            >
              Overdue Task Triage
            </p>
            <span
              style="
                background: var(--warning);
                color: #fff;
                font-size: 0.7rem;
                font-weight: 800;
                padding: 2px 8px;
                border: 1.5px solid var(--ink-primary);
                text-transform: uppercase;
                letter-spacing: 0.05em;
              "
            >
              {{ triageResult.length }} tasks
            </span>
          </div>
          <Button
            icon="pi pi-times"
            text
            rounded
            severity="secondary"
            class="w-7! h-7!"
            @click="triageResult = []"
          />
        </div>
        <div class="flex flex-col gap-2">
          <div
            v-for="item in triageResult"
            :key="item.taskId"
            style="
              display: flex;
              align-items: flex-start;
              gap: 10px;
              padding: 10px 12px;
              background: #fff;
              border: 1.5px solid var(--ink-primary);
            "
          >
            <span
              :style="{
                background:
                  item.action === 'reschedule'
                    ? '#dbeafe'
                    : item.action === 'delegate'
                      ? '#ede9fe'
                      : '#fee2e2',
                color:
                  item.action === 'reschedule'
                    ? '#1d4ed8'
                    : item.action === 'delegate'
                      ? '#6d28d9'
                      : '#dc2626',
                fontSize: '0.65rem',
                fontWeight: '800',
                padding: '2px 8px',
                border: '1.5px solid currentColor',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                flexShrink: 0,
              }"
              >{{ item.action }}</span
            >
            <div class="flex-1 min-w-0">
              <p
                style="
                  font-size: 0.875rem;
                  font-weight: 700;
                  color: var(--ink-primary);
                  margin: 0;
                "
              >
                {{ item.title }}
              </p>
              <p
                style="
                  font-size: 0.75rem;
                  color: var(--ink-muted);
                  margin: 2px 0 0;
                "
              >
                {{ item.reason }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <section style="margin-bottom: 32px">
      <div
        class="flex items-center justify-between"
        style="margin-bottom: 12px"
      >
        <div class="flex items-center" style="gap: 8px">
          <span
            style="
              font-size: 0.68rem;
              font-weight: 800;
              color: var(--ink-primary);
              text-transform: uppercase;
              letter-spacing: 0.1em;
            "
            >Active</span
          >
          <span
            style="
              background: var(--ink-primary);
              color: #fff;
              font-size: 0.65rem;
              font-weight: 800;
              padding: 1px 7px;
              letter-spacing: 0.05em;
            "
          >
            {{ visibleActiveTasks.length }}
          </span>
        </div>
        <div class="flex items-center gap-2">
          <Select
            v-model="sortBy"
            :options="sortOptions"
            option-label="label"
            option-value="value"
            placeholder="Sort"
            style="height: 32px; font-size: 0.75rem; font-weight: 700"
          />
          <Button
            v-if="overdueCount > 0"
            :icon="triageLoading ? 'pi pi-spinner pi-spin' : 'pi pi-sparkles'"
            :label="
              triageLoading ? 'Triaging...' : `Triage ${overdueCount} overdue`
            "
            :disabled="triageLoading"
            style="
              background: var(--warning-soft);
              color: var(--warning);
              font-size: 0.75rem;
              font-weight: 800;
            "
            @click="runTriage"
          />
        </div>
      </div>

      <div
        v-if="isLoading"
        style="
          padding: 40px;
          font-size: 0.875rem;
          background: var(--card-bg);
          border: 2px solid var(--ink-primary);
          color: var(--ink-muted);
          text-align: center;
        "
      >
        <i class="pi pi-spinner pi-spin mr-2" />Loading tasks...
      </div>
      <div
        v-else-if="visibleActiveTasks.length === 0"
        style="
          padding: 40px;
          font-size: 0.875rem;
          background: var(--card-bg);
          border: 2px dashed var(--ink-primary);
          color: var(--ink-muted);
          text-align: center;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        "
      >
        No active tasks. Add one above ↑
      </div>
      <div v-else class="flex flex-col" style="gap: 10px">
        <TaskCard
          v-for="task in visibleActiveTasks"
          :key="task._id"
          :task="task"
          @complete="completeTask(task._id)"
          @delete="handleDelete(task._id)"
        />
      </div>
    </section>

    <section v-if="allCompleted.length > 0" style="margin-bottom: 32px">
      <div
        class="flex items-center justify-between"
        style="margin-bottom: 12px"
      >
        <div class="flex items-center" style="gap: 8px">
          <span
            style="
              font-size: 0.68rem;
              font-weight: 800;
              color: var(--success);
              text-transform: uppercase;
              letter-spacing: 0.1em;
            "
            >Completed</span
          >
          <span
            style="
              background: var(--success);
              color: #fff;
              font-size: 0.65rem;
              font-weight: 800;
              padding: 1px 7px;
              letter-spacing: 0.05em;
            "
          >
            {{ filteredCompleted.length }}
          </span>
        </div>
        <div class="flex items-center gap-2">
          <DatePicker
            v-model="selectedDate"
            placeholder="Filter by date"
            date-format="M dd, yy"
            show-icon
            icon-display="input"
            :show-button-bar="true"
            @clear-click="clearDateFilter"
          />
          <Button
            v-if="selectedDate"
            icon="pi pi-times"
            text
            rounded
            severity="secondary"
            class="w-7! h-7!"
            @click="clearDateFilter"
          />
        </div>
      </div>

      <div
        v-if="filteredCompleted.length === 0"
        style="
          padding: 40px;
          font-size: 0.875rem;
          background: var(--card-bg);
          border: 2px dashed var(--ink-primary);
          color: var(--ink-muted);
          text-align: center;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        "
      >
        No completed tasks for this date.
      </div>
      <div v-else class="flex flex-col" style="gap: 10px">
        <TaskCard
          v-for="task in filteredCompleted"
          :key="task._id"
          :task="task"
          :readonly="true"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { storeToRefs } from "pinia";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import DatePicker from "primevue/datepicker";
import Select from "primevue/select";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";
import { useGamificationStore } from "@/components/sidebar.store";
import { useTasksStore } from "@/modules/Tasks/tasks.store";
import {
  useTaskForm,
  useTaskFilters,
  useTaskDate,
} from "@/modules/Tasks/tasks.composable";
import TaskCard from "@/modules/Tasks/TasksCard.vue";
import TaskForm from "@/modules/Tasks/TaskForm.vue";
import { aiApi } from "@/api/ai.api";
import type { TriagedTask } from "@/types/ai.types";
import type { TaskPriority } from "@/modules/Tasks/tasks.type";
import {
  useTasksQuery,
  useCreateTaskMutation,
  useCompleteTaskMutation,
  useDeleteTaskMutation,
} from "@/modules/Tasks/tasks.tanstack";

const { data: tasks, isLoading } = useTasksQuery();
const { mutate: completeTask } = useCompleteTaskMutation();
const { mutate: deleteTask } = useDeleteTaskMutation();
const { mutate: createTask, isPending: isCreating } = useCreateTaskMutation();

const { profile } = storeToRefs(useGamificationStore());
const tasksStore = useTasksStore();
const { showAddTask } = storeToRefs(tasksStore);
const { openAddTask, closeAddTask } = tasksStore;
const toast = useToast();

const { form, resetForm, getDuration } = useTaskForm();

const {
  activeTasks,
  completedToday,
  allCompleted,
  filteredCompleted,
  overdueCount,
  selectedDate,
  sortBy,
  clearDateFilter,
} = useTaskFilters(() => tasks.value);
const { today } = useTaskDate();

const sortOptions = [
  { label: "Created", value: "created" },
  { label: "Priority", value: "priority" },
  { label: "Due Date", value: "dueDate" },
  { label: "Duration", value: "duration" },
];

// ── Delete with undo ──────────────────────────────────────────────────────────
const pendingDeleteIds = ref<Set<string>>(new Set());
const pendingDeletes = new Map<string, ReturnType<typeof setTimeout>>();

const visibleActiveTasks = computed(() =>
  activeTasks.value.filter((t) => !pendingDeleteIds.value.has(t._id)),
);

const handleDelete = (id: string) => {
  const task = tasks.value?.find((t) => t._id === id);
  if (!task) return;

  pendingDeleteIds.value = new Set([...pendingDeleteIds.value, id]);

  toast.add({
    severity: "secondary",
    summary: `"${task.title}" will be deleted`,
    life: 5000,
    closable: true,
    group: `delete-${id}`,
  });

  const timer = setTimeout(() => {
    deleteTask(id);
    pendingDeleteIds.value = new Set(
      ...[...pendingDeleteIds.value].filter((x) => x !== id),
    );
    pendingDeletes.delete(id);
  }, 5000);

  pendingDeletes.set(id, timer);
};

const undoDelete = (id: string) => {
  const timer = pendingDeletes.get(id);
  if (timer) {
    clearTimeout(timer);
    pendingDeletes.delete(id);
    pendingDeleteIds.value = new Set(
      ...[...pendingDeleteIds.value].filter((x) => x !== id),
    );
  }
};

// ── Form ──────────────────────────────────────────────────────────────────────
const descLoading = ref(false);
const descError = ref("");
const triageLoading = ref(false);
const triageResult = ref<TriagedTask[]>([]);

const submitTask = () => {
  if (!form.value.title.trim()) return;
  
  createTask({
    title: form.value.title.trim(),
    priority: form.value.priority as TaskPriority,
    duration: getDuration(),
    notes: form.value.notes || undefined,
    dueDate: form.value.dueDate ?? undefined,
  });
  closeAddTask();
  resetForm();
};

const cancelAdd = () => {
  closeAddTask();
  resetForm();
};

const generateDescription = async () => {
  if (!form.value.title.trim()) return;
  descLoading.value = true;
  descError.value = "";
  try {
    const result = await aiApi.generateTaskDescription(form.value.title);
    form.value.notes = result.notes;
    const totalSeconds = result.duration;
    form.value.hours = Math.floor(totalSeconds / 3600);
    form.value.minutes = Math.floor((totalSeconds % 3600) / 60);
    form.value.seconds = totalSeconds % 60;
  } catch {
    descError.value = "Failed to generate description. Try again.";
  } finally {
    descLoading.value = false;
  }
};

const runTriage = async () => {
  triageLoading.value = true;
  try {
    const result = await aiApi.triageOverdueTasks();
    triageResult.value = result.triaged;
  } catch {
    console.error("Triage failed");
  } finally {
    triageLoading.value = false;
  }
};
</script>
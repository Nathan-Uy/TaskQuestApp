<template>
  <div class="flex flex-col pl-8 bg-(--surface-muted)">
    <Toast position="bottom-right" />

    <div class="flex items-center justify-between mb-7">
      <div>
        <h1
          class="text-[2.5rem] font-black tracking-[-0.03em] text-(--ink-primary) leading-none m-0"
        >
          Tasks
        </h1>
        <p
          class="text-xs mt-1.5 text-(--ink-muted) font-semibold uppercase tracking-[0.08em]"
        >
          {{ today }}
        </p>
      </div>
      <Button
        label="+ New Task"
        :pt="{
          root: {
            class:
              'bg-(--accent) text-white border-2 border-[#1a1714] font-extrabold tracking-[0.02em]',
          },
        }"
        @click="openAddTask"
      />
    </div>

    <div class="grid grid-cols-4 gap-3 mb-7">
      <Card :pt="cardPt('bg-(--accent)')">
        <template #content>
          <p class="text-[2rem] font-black leading-none mb-1.5">
            {{ visibleActiveTasks.length }}
          </p>
          <p class="text-[0.65rem] font-extrabold uppercase tracking-widest">
            Active
          </p>
        </template>
      </Card>

      <Card :pt="cardPt('bg-(--card-bg)')">
        <template #content>
          <p class="text-[2rem] font-black leading-none mb-1.5 text-(--ink-primary)">
            {{ completedToday.length }}
          </p>
          <p class="text-[0.65rem] font-extrabold text-(--ink-muted) uppercase tracking-widest">
            Done Today
          </p>
        </template>
      </Card>

      <Card :pt="cardPt('bg-(--card-bg)')">
        <template #content>
          <p class="text-[2rem] font-black leading-none mb-1.5 text-(--ink-primary)">
            {{ profile.tasksCompleted }}
          </p>
          <p class="text-[0.65rem] font-extrabold text-(--ink-muted) uppercase tracking-widest">
            All Time
          </p>
        </template>
      </Card>

      <Card :pt="cardPt('bg-(--xp)')">
        <template #content>
          <p class="text-[2rem] font-black leading-none mb-1.5">
            +{{ completedToday.reduce((s, t) => s + t.xpReward, 0) }}
          </p>
          <p class="text-[0.65rem] font-extrabold uppercase tracking-widest">
            XP Today
          </p>
        </template>
      </Card>
    </div>

    <Dialog
      v-model:visible="showAddTask"
      modal
      header="New Task"
      :draggable="false"
      :pt="{ root: { class: 'w-[520px]' } }"
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
          <div
            v-if="descError"
            class="mt-2 rounded-none border-2 border-(--ink-primary) bg-(--danger-soft) px-3 py-2 text-xs font-bold text-(--danger)"
          >
            {{ descError }}
          </div>
        </template>

        <template #ai-button>
          <Button
            :icon="descLoading ? 'pi pi-spinner pi-spin' : 'pi pi-sparkles'"
            :label="descLoading ? 'Thinking...' : 'AI Fill'"
            :disabled="!form.title.trim() || descLoading"
            :pt="{
              root: { class: 'bg-(--accent-soft) text-(--accent) text-xs font-bold' },
            }"
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
      <Panel
        v-if="triageResult.length > 0"
        :pt="{
          root: {
            class: 'border-2 border-[#a07620] shadow-[4px_4px_0_#a07620] bg-(--warning-soft) mb-6',
          },
          header: { class: 'p-5 pb-4 bg-transparent border-none' },
          content: { class: 'px-5 pb-5 pt-0' },
        }"
      >
        <template #header>
          <div class="flex items-center gap-2">
            <i class="pi pi-exclamation-triangle text-sm text-(--warning)" />
            <p class="text-sm font-extrabold text-(--ink-primary)">
              Overdue Task Triage
            </p>
            <Tag
              :value="`${triageResult.length} tasks`"
              :pt="{
                root: {
                  class:
                    'bg-(--warning) text-white text-[0.7rem] font-extrabold px-2 py-0.5 border-[1.5px] border-(--ink-primary) uppercase tracking-[0.05em] rounded-none',
                },
              }"
            />
          </div>
        </template>
        <template #icons>
          <Button
            icon="pi pi-times"
            text
            rounded
            severity="secondary"
            :pt="{ root: { class: 'w-7 h-7' } }"
            @click="triageResult = []"
          />
        </template>

        <div class="flex flex-col gap-2">
          <div
            v-for="item in triageResult"
            :key="item.taskId"
            class="flex items-start gap-2.5 py-2.5 px-3 bg-(--card-bg) border-[1.5px] border-(--ink-primary)"
          >
            <Tag
              :value="item.action"
              :style="getActionStyle(item.action)"
              class="text-[0.65rem] font-extrabold px-2 py-0.5 border-[1.5px] border-current uppercase tracking-widest rounded-none shrink-0"
            />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-bold text-(--ink-primary) m-0">
                {{ item.title }}
              </p>
              <p class="text-xs text-(--ink-muted) m-0 mt-0.5">
                {{ item.reason }}
              </p>
            </div>
          </div>
        </div>
      </Panel>
    </Transition>

    <section class="mb-8">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <span
            class="text-[0.68rem] font-extrabold text-(--ink-primary) uppercase tracking-widest"
            >Active</span
          >
          <Tag
            :value="String(visibleActiveTasks.length)"
            :pt="{
              root: {
                class:
                  'bg-(--ink-primary) text-white text-[0.65rem] font-extrabold px-[7px] py-px tracking-[0.05em] rounded-none',
              },
            }"
          />
        </div>
        <div class="flex items-center gap-2">
          <Select
            v-model="sortBy"
            :options="sortOptions"
            option-label="label"
            option-value="value"
            placeholder="Sort"
            :pt="{ root: { class: 'h-8 text-xs font-bold' } }"
          />
          <Button
            v-if="overdueCount > 0"
            :icon="triageLoading ? 'pi pi-spinner pi-spin' : 'pi pi-sparkles'"
            :label="
              triageLoading ? 'Triaging...' : `Triage ${overdueCount} overdue`
            "
            :disabled="triageLoading"
            :pt="{
              root: {
                class: 'bg-(--warning-soft) text-(--warning) text-xs font-extrabold',
              },
            }"
            @click="runTriage"
          />
        </div>
      </div>

      <div
        v-if="isLoading"
        class="p-10 text-sm bg-(--card-bg) border-2 border-(--ink-primary) text-(--ink-muted) text-center"
      >
        <i class="pi pi-spinner pi-spin mr-2" />Loading tasks...
      </div>
      <div
        v-else-if="visibleActiveTasks.length === 0"
        class="p-10 text-sm bg-(--card-bg) border-2 border-dashed border-(--ink-primary) text-(--ink-muted) text-center font-bold uppercase tracking-[0.05em]"
      >
        No active tasks. Add one above ↑
      </div>
      <div v-else class="flex flex-col gap-2.5">
        <TaskCard
          v-for="task in visibleActiveTasks"
          :key="task._id"
          :task="task"
          @complete="completeTask(task._id)"
          @delete="handleDelete(task._id)"
        />
      </div>
    </section>

    <section v-if="allCompleted.length > 0" class="mb-8">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <span
            class="text-[0.68rem] font-extrabold text-(--success) uppercase tracking-widest"
            >Completed</span
          >
          <Tag
            :value="String(filteredCompleted.length)"
            :pt="{
              root: {
                class:
                  'bg-(--success) text-white text-[0.65rem] font-extrabold px-[7px] py-px tracking-[0.05em] rounded-none',
              },
            }"
          />
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
            :pt="{ root: { class: 'w-7 h-7' } }"
            @click="clearDateFilter"
          />
        </div>
      </div>

      <div
        v-if="filteredCompleted.length === 0"
        class="p-10 text-sm bg-(--card-bg) border-2 border-dashed border-(--ink-primary) text-(--ink-muted) text-center font-bold uppercase tracking-[0.05em]"
      >
        No completed tasks for this date.
      </div>
      <div v-else class="flex flex-col gap-2.5">
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
import Card from "primevue/card";
import Tag from "primevue/tag";
import Panel from "primevue/panel";
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";
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
const confirm = useConfirm();

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

const statCardShell =
  "border-2 border-(--ink-primary) shadow-[4px_4px_0_var(--ink-primary)] py-4 px-[18px]";

const cardPt = (bgClass: string) => ({
  root: { class: `${statCardShell} ${bgClass}` },
  body: { class: "p-0" },
  content: { class: "p-0" },
});

const actionPalette: Record<string, { background: string; color: string }> = {
  reschedule: { background: "#dbeafe", color: "#1d4ed8" },
  delegate: { background: "#ede9fe", color: "#6d28d9" },
};

const getActionStyle = (action: string) =>
  actionPalette[action] ?? { background: "#fee2e2", color: "#dc2626" };

const pendingDeleteIds = ref<Set<string>>(new Set());
const pendingDeletes = new Map<string, ReturnType<typeof setTimeout>>();

const visibleActiveTasks = computed(() =>
  activeTasks.value.filter((t) => !pendingDeleteIds.value.has(t._id)),
);

const handleDelete = (id: string) => {
  const task = tasks.value?.find((t) => t._id === id);
  if (!task) return;

  confirm.require({
    message: `Delete task "${task.title}"? This action cannot be undone.`,
    header: "Delete Task",
    icon: "pi pi-exclamation-triangle",
    accept: () => {
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
          [...pendingDeleteIds.value].filter((x) => x !== id),
        );
        pendingDeletes.delete(id);
      }, 5000);

      pendingDeletes.set(id, timer);
    },
  });
};

const undoDelete = (id: string) => {
  const timer = pendingDeletes.get(id);
  if (timer) {
    clearTimeout(timer);
    pendingDeletes.delete(id);
    pendingDeleteIds.value = new Set(
      [...pendingDeleteIds.value].filter((x) => x !== id),
    );
  }
};

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
    triageResult.value = [];
  } finally {
    triageLoading.value = false;
  }
};
</script>
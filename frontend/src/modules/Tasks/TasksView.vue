<template>
  <div class="flex flex-col pl-8">
    <div class="flex items-center justify-between" style="margin-bottom: 28px">
      <div>
        <h1
          class="font-serif"
          style="font-size: 2rem; line-height: 1.1; color: var(--ink-primary)"
        >
          Tasks
        </h1>
        <p style="font-size: 0.8rem; margin-top: 4px; color: var(--ink-muted)">
          {{ today }}
        </p>
      </div>
      <Button
        label="New Task"
        icon="pi pi-plus"
        class="bg-(--accent)! border-none! rounded-[10px]! text-sm! font-semibold! shadow-sm! hover:shadow-md! hover:-translate-y-px! transition-all! duration-150!"
        @click="openAddTask"
      />
    </div>

    <div class="grid grid-cols-4 gap-3" style="margin-bottom: 28px">
      <div
        class="rounded-2xl border"
        style="
          padding: 16px 18px;
          background: var(--card-bg);
          border-color: var(--card-border);
        "
      >
        <p
          class="font-serif"
          style="
            font-size: 1.75rem;
            line-height: 1;
            margin-bottom: 6px;
            color: var(--ink-primary);
          "
        >
          {{ activeTasks.length }}
        </p>
        <p
          class="font-semibold uppercase tracking-wide"
          style="font-size: 0.65rem; color: var(--ink-muted)"
        >
          Active
        </p>
      </div>
      <div
        class="rounded-2xl border"
        style="
          padding: 16px 18px;
          background: var(--card-bg);
          border-color: var(--card-border);
        "
      >
        <p
          class="font-serif"
          style="
            font-size: 1.75rem;
            line-height: 1;
            margin-bottom: 6px;
            color: var(--ink-primary);
          "
        >
          {{ completedToday.length }}
        </p>
        <p
          class="font-semibold uppercase tracking-wide"
          style="font-size: 0.65rem; color: var(--ink-muted)"
        >
          Done Today
        </p>
      </div>
      <div
        class="rounded-2xl border"
        style="
          padding: 16px 18px;
          background: var(--card-bg);
          border-color: var(--card-border);
        "
      >
        <p
          class="font-serif"
          style="
            font-size: 1.75rem;
            line-height: 1;
            margin-bottom: 6px;
            color: var(--ink-primary);
          "
        >
          {{ profile.tasksCompleted }}
        </p>
        <p
          class="font-semibold uppercase tracking-wide"
          style="font-size: 0.65rem; color: var(--ink-muted)"
        >
          All Time
        </p>
      </div>
      <div
        class="rounded-2xl"
        style="padding: 16px 18px; background: var(--xp-soft)"
      >
        <p
          class="font-serif"
          style="
            font-size: 1.75rem;
            line-height: 1;
            margin-bottom: 6px;
            color: var(--xp);
          "
        >
          +{{ completedToday.reduce((s, t) => s + t.xpReward, 0) }}
        </p>
        <p
          class="font-semibold uppercase tracking-wide"
          style="font-size: 0.65rem; color: var(--xp); opacity: 0.7"
        >
          XP Today
        </p>
      </div>
    </div>

    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      leave-active-class="transition-all duration-150 ease-in"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="showAddTask"
        class="rounded-2xl border"
        style="
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 4px 20px rgba(26, 23, 20, 0.08);
          background: var(--card-bg);
          border-color: var(--card-border);
        "
      >
        <p
          class="font-semibold"
          style="
            font-size: 0.95rem;
            margin-bottom: 20px;
            color: var(--ink-primary);
          "
        >
          New Task
        </p>
        <TaskForm
          v-model:form="form"
          submit-label="Add Task"
          :loading="isCreating"
          @submit="submitTask"
          @cancel="cancelAdd"
        >
          <template #ai-button>
            <Button
              :icon="descLoading ? 'pi pi-spinner pi-spin' : 'pi pi-sparkles'"
              :label="descLoading ? 'Thinking...' : 'AI Fill'"
              :disabled="!form.title.trim() || descLoading"
              class="bg-(--accent-soft)! text-(--accent)! border-none! rounded-lg! text-xs! font-semibold! hover:bg-(--accent)! hover:text-white! shrink-0!"
              title="Generate description with AI"
              @click="generateDescription"
            />
          </template>
        </TaskForm>
      </div>
    </Transition>

    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      leave-active-class="transition-all duration-150 ease-in"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="triageResult.length > 0"
        class="rounded-2xl border border-amber-200 mb-6"
        style="padding: 20px; background: var(--card-bg)"
      >
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <i class="pi pi-exclamation-triangle text-amber-500 text-sm" />
            <p class="text-sm font-semibold" style="color: var(--ink-primary)">
              Overdue Task Triage
            </p>
            <span
              class="bg-amber-50 text-amber-600 text-xs font-medium px-2 py-0.5 rounded-full"
              >{{ triageResult.length }} tasks</span
            >
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
            class="flex items-start gap-3 rounded-xl px-3 py-2.5 border"
            style="border-color: var(--card-border)"
          >
            <span
              :class="[
                'text-xs font-bold px-2 py-0.5 rounded-md shrink-0 mt-0.5',
                item.action === 'reschedule'
                  ? 'bg-blue-50 text-blue-600'
                  : item.action === 'delegate'
                    ? 'bg-violet-50 text-violet-600'
                    : 'bg-red-50 text-red-500',
              ]"
              >{{ item.action }}</span
            >
            <div class="flex-1 min-w-0">
              <p
                class="text-sm font-semibold"
                style="color: var(--ink-primary)"
              >
                {{ item.title }}
              </p>
              <p class="text-xs mt-0.5" style="color: var(--ink-muted)">
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
            class="font-semibold uppercase tracking-widest"
            style="font-size: 0.68rem; color: var(--ink-muted)"
            >Active</span
          >
          <span
            class="font-semibold rounded-full"
            style="
              background: var(--surface-muted);
              color: var(--ink-secondary);
              font-size: 0.7rem;
              padding: 1px 8px;
            "
          >
            {{ activeTasks.length }}
          </span>
        </div>
        <Button
          v-if="overdueCount > 0"
          :icon="triageLoading ? 'pi pi-spinner pi-spin' : 'pi pi-sparkles'"
          :label="
            triageLoading ? 'Triaging...' : `Triage ${overdueCount} overdue`
          "
          :disabled="triageLoading"
          class="bg-amber-50! text-amber-600! border-none! rounded-lg! text-xs! font-semibold! hover:bg-amber-100!"
          @click="runTriage"
        />
      </div>
      <div
        v-if="isLoading"
        class="rounded-2xl border text-center"
        style="
          padding: 40px;
          font-size: 0.875rem;
          background: var(--card-bg);
          border-color: var(--card-border);
          color: var(--ink-muted);
        "
      >
        <i class="pi pi-spinner pi-spin mr-2" />Loading tasks...
      </div>
      <div
        v-else-if="activeTasks.length === 0"
        class="rounded-2xl border border-dashed text-center"
        style="
          padding: 40px;
          font-size: 0.875rem;
          background: var(--card-bg);
          border-color: var(--card-border);
          color: var(--ink-muted);
        "
      >
        No active tasks. Add one above ↑
      </div>
      <div v-else class="flex flex-col" style="gap: 8px">
        <TaskCard
          v-for="task in activeTasks"
          :key="task._id"
          :task="task"
          @complete="completeTask(task._id)"
          @delete="deleteTask(task._id)"
        />
      </div>
    </section>

    <section v-if="completedToday.length > 0" style="margin-bottom: 32px">
      <div class="flex items-center" style="gap: 8px; margin-bottom: 12px">
        <span
          class="font-semibold uppercase tracking-widest"
          style="font-size: 0.68rem; color: var(--success)"
          >Completed Today</span
        >
        <span
          class="font-semibold rounded-full"
          style="
            background: var(--success-soft);
            color: var(--success);
            font-size: 0.7rem;
            padding: 1px 8px;
          "
        >
          {{ completedToday.length }}
        </span>
      </div>
      <div class="flex flex-col" style="gap: 8px">
        <TaskCard
          v-for="task in completedToday"
          :key="task._id"
          :task="task"
          :readonly="true"
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
            class="font-semibold uppercase tracking-widest"
            style="font-size: 0.68rem; color: var(--success)"
          >
            {{ selectedDate ? "Filtered" : "All Completed" }}
          </span>
          <span
            class="font-semibold rounded-full"
            style="
              background: var(--success-soft);
              color: var(--success);
              font-size: 0.7rem;
              padding: 1px 8px;
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
        class="rounded-2xl border border-dashed text-center"
        style="
          padding: 40px;
          font-size: 0.875rem;
          background: var(--card-bg);
          border-color: var(--card-border);
          color: var(--ink-muted);
        "
      >
        No completed tasks for this date.
      </div>
      <div v-else class="flex flex-col" style="gap: 8px">
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
import { ref } from "vue";
import { storeToRefs } from "pinia";
import Button from "primevue/button";
import DatePicker from "primevue/datepicker";
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

const { form, resetForm, getDuration } = useTaskForm();
const {
  activeTasks,
  completedToday,
  allCompleted,
  filteredCompleted,
  overdueCount,
  selectedDate,
  clearDateFilter,
} = useTaskFilters(() => tasks.value);
const { today } = useTaskDate();

const descLoading = ref(false);
const descError = ref("");
const triageLoading = ref(false);
const triageResult = ref<TriagedTask[]>([]);

const submitTask = () => {
  if (!form.value.title.trim()) return;
  createTask({
    title: form.value.title.trim(),
    priority: form.value.priority,
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

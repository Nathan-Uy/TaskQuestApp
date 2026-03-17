<template>
  <div class="flex flex-col pl-8">
    <div class="flex items-center justify-between" style="margin-bottom: 28px">
      <div>
        <h1
          class="font-serif text-stone-800"
          style="font-size: 2rem; line-height: 1.1"
        >
          Tasks
        </h1>
        <p class="text-stone-400" style="font-size: 0.8rem; margin-top: 4px">
          {{ today }}
        </p>
      </div>
      <Button
        label="New Task"
        icon="pi pi-plus"
        class="bg-(--accent)]! border-none! rounded-[10px]! text-sm! font-semibold! shadow-sm! hover:shadow-md! hover:-translate-y-px! transition-all! duration-150!"
        @click="showAddTask = true"
      />
    </div>

    <div class="grid grid-cols-4 gap-3" style="margin-bottom: 28px">
      <div
        class="bg-white border border-stone-200 rounded-2xl"
        style="padding: 16px 18px"
      >
        <p
          class="font-serif text-stone-800"
          style="font-size: 1.75rem; line-height: 1; margin-bottom: 6px"
        >
          {{ activeTasks.length }}
        </p>
        <p
          class="text-stone-400 font-semibold uppercase tracking-wide"
          style="font-size: 0.65rem"
        >
          Active
        </p>
      </div>
      <div
        class="bg-white border border-stone-200 rounded-2xl"
        style="padding: 16px 18px"
      >
        <p
          class="font-serif text-stone-800"
          style="font-size: 1.75rem; line-height: 1; margin-bottom: 6px"
        >
          {{ completedToday.length }}
        </p>
        <p
          class="text-stone-400 font-semibold uppercase tracking-wide"
          style="font-size: 0.65rem"
        >
          Done Today
        </p>
      </div>
      <div
        class="bg-white border border-stone-200 rounded-2xl"
        style="padding: 16px 18px"
      >
        <p
          class="font-serif text-stone-800"
          style="font-size: 1.75rem; line-height: 1; margin-bottom: 6px"
        >
          {{ profile.tasksCompleted }}
        </p>
        <p
          class="text-stone-400 font-semibold uppercase tracking-wide"
          style="font-size: 0.65rem"
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
        class="bg-white border border-stone-200 rounded-2xl"
        style="
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 4px 20px rgba(26, 23, 20, 0.08);
        "
      >
        <p
          class="font-semibold text-stone-800"
          style="font-size: 0.95rem; margin-bottom: 20px"
        >
          New Task
        </p>

        <div class="flex flex-col" style="gap: 6px; margin-bottom: 16px">
          <label class="text-stone-500 font-medium" style="font-size: 0.75rem"
            >Task name</label
          >
          <div class="flex gap-2">
            <InputText
              v-model="form.title"
              placeholder="What needs to be done?"
              class="flex-1"
              @keyup.enter="submitTask"
              autofocus
            />
            <button
              :disabled="!form.title.trim() || descLoading"
              class="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed bg-(--accent-soft) text-(--accent) hover:bg-(--accent) hover:text-white shrink-0"
              title="Generate description with AI"
              @click="generateDescription"
            >
              <i
                :class="[
                  'pi text-xs',
                  descLoading ? 'pi-spinner pi-spin' : 'pi-sparkles',
                ]"
              />
              {{ descLoading ? "Thinking..." : "AI Fill" }}
            </button>
          </div>
          <p v-if="descError" class="text-xs text-red-500 mt-1">
            {{ descError }}
          </p>
        </div>

        <div class="grid grid-cols-2" style="gap: 16px; margin-bottom: 16px">
          <div class="flex flex-col" style="gap: 6px">
            <label class="text-stone-500 font-medium" style="font-size: 0.75rem"
              >Priority</label
            >
            <Select
              v-model="form.priority"
              :options="priorityOptions"
              option-label="label"
              option-value="value"
              class="w-full"
            />
          </div>
          <div class="flex flex-col" style="gap: 6px">
            <label class="text-stone-500 font-medium" style="font-size: 0.75rem"
              >Duration</label
            >
            <div class="grid grid-cols-3" style="gap: 8px">
              <InputNumber
                v-model="form.hours"
                :min="0"
                :use-grouping="false"
                placeholder="0h"
                class="w-full"
                input-class="w-full text-center"
              />
              <InputNumber
                v-model="form.minutes"
                :min="0"
                :max="59"
                :use-grouping="false"
                placeholder="25m"
                class="w-full"
                input-class="w-full text-center"
              />
              <InputNumber
                v-model="form.seconds"
                :min="0"
                :max="59"
                :use-grouping="false"
                placeholder="0s"
                class="w-full"
                input-class="w-full text-center"
              />
            </div>
          </div>
        </div>

        <div class="flex flex-col" style="gap: 6px; margin-bottom: 16px">
          <label class="text-stone-500 font-medium" style="font-size: 0.75rem">
            Due date <span class="font-normal text-stone-400">(optional)</span>
          </label>
          <DatePicker
            v-model="form.dueDate"
            placeholder="Pick a date"
            date-format="M dd, yy"
            class="w-full"
            show-icon
            icon-display="input"
          />
        </div>

        <div class="flex flex-col" style="gap: 6px; margin-bottom: 20px">
          <label class="text-stone-500 font-medium" style="font-size: 0.75rem">
            Notes <span class="font-normal text-stone-400">(optional)</span>
          </label>
          <Textarea
            v-model="form.notes"
            placeholder="Any details..."
            :rows="2"
            class="w-full resize-none"
          />
        </div>

        <div class="flex justify-end" style="gap: 8px">
          <Button label="Cancel" severity="secondary" text @click="cancelAdd" />
          <Button
            label="Add Task"
            :disabled="!form.title.trim()"
            class="bg-(--accent)! border-none! rounded-[10px]! text-sm! font-semibold! shadow-sm! hover:shadow-md! hover:-translate-y-px! transition-all! duration-150!"
            @click="submitTask"
          />
        </div>
      </div>
    </Transition>

    <!-- Overdue Triage -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      leave-active-class="transition-all duration-150 ease-in"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="triageResult.length > 0"
        class="bg-white border border-amber-200 rounded-2xl mb-6"
        style="padding: 20px"
      >
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <i class="pi pi-exclamation-triangle text-amber-500 text-sm" />
            <p class="text-sm font-semibold text-stone-800">
              Overdue Task Triage
            </p>
            <span
              class="bg-amber-50 text-amber-600 text-xs font-medium px-2 py-0.5 rounded-full"
              >{{ triageResult.length }} tasks</span
            >
          </div>
          <button
            class="text-stone-400 hover:text-stone-600 transition-colors"
            @click="triageResult = []"
          >
            <i class="pi pi-times text-xs" />
          </button>
        </div>
        <div class="flex flex-col gap-2">
          <div
            v-for="item in triageResult"
            :key="item.taskId"
            class="flex items-start gap-3 rounded-xl px-3 py-2.5 border border-stone-100"
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
            >
              {{ item.action }}
            </span>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-stone-800">
                {{ item.title }}
              </p>
              <p class="text-xs text-stone-400 mt-0.5">{{ item.reason }}</p>
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
            class="text-stone-400 font-semibold uppercase tracking-widest"
            style="font-size: 0.68rem"
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
            >{{ activeTasks.length }}</span
          >
        </div>
        <button
          v-if="overdueCount > 0"
          :disabled="triageLoading"
          class="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-150 disabled:opacity-50 bg-amber-50 text-amber-600 hover:bg-amber-100"
          @click="runTriage"
        >
          <i
            :class="[
              'pi text-xs',
              triageLoading ? 'pi-spinner pi-spin' : 'pi-sparkles',
            ]"
          />
          {{ triageLoading ? "Triaging..." : `Triage ${overdueCount} overdue` }}
        </button>
      </div>
      <div
        v-if="activeTasks.length === 0"
        class="bg-white border border-dashed border-stone-200 rounded-2xl text-center text-stone-400"
        style="padding: 40px; font-size: 0.875rem"
      >
        No active tasks. Add one above ↑
      </div>
      <div v-else class="flex flex-col" style="gap: 8px">
        <TaskCard
          v-for="task in activeTasks"
          :key="task._id"
          :task="task"
          @complete="tasksStore.completeTask(task._id)"
          @delete="tasksStore.deleteTask(task._id)"
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
          >{{ completedToday.length }}</span
        >
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { storeToRefs } from "pinia";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import Textarea from "primevue/textarea";
import Select from "primevue/select";
import DatePicker from "primevue/datepicker";
import { useTasksStore } from "@/modules/Tasks/tasks.store";
import { useGamificationStore } from "@/components/sidebar.store";
import { useTasksComposable } from "@/modules/Tasks/tasks.composable";
import TaskCard from "@/modules/Tasks/TasksCard.vue";
import { aiApi } from "@/api/ai.api";
import type { TriagedTask } from "../../../server/src/types/ai.types";

const tasksStore = useTasksStore();
const { activeTasks, completedToday } = storeToRefs(tasksStore);
const { profile } = storeToRefs(useGamificationStore());
const { today, priorityOptions, showAddTask, form, submitTask, cancelAdd } =
  useTasksComposable();

const descLoading = ref(false);
const descError = ref("");
const triageLoading = ref(false);
const triageResult = ref<TriagedTask[]>([]);

const overdueCount = computed(() => {
  const now = new Date();
  return activeTasks.value.filter((t) => t.dueDate && new Date(t.dueDate) < now)
    .length;
});

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

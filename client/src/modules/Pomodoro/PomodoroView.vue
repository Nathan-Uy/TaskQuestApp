<template>
  <div class="flex flex-col pl-8">
    <Toast position="bottom-right" />

    <div class="flex items-end justify-between mb-7">
      <div>
        <h1 class="text-3xl font-serif text-stone-800 leading-tight">
          Pomodoro
        </h1>
        <p class="text-xs text-stone-400 mt-1">
          Stay focused, take meaningful breaks
        </p>
      </div>
    </div>

    <div class="grid grid-cols-[1fr_280px] gap-5 items-start">
      <PomodoroCard
        :phase="phase"
        :formatted-time="formattedTime"
        :progress="progress"
        :is-running="isRunning"
        :sessions-completed="sessionsCompleted"
        :settings="settings"
        :linked-task-id="pomodoroStore.linkedTaskId"
        @toggle="toggle"
        @reset="reset"
        @skip="skip"
        @switch-phase="switchPhase"
        @complete-task="completeLinkedTask"
      />

      <div class="flex flex-col gap-4">
        <!-- Focusing On — accented border to signal priority -->
        <Card
          class="rounded-2xl border border-stone-300 shadow-none ring-1 ring-stone-200"
        >
          <template #content>
            <p
              class="text-[0.65rem] font-semibold uppercase tracking-widest text-stone-400 mb-3"
            >
              Focusing on
            </p>

            <Select
              v-model="linkedTaskIdModel"
              :options="taskOptions"
              option-label="label"
              option-value="value"
              placeholder="No task selected"
              :filter="taskOptions.length > 5"
              filter-placeholder="Search tasks..."
              empty-filter-message="No matching tasks"
              class="w-full"
            >
              <template #empty>
                <div class="flex flex-col items-center gap-1 py-3 text-center">
                  <i class="pi pi-inbox text-stone-300 text-xl" />
                  <p class="text-xs text-stone-400">No active tasks</p>
                  <a
                    href="/personal-tasks"
                    class="text-xs text-orange-500 hover:underline"
                  >
                    Add a task →
                  </a>
                </div>
              </template>
            </Select>
          </template>
        </Card>

        <!-- Today Stats -->
        <Card class="rounded-2xl border border-stone-200 shadow-none">
          <template #content>
            <p
              class="text-[0.65rem] font-semibold uppercase tracking-widest text-stone-400 mb-4"
            >
              Today
            </p>

            <div class="grid grid-cols-3 gap-2">
              <div
                class="flex flex-col items-center text-center bg-stone-50 rounded-xl p-3 gap-1"
              >
                <span class="text-xl font-serif text-stone-800 leading-none">
                  {{ sessionsCompleted }}
                </span>
                <span class="text-[0.65rem] text-stone-400 font-medium"
                  >Sessions</span
                >
              </div>

              <div
                class="flex flex-col items-center text-center bg-stone-50 rounded-xl p-3 gap-1"
              >
                <span class="text-xl font-serif text-stone-800 leading-none">
                  {{ todayFocusMinutes }}m
                </span>
                <span class="text-[0.65rem] text-stone-400 font-medium"
                  >Focused</span
                >
              </div>

              <div
                class="flex flex-col items-center text-center bg-violet-50 rounded-xl p-3 gap-1"
              >
                <span
                  class="text-xl font-serif leading-none"
                  :class="
                    linkedSessionsXP > 0 ? 'text-violet-600' : 'text-stone-300'
                  "
                >
                  +{{ linkedSessionsXP }}
                </span>
                <span
                  class="text-[0.65rem] font-medium"
                  :class="
                    linkedSessionsXP > 0 ? 'text-violet-400' : 'text-stone-300'
                  "
                >
                  XP
                </span>
              </div>
            </div>
          </template>
        </Card>

        <!-- Settings — collapsible -->
        <Card class="rounded-2xl border border-stone-200 shadow-none">
          <template #content>
            <button
              class="w-full flex items-center justify-between group"
              @click="settingsOpen = !settingsOpen"
            >
              <p
                class="text-[0.65rem] font-semibold uppercase tracking-widest text-stone-400"
              >
                Settings
              </p>
              <i
                :class="[
                  'pi pi-chevron-down text-stone-300 text-xs transition-transform duration-200',
                  settingsOpen ? 'rotate-180' : '',
                ]"
              />
            </button>

            <Transition name="settings-collapse">
              <div v-if="settingsOpen" class="flex flex-col gap-4 mt-4">
                <div class="flex items-center justify-between">
                  <label for="workMins" class="text-sm text-stone-600"
                    >Focus</label
                  >
                  <div class="flex items-center gap-2">
                    <InputNumber
                      :model-value="settings.workMins"
                      :min="1"
                      :max="60"
                      :use-grouping="false"
                      input-class="w-14 text-center text-sm"
                      class="w-22.5"
                      @update:model-value="
                        updateSettings({ workMins: $event ?? 25 })
                      "
                    />
                    <span class="text-xs text-stone-400">min</span>
                  </div>
                </div>

                <div class="flex items-center justify-between">
                  <label for="shortBreakMins" class="text-sm text-stone-600"
                    >Short break</label
                  >
                  <div class="flex items-center gap-2">
                    <InputNumber
                      :model-value="settings.shortBreakMins"
                      :min="1"
                      :max="30"
                      :use-grouping="false"
                      input-class="w-14 text-center text-sm"
                      class="w-22.5"
                      @update:model-value="
                        updateSettings({ shortBreakMins: $event ?? 5 })
                      "
                    />
                    <span class="text-xs text-stone-400">min</span>
                  </div>
                </div>

                <div class="flex items-center justify-between">
                  <label for="longBreakMins" class="text-sm text-stone-600"
                    >Long break</label
                  >
                  <div class="flex items-center gap-2">
                    <InputNumber
                      :model-value="settings.longBreakMins"
                      :min="1"
                      :max="60"
                      :use-grouping="false"
                      input-class="w-14 text-center text-sm"
                      class="w-22.5"
                      @update:model-value="
                        updateSettings({ longBreakMins: $event ?? 15 })
                      "
                    />
                    <span class="text-xs text-stone-400">min</span>
                  </div>
                </div>
              </div>
            </Transition>
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { storeToRefs } from "pinia";
import Card from "primevue/card";
import Select from "primevue/select";
import InputNumber from "primevue/inputnumber";
import Toast from "primevue/toast";
import PomodoroCard from "./PomodoroCard.vue";
import { usePomodoroTimer } from "./pomodoro.composable";
import { usePomodoroStore } from "./pomodoro.store";
import {
  useTasksQuery,
  useCompleteTaskMutation,
} from "@/modules/Tasks/tasks.tanstack";

const {
  phase,
  formattedTime,
  progress,
  isRunning,
  sessionsCompleted,
  todayFocusMinutes,
  settings,
  toggle,
  reset,
  skip,
  switchPhase,
  linkTask,
  updateSettings,
} = usePomodoroTimer();

const pomodoroStore = usePomodoroStore();
const { linkedSessionsCompleted } = storeToRefs(pomodoroStore); // ← reactive ref

const { data: tasks } = useTasksQuery();
const { mutate: completeTask } = useCompleteTaskMutation();

const settingsOpen = ref(false);

const taskOptions = computed(() => [
  { label: "No task selected", value: null },
  ...(tasks.value
    ?.filter((t) => t.status === "active")
    .map((t) => ({ label: t.title, value: t._id })) ?? []),
]);

const linkedTaskIdModel = computed({
  get: () => pomodoroStore.linkedTaskId,
  set: (val) => linkTask(val),
});

const linkedSessionsXP = computed(() => linkedSessionsCompleted.value * 25);

const completeLinkedTask = () => {
  if (!pomodoroStore.linkedTaskId) return;
  skip();
  completeTask(pomodoroStore.linkedTaskId);
  linkTask(null);
};
</script>

<style scoped>
.settings-collapse-enter-active,
.settings-collapse-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}
.settings-collapse-enter-from,
.settings-collapse-leave-to {
  opacity: 0;
  max-height: 0;
}
.settings-collapse-enter-to,
.settings-collapse-leave-from {
  opacity: 1;
  max-height: 200px;
}
</style>

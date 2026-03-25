<template>
  <div class="flex flex-col pl-8">
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
        @toggle="toggle"
        @reset="reset"
        @skip="skip"
        @switch-phase="switchPhase"
      />

      <div class="flex flex-col gap-4">
        <!-- Focusing On -->
        <Card class="rounded-2xl border border-stone-200 shadow-none">
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
              class="w-full"
            />
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
                <span class="text-[0.65rem] text-stone-400 font-medium">
                  Sessions
                </span>
              </div>

              <div
                class="flex flex-col items-center text-center bg-stone-50 rounded-xl p-3 gap-1"
              >
                <span class="text-xl font-serif text-stone-800 leading-none">
                  {{ todayFocusMinutes }}m
                </span>
                <span class="text-[0.65rem] text-stone-400 font-medium">
                  Focused
                </span>
              </div>

              <div
                class="flex flex-col items-center text-center bg-violet-50 rounded-xl p-3 gap-1"
              >
                <span class="text-xl font-serif text-violet-600 leading-none">
                  +{{ sessionsCompleted * 25 }}
                </span>
                <span class="text-[0.65rem] text-violet-400 font-medium">
                  XP
                </span>
              </div>
            </div>
          </template>
        </Card>

        <!-- Settings -->
        <Card class="rounded-2xl border border-stone-200 shadow-none">
          <template #content>
            <p
              class="text-[0.65rem] font-semibold uppercase tracking-widest text-stone-400 mb-4"
            >
              Settings
            </p>

            <div class="flex flex-col gap-4">
              <div class="flex items-center justify-between">
                <label class="text-sm text-stone-600">Focus</label>
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
                <label class="text-sm text-stone-600">Short break</label>
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
                <label class="text-sm text-stone-600">Long break</label>
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
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import Card from "primevue/card";
import Select from "primevue/select";
import InputNumber from "primevue/inputnumber";
import PomodoroCard from "./PomodoroCard.vue";
import { usePomodoroTimer } from "./pomodoro.composable";
import { usePomodoroStore } from "./pomodoro.store";
import { useTasksQuery } from "@/modules/Tasks/tasks.tanstack";

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
const { data: tasks } = useTasksQuery();

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
</script>

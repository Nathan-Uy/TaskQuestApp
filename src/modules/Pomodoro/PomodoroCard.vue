<template>
  <Card class="rounded-2xl border border-stone-200 shadow-none">
    <template #content>
      <div class="flex flex-col items-center gap-6">
        <!-- Phase tabs -->
        <SelectButton
          :model-value="phase"
          :options="phaseOptions"
          optionLabel="label"
          optionValue="value"
          class="w-full pomodoro-phase-tabs"
          @update:model-value="emit('switch-phase', $event)"
        />

        <!-- Ring timer -->
        <div class="relative w-60 h-60">
          <svg class="w-full h-full -rotate-90" viewBox="0 0 200 200">
            <!-- Track -->
            <circle
              cx="100"
              cy="100"
              r="88"
              fill="none"
              stroke="#f2efe9"
              stroke-width="6"
            />
            <!-- Progress ring -->
            <circle
              cx="100"
              cy="100"
              r="88"
              fill="none"
              :stroke="phaseColor"
              stroke-width="6"
              stroke-linecap="round"
              :stroke-dasharray="circumference"
              :stroke-dashoffset="dashOffset"
              class="transition-[stroke-dashoffset] duration-1000 ease-linear"
            />
          </svg>

          <!-- Time + label centered inside ring -->
          <div
            class="absolute inset-0 flex flex-col items-center justify-center gap-1.5"
          >
            <span
              class="text-5xl text-stone-800 font-serif tracking-tight leading-none"
            >
              {{ formattedTime }}
            </span>
            <span
              class="text-[0.65rem] font-semibold uppercase tracking-widest"
              :style="{ color: phaseColor }"
            >
              {{ phaseLabel }}
            </span>
          </div>
        </div>

        <!-- Controls -->
        <div class="flex items-center gap-4">
          <Button
            icon="pi pi-refresh"
            severity="secondary"
            text
            rounded
            class="w-11! h-11!"
            title="Reset"
            @click="emit('reset')"
          />
          <Button
            :icon="isRunning ? 'pi pi-pause' : 'pi pi-play'"
            rounded
            class="w-16! h-16! border-none!"
            :style="{ background: phaseColor }"
            @click="emit('toggle')"
          />
          <Button
            icon="pi pi-forward"
            severity="secondary"
            text
            rounded
            :disabled="!isRunning && progress === 0"
            class="w-11! h-11!"
            title="Skip"
            @click="emit('skip')"
          />
        </div>

        <!-- Session dots -->
        <div class="flex items-center gap-2">
          <div
            v-for="i in settings.sessionsUntilLongBreak"
            :key="i"
            :class="[
              'w-2 h-2 rounded-full transition-all duration-300',
              sessionsCompleted % settings.sessionsUntilLongBreak >= i
                ? 'scale-110'
                : 'bg-stone-200',
            ]"
            :style="
              sessionsCompleted % settings.sessionsUntilLongBreak >= i
                ? { background: phaseColor }
                : {}
            "
          />
          <span class="text-xs text-stone-400 ml-1">
            {{ sessionsCompleted }} session{{
              sessionsCompleted !== 1 ? "s" : ""
            }}
          </span>
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import Card from "primevue/card";
import Button from "primevue/button";
import SelectButton from "primevue/selectbutton";
import type { PomodoroPhase, PomodoroSettings } from "./pomodoro.type";

const props = defineProps<{
  phase: PomodoroPhase;
  formattedTime: string;
  progress: number;
  isRunning: boolean;
  sessionsCompleted: number;
  settings: PomodoroSettings;
}>();

const emit = defineEmits<{
  toggle: [];
  reset: [];
  skip: [];
  "switch-phase": [phase: PomodoroPhase];
}>();

const phaseOptions = [
  { label: "Pomodoro", value: "work" },
  { label: "Short Break", value: "short-break" },
  { label: "Long Break", value: "long-break" },
];

const phaseColor = computed(() => {
  if (props.phase === "work") return "var(--accent)";
  if (props.phase === "short-break") return "#10b981";
  return "#6366f1";
});

const phaseLabel = computed(() => {
  if (props.phase === "work") return "Focus";
  if (props.phase === "short-break") return "Short Break";
  return "Long Break";
});

const circumference = 2 * Math.PI * 88;
const dashOffset = computed(() => circumference * (1 - props.progress / 100));
</script>

<style scoped>
:deep(.pomodoro-phase-tabs .p-selectbutton) {
  width: 100%;
  display: flex;
  background: #f5f5f4;
  padding: 0.25rem;
  border-radius: 0.75rem;
  gap: 0.25rem;
}

:deep(.pomodoro-phase-tabs .p-togglebutton) {
  flex: 1;
  border: none;
  border-radius: 0.5rem;
  background: transparent;
  color: #78716c;
  font-size: 0.75rem;
  font-weight: 500;
  transition: all 0.15s ease;
}

:deep(.pomodoro-phase-tabs .p-togglebutton.p-highlight) {
  background: white;
  color: #292524;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
</style>

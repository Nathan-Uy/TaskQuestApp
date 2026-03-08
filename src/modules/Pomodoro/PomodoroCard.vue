<template>
  <div class="bg-white border border-stone-200 rounded-2xl p-8 flex flex-col items-center gap-6">

    <!-- Phase tabs -->
    <div class="flex gap-1 bg-stone-100 rounded-lg p-1 w-full">
      <button
        v-for="p in phases"
        :key="p.key"
        :class="[
          'flex-1 py-1.5 text-xs font-medium rounded-md transition-all duration-150',
          phase === p.key
            ? 'bg-white text-stone-800 shadow-sm'
            : 'text-stone-400 hover:text-stone-600',
        ]"
        @click="emit('switch-phase', p.key as PomodoroPhase)"
      >
        {{ p.label }}
      </button>
    </div>

    <!-- Ring timer -->
    <div class="relative w-52 h-52">
      <svg class="w-full h-full" viewBox="0 0 200 200">
        <!-- Track -->
        <circle
          cx="100" cy="100" r="88"
          fill="none"
          stroke="#e7e5e4"
          stroke-width="8"
        />
        <!-- Progress -->
        <circle
          cx="100" cy="100" r="88"
          fill="none"
          :stroke="phaseColor"
          stroke-width="8"
          stroke-linecap="round"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="dashOffset"
          transform="rotate(-90 100 100)"
          class="transition-[stroke-dashoffset] duration-1000 ease-linear"
        />
      </svg>

      <!-- Time display -->
      <div class="absolute inset-0 flex flex-col items-center justify-center gap-1">
        <span class="text-5xl text-stone-800 font-serif tracking-tight leading-none">
          {{ formattedTime }}
        </span>
        <span class="text-xs font-medium uppercase tracking-widest" :style="{ color: phaseColor }">
          {{ phaseLabel }}
        </span>
      </div>
    </div>

    <!-- Controls -->
    <div class="flex items-center gap-3">
      <Button
        icon="pi pi-refresh"
        severity="secondary"
        text
        rounded
        @click="emit('reset')"
        title="Reset"
        class="w-11! h-11!"
      />
      <Button
        :icon="isRunning ? 'pi pi-pause' : 'pi pi-play'"
        rounded
        :severity="isRunning ? 'secondary' : 'primary'"
        class="w-14! h-14! text-lg!"
        @click="emit('toggle')"
      />
      <Button
        icon="pi pi-forward"
        severity="secondary"
        text
        rounded
        @click="emit('skip')"
        title="Skip"
        class="w-11! h-11!"
      />
    </div>

    <!-- Session dots -->
    <div class="flex items-center gap-2">
      <div
        v-for="i in settings.sessionsUntilLongBreak"
        :key="i"
        :class="[
          'w-2 h-2 rounded-full transition-all duration-300',
          (sessionsCompleted % settings.sessionsUntilLongBreak) >= i
            ? 'bg-orange-400'
            : 'bg-stone-200',
        ]"
      />
      <span class="text-xs text-stone-400 ml-1">
        {{ sessionsCompleted }} session{{ sessionsCompleted !== 1 ? 's' : '' }}
      </span>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Button from 'primevue/button'
import type { PomodoroPhase, PomodoroSettings } from './pomodoro.type'

const props = defineProps<{
  phase: PomodoroPhase
  formattedTime: string
  progress: number
  isRunning: boolean
  sessionsCompleted: number
  settings: PomodoroSettings
}>()

const emit = defineEmits<{
  toggle: []
  reset: []
  skip: []
  'switch-phase': [phase: PomodoroPhase]
}>()

const phases = [
  { key: 'work',        label: 'Pomodoro' },
  { key: 'short-break', label: 'Short Break' },
  { key: 'long-break',  label: 'Long Break' },
]

const phaseColor = computed(() => {
  if (props.phase === 'work')        return '#f97316' // orange-500
  if (props.phase === 'short-break') return '#10b981' // emerald-500
  return '#6366f1'                                    // indigo-500
})

const phaseLabel = computed(() => {
  if (props.phase === 'work')        return 'Focus'
  if (props.phase === 'short-break') return 'Short Break'
  return 'Long Break'
})

const circumference = 2 * Math.PI * 88
const dashOffset = computed(() =>
  circumference * (1 - props.progress / 100)
)
</script>
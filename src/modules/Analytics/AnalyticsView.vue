<template>
  <div class="pl-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-7">
      <div>
        <h1 class="text-3xl font-serif text-stone-800 leading-tight">
          Analytics
        </h1>
        <p class="text-xs text-stone-400 mt-1">Your productivity at a glance</p>
      </div>
      <!-- Period toggle -->
      <div class="flex gap-1 bg-stone-100 rounded-lg p-1">
        <button
          v-for="opt in periodOptions"
          :key="opt.value"
          :class="[
            'px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150',
            period === opt.value
              ? 'bg-white text-stone-800 shadow-sm'
              : 'text-stone-400 hover:text-stone-600',
          ]"
          @click="period = opt.value as AnalyticsPeriod"
        >
          {{ opt.label }}
        </button>
      </div>
    </div>

    <!-- Summary Stats -->
    <div class="grid grid-cols-3 gap-3 mb-7">
      <div class="bg-white border border-stone-200 rounded-xl p-4">
        <p class="text-2xl font-serif text-stone-800 leading-none mb-1.5">
          {{ totals.tasksCompleted }}
        </p>
        <p
          class="text-[0.65rem] font-semibold text-stone-400 uppercase tracking-wide"
        >
          Tasks Completed
        </p>
      </div>
      <div class="bg-white border border-stone-200 rounded-xl p-4">
        <p class="text-2xl font-serif text-stone-800 leading-none mb-1.5">
          {{ totals.pomodoroSessions }}
        </p>
        <p
          class="text-[0.65rem] font-semibold text-stone-400 uppercase tracking-wide"
        >
          Pomodoro Sessions
        </p>
      </div>
      <div class="rounded-xl p-4 bg-violet-50">
        <p class="text-2xl font-serif text-violet-600 leading-none mb-1.5">
          +{{ totals.xpEarned }}
        </p>
        <p
          class="text-[0.65rem] font-semibold text-violet-400 uppercase tracking-wide"
        >
          XP Earned
        </p>
      </div>
    </div>

    <!-- Charts grid -->
    <div class="grid grid-cols-2 gap-5 mb-5">
      <!-- Tasks completed -->
      <div class="bg-white border border-stone-200 rounded-2xl p-5">
        <p class="text-xs font-semibold text-stone-800 mb-1">Tasks Completed</p>
        <p class="text-[0.65rem] text-stone-400 mb-4">
          Over the last {{ period }}
        </p>
        <div class="h-48">
          <Line :data="tasksChartData" :options="baseLineOptions" />
        </div>
      </div>

      <!-- Pomodoro sessions -->
      <div class="bg-white border border-stone-200 rounded-2xl p-5">
        <p class="text-xs font-semibold text-stone-800 mb-1">
          Pomodoro Sessions
        </p>
        <p class="text-[0.65rem] text-stone-400 mb-4">
          Over the last {{ period }}
        </p>
        <div class="h-48">
          <Line :data="pomodoroChartData" :options="baseLineOptions" />
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-5">
      <!-- XP earned -->
      <div class="bg-white border border-stone-200 rounded-2xl p-5">
        <p class="text-xs font-semibold text-stone-800 mb-1">XP Earned</p>
        <p class="text-[0.65rem] text-stone-400 mb-4">
          Over the last {{ period }}
        </p>
        <div class="h-48">
          <Line :data="xpChartData" :options="baseLineOptions" />
        </div>
      </div>

      <!-- Productivity by day -->
      <div class="bg-white border border-stone-200 rounded-2xl p-5">
        <p class="text-xs font-semibold text-stone-800 mb-1">
          Productivity by Day
        </p>
        <p class="text-[0.65rem] text-stone-400 mb-4">
          Tasks & pomodoros per weekday
        </p>
        <div class="h-48">
          <Bar
            :data="productivityChartData"
            :options="productivityBarOptions"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar } from "vue-chartjs";
import { useAnalytics } from "./analytics.composable";
import type { AnalyticsPeriod } from "./analytics.type";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Tooltip,
  Legend,
);

const {
  period,
  periodOptions,
  totals,
  tasksChartData,
  pomodoroChartData,
  xpChartData,
  productivityChartData,
  baseLineOptions,
  productivityBarOptions,
} = useAnalytics();
</script>

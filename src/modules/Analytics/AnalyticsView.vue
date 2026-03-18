<template>
  <div class="pl-8">
    <div class="flex items-center justify-between mb-7">
      <div>
        <h1 class="text-3xl font-serif text-stone-800 leading-tight">
          Analytics
        </h1>
        <p class="text-xs text-stone-400 mt-1">Your productivity at a glance</p>
      </div>
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

    <div class="grid grid-cols-2 gap-5 mb-5">
      <div class="bg-white border border-stone-200 rounded-2xl p-5">
        <p class="text-xs font-semibold text-stone-800 mb-1">Tasks Completed</p>
        <p class="text-[0.65rem] text-stone-400 mb-4">
          Over the last {{ period }}
        </p>
        <div class="h-48">
          <Line :data="tasksChartData" :options="baseLineOptions" />
        </div>
      </div>
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

    <div class="grid grid-cols-2 gap-5 mb-5">
      <div class="bg-white border border-stone-200 rounded-2xl p-5">
        <p class="text-xs font-semibold text-stone-800 mb-1">XP Earned</p>
        <p class="text-[0.65rem] text-stone-400 mb-4">
          Over the last {{ period }}
        </p>
        <div class="h-48">
          <Line :data="xpChartData" :options="baseLineOptions" />
        </div>
      </div>
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

    <div class="bg-white border border-stone-200 rounded-2xl p-5">
      <div class="flex items-center justify-between mb-4">
        <div>
          <p class="text-sm font-semibold text-stone-800">Bi-monthly Report</p>
          <p class="text-[0.65rem] text-stone-400 mt-0.5">
            {{ reportData?.period || "Current period" }}
          </p>
        </div>
        <div class="flex items-center gap-2">
          <button
            :disabled="reportLoading"
            class="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-(--accent-soft) text-(--accent) hover:bg-(--accent) hover:text-white transition-all duration-150 disabled:opacity-50"
            @click="fetchReport"
          >
            <i
              :class="[
                'pi text-xs',
                reportLoading ? 'pi-spinner pi-spin' : 'pi-sparkles',
              ]"
            />
            {{ reportLoading ? "Generating..." : "Generate Report" }}
          </button>
          <button
            v-if="reportData"
            :disabled="pdfLoading"
            class="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-stone-100 text-stone-600 hover:bg-stone-200 transition-all duration-150 disabled:opacity-50"
            @click="downloadPdf"
          >
            <i
              :class="[
                'pi text-xs',
                pdfLoading ? 'pi-spinner pi-spin' : 'pi-download',
              ]"
            />
            {{ pdfLoading ? "Downloading..." : "Download PDF" }}
          </button>
        </div>
      </div>

      <div v-if="reportData" class="flex flex-col gap-4">
        <div class="grid grid-cols-3 gap-3">
          <div class="bg-stone-50 rounded-xl p-3 text-center">
            <p class="text-lg font-serif text-stone-800 leading-none mb-1">
              {{ reportData.tasksCompleted }}
            </p>
            <p class="text-[0.65rem] font-medium text-stone-400">Tasks Done</p>
          </div>
          <div class="bg-stone-50 rounded-xl p-3 text-center">
            <p class="text-lg font-serif text-stone-800 leading-none mb-1">
              {{ reportData.goalsCompleted }}
            </p>
            <p class="text-[0.65rem] font-medium text-stone-400">Goals Done</p>
          </div>
          <div class="rounded-xl p-3 text-center bg-(--xp-soft)">
            <p class="text-lg font-serif leading-none mb-1 text-(--xp)">
              +{{ reportData.xpEarned }}
            </p>
            <p class="text-[0.65rem] font-medium text-(--xp) opacity-70">
              XP Earned
            </p>
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <p
            class="text-xs font-semibold text-stone-500 uppercase tracking-wide"
          >
            AI Analysis
          </p>
          <ul class="flex flex-col gap-1.5">
            <li
              v-for="(bullet, i) in reportData.bullets"
              :key="i"
              class="flex items-start gap-2 text-xs text-stone-600"
            >
              <span
                class="w-4 h-4 rounded-full bg-(--accent-soft) text-(--accent) flex items-center justify-center text-[0.6rem] font-bold shrink-0 mt-0.5"
              >
                {{ i + 1 }}
              </span>
              {{ bullet }}
            </li>
          </ul>
        </div>
      </div>

      <div v-else-if="!reportLoading" class="py-8 text-center">
        <i class="pi pi-file-pdf text-stone-300 text-2xl mb-2 block" />
        <p class="text-sm text-stone-400">
          Generate your bi-monthly productivity report
        </p>
      </div>

      <p v-if="reportError" class="text-xs text-red-500 mt-2">
        {{ reportError }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
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
import { aiApi } from "@/api/ai.api";
import type { AnalyticsPeriod } from "./analytics.type";
import type { ReportData } from "@/types/ai.types";

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

const reportLoading = ref(false);
const pdfLoading = ref(false);
const reportError = ref("");
const reportData = ref<ReportData | null>(null);

const fetchReport = async () => {
  reportLoading.value = true;
  reportError.value = "";
  try {
    reportData.value = await aiApi.getReport();
  } catch {
    reportError.value = "Failed to generate report. Try again.";
  } finally {
    reportLoading.value = false;
  }
};

const downloadPdf = async () => {
  pdfLoading.value = true;
  try {
    await aiApi.downloadReportPdf();
  } catch {
    reportError.value = "Failed to download PDF.";
  } finally {
    pdfLoading.value = false;
  }
};
</script>

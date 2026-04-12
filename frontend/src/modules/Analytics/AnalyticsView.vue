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

      <SelectButton
        v-model="period"
        :options="periodOptions"
        optionLabel="label"
        optionValue="value"
        class="analytics-period-switch"
      />
    </div>

    <!-- Summary Stats -->
    <div class="grid grid-cols-3 gap-3 mb-7">
      <Card class="rounded-xl border border-stone-200 shadow-none">
        <template #content>
          <p class="text-2xl font-serif text-stone-800 leading-none mb-1.5">
            {{ totals.tasksCompleted }}
          </p>
          <p
            class="text-[0.65rem] font-semibold text-stone-400 uppercase tracking-wide"
          >
            Tasks Completed
          </p>
        </template>
      </Card>

      <Card class="rounded-xl border border-stone-200 shadow-none">
        <template #content>
          <p class="text-2xl font-serif text-stone-800 leading-none mb-1.5">
            {{ totals.pomodoroSessions }}
          </p>
          <p
            class="text-[0.65rem] font-semibold text-stone-400 uppercase tracking-wide"
          >
            Pomodoro Sessions
          </p>
        </template>
      </Card>

      <Card class="rounded-xl border-0 shadow-none bg-violet-50">
        <template #content>
          <p class="text-2xl font-serif text-violet-600 leading-none mb-1.5">
            +{{ totals.xpEarned }}
          </p>
          <p
            class="text-[0.65rem] font-semibold text-violet-400 uppercase tracking-wide"
          >
            XP Earned
          </p>
        </template>
      </Card>
    </div>

    <!-- Charts Row 1 -->
    <div class="grid grid-cols-2 gap-5 mb-5">
      <Card class="rounded-2xl border border-stone-200 shadow-none">
        <template #content>
          <p class="text-xs font-semibold text-stone-800 mb-1">
            Tasks Completed
          </p>
          <p class="text-[0.65rem] text-stone-400 mb-4">
            Over the last {{ period }}
          </p>
          <div class="h-48">
            <Line :data="tasksChartData" :options="baseLineOptions" />
          </div>
        </template>
      </Card>

      <Card class="rounded-2xl border border-stone-200 shadow-none">
        <template #content>
          <p class="text-xs font-semibold text-stone-800 mb-1">
            Pomodoro Sessions
          </p>
          <p class="text-[0.65rem] text-stone-400 mb-4">
            Over the last {{ period }}
          </p>
          <div class="h-48">
            <Line :data="pomodoroChartData" :options="baseLineOptions" />
          </div>
        </template>
      </Card>
    </div>

    <!-- Charts Row 2 -->
    <div class="grid grid-cols-2 gap-5 mb-5">
      <Card class="rounded-2xl border border-stone-200 shadow-none">
        <template #content>
          <p class="text-xs font-semibold text-stone-800 mb-1">XP Earned</p>
          <p class="text-[0.65rem] text-stone-400 mb-4">
            Over the last {{ period }}
          </p>
          <div class="h-48">
            <Line :data="xpChartData" :options="baseLineOptions" />
          </div>
        </template>
      </Card>

      <Card class="rounded-2xl border border-stone-200 shadow-none">
        <template #content>
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
        </template>
      </Card>
    </div>

    <!-- AI Report -->
    <Card class="rounded-2xl border border-stone-200 shadow-none">
      <template #content>
        <div class="flex items-center justify-between mb-4">
          <div>
            <p class="text-sm font-semibold text-stone-800">
              Bi-monthly Report
            </p>
            <p class="text-[0.65rem] text-stone-400 mt-0.5">
              {{ reportData?.period || "Current period" }}
            </p>
          </div>

          <div class="flex items-center gap-2">
            <Button
              :label="reportLoading ? 'Generating...' : 'Generate Report'"
              :icon="reportLoading ? 'pi pi-spinner pi-spin' : 'pi pi-sparkles'"
              :disabled="reportLoading"
              severity="secondary"
              class="rounded-lg! text-xs! font-semibold!"
              @click="fetchReport"
            />

            <Button
              v-if="reportData"
              :label="pdfLoading ? 'Downloading...' : 'Download PDF'"
              :icon="pdfLoading ? 'pi pi-spinner pi-spin' : 'pi pi-download'"
              :disabled="pdfLoading"
              severity="contrast"
              outlined
              class="rounded-lg! text-xs! font-semibold!"
              @click="downloadPdf"
            />
          </div>
        </div>

        <!-- Report Content -->
        <div v-if="reportData" class="flex flex-col gap-4">
          <div class="grid grid-cols-3 gap-3">
            <Card class="rounded-xl border-0 shadow-none bg-stone-50">
              <template #content>
                <div class="text-center">
                  <p
                    class="text-lg font-serif text-stone-800 leading-none mb-1"
                  >
                    {{ reportData.tasksCompleted }}
                  </p>
                  <p class="text-[0.65rem] font-medium text-stone-400">
                    Tasks Done
                  </p>
                </div>
              </template>
            </Card>

            <Card class="rounded-xl border-0 shadow-none bg-stone-50">
              <template #content>
                <div class="text-center">
                  <p
                    class="text-lg font-serif text-stone-800 leading-none mb-1"
                  >
                    {{ reportData.goalsCompleted }}
                  </p>
                  <p class="text-[0.65rem] font-medium text-stone-400">
                    Goals Done
                  </p>
                </div>
              </template>
            </Card>

            <Card class="rounded-xl border-0 shadow-none bg-(--xp-soft)">
              <template #content>
                <div class="text-center">
                  <p class="text-lg font-serif leading-none mb-1 text-(--xp)">
                    +{{ reportData.xpEarned }}
                  </p>
                  <p class="text-[0.65rem] font-medium text-(--xp) opacity-70">
                    XP Earned
                  </p>
                </div>
              </template>
            </Card>
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

        <div v-else-if="!reportLoading" class="report-empty-state">
          <i class="pi pi-file-pdf text-stone-300 text-2xl mb-2 block" />
          <p class="text-sm text-stone-400">
            Generate your bi-monthly productivity report
          </p>
        </div>

        <small v-if="reportError" class="text-red-500 mt-2 block">
          {{ reportError }}
        </small>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { storeToRefs } from "pinia";

import Card from "primevue/card";
import Button from "primevue/button";
import SelectButton from "primevue/selectbutton";
import Message from "primevue/message";

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

import { useAnalyticsStore } from "./analytics.store";
import { useAnalyticsCharts } from "./analytics.composable";
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

const analyticsStore = useAnalyticsStore();
const { period } = storeToRefs(analyticsStore);

const totals = computed(() => analyticsStore.getTotals(period.value));

const periodOptions = [
  { label: "7 days", value: "7d" },
  { label: "30 days", value: "30d" },
  { label: "90 days", value: "90d" },
];

const {
  tasksChartData,
  pomodoroChartData,
  xpChartData,
  productivityChartData,
  baseLineOptions,
  productivityBarOptions,
} = useAnalyticsCharts();

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

<style scoped>
:deep(.analytics-period-switch .p-selectbutton) {
  display: flex;
  background: #f5f5f4;
  padding: 0.25rem;
  border-radius: 0.75rem;
  gap: 0.25rem;
}

:deep(.analytics-period-switch .p-togglebutton) {
  border: none;
  border-radius: 0.5rem;
  background: transparent;
  color: #78716c;
  font-size: 0.75rem;
  font-weight: 500;
  transition: all 0.15s ease;
}

:deep(.analytics-period-switch .p-togglebutton.p-highlight) {
  background: white;
  color: #292524;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
</style>

import { ref, computed, watch, onMounted } from "vue";
import { useAnalyticsStore } from "./analytics.store";
import type { AnalyticsPeriod } from "./analytics.type";
import type { ChartData, ChartOptions } from "chart.js";

export const useAnalytics = () => {
  const store = useAnalyticsStore();
  const period = ref<AnalyticsPeriod>("7d");

  const periodOptions = [
    { label: "7 days", value: "7d" },
    { label: "30 days", value: "30d" },
    { label: "90 days", value: "90d" },
  ];

  const dailyStats = computed(() => store.getDailyStats(period.value));
  const weekdayStats = computed(() => store.getWeekdayStats(period.value));
  const totals = computed(() => store.getTotals(period.value));

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const labels = computed(() =>
    dailyStats.value.map((d) => formatDate(d.date)),
  );
  const weekdayLabels = computed(() => weekdayStats.value.map((d) => d.day));

  const baseLineOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 }, color: "#a09890" },
      },
      y: {
        beginAtZero: true,
        grid: { color: "#f2efe9" },
        ticks: { font: { size: 11 }, color: "#a09890", stepSize: 1 },
      },
    },
    elements: {
      line: { tension: 0.4 },
      point: { radius: 3, hoverRadius: 5 },
    },
  };

  const baseBarOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 }, color: "#a09890" },
      },
      y: {
        beginAtZero: true,
        grid: { color: "#f2efe9" },
        ticks: { font: { size: 11 }, color: "#a09890", stepSize: 1 },
      },
    },
    borderRadius: 6,
  } as ChartOptions<"bar">;

  const tasksChartData = computed<ChartData<"line">>(() => ({
    labels: labels.value,
    datasets: [
      {
        data: dailyStats.value.map((d) => d.tasksCompleted),
        borderColor: "#c2622a",
        backgroundColor: "rgba(194, 98, 42, 0.08)",
        fill: true,
      },
    ],
  }));

  const pomodoroChartData = computed<ChartData<"line">>(() => ({
    labels: labels.value,
    datasets: [
      {
        data: dailyStats.value.map((d) => d.pomodoroSessions),
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.08)",
        fill: true,
      },
    ],
  }));

  const xpChartData = computed<ChartData<"line">>(() => ({
    labels: labels.value,
    datasets: [
      {
        data: dailyStats.value.map((d) => d.xpEarned),
        borderColor: "#7c5cbf",
        backgroundColor: "rgba(124, 92, 191, 0.08)",
        fill: true,
      },
    ],
  }));

  const productivityChartData = computed<ChartData<"bar">>(() => ({
    labels: weekdayLabels.value,
    datasets: [
      {
        label: "Tasks",
        data: weekdayStats.value.map((d) => d.tasksCompleted),
        backgroundColor: "rgba(194, 98, 42, 0.7)",
      },
      {
        label: "Pomodoros",
        data: weekdayStats.value.map((d) => d.pomodoroSessions),
        backgroundColor: "rgba(16, 185, 129, 0.7)",
      },
    ],
  }));

  const productivityBarOptions: ChartOptions<"bar"> = {
    ...baseBarOptions,
    plugins: {
      legend: {
        display: true,
        labels: { font: { size: 11 }, color: "#6b6560", boxWidth: 12 },
      },
    },
  } as ChartOptions<"bar">;

  return {
    period,
    periodOptions,
    totals,
    tasksChartData,
    pomodoroChartData,
    xpChartData,
    productivityChartData,
    baseLineOptions,
    productivityBarOptions,
  };
};

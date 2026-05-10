import { computed } from "vue";
import type { ChartData, ChartOptions } from "chart.js";
import { useAnalyticsStore } from "./analytics.store";

export const useAnalyticsCharts = () => {
  const store = useAnalyticsStore();

  const dailyStats = computed(() => store.getDailyStats(store.period));
  const weekdayStats = computed(() => store.getWeekdayStats(store.period));

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

  const labels = computed(() =>
    dailyStats.value.map((d) => formatDate(d.date)),
  );
  const weekdayLabels = computed(() => weekdayStats.value.map((d) => d.day));

  // ── Peak day detection ─────────────────────────────────────────────────────
  const peakDayIndex = computed(() => {
    const totals = weekdayStats.value.map(
      (d) => d.tasksCompleted + d.pomodoroSessions,
    );
    return totals.indexOf(Math.max(...totals));
  });

  const peakDayLabel = computed(
    () => weekdayStats.value[peakDayIndex.value]?.day ?? null,
  );

  // ── Chart options ──────────────────────────────────────────────────────────
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

  // Dual-axis line options for combined Tasks + XP chart
  const combinedLineOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: { font: { size: 11 }, color: "#6b6560", boxWidth: 12 },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 }, color: "#a09890" },
      },
      tasks: {
        type: "linear",
        position: "left",
        beginAtZero: true,
        grid: { color: "#f2efe9" },
        ticks: { font: { size: 11 }, color: "#c2622a", stepSize: 1 },
      },
      xp: {
        type: "linear",
        position: "right",
        beginAtZero: true,
        grid: { display: false },
        ticks: { font: { size: 11 }, color: "#7c5cbf" },
      },
    },
    elements: {
      line: { tension: 0.4 },
      point: { radius: 3, hoverRadius: 5 },
    },
  };

  const productivityBarOptions = computed<ChartOptions<"bar">>(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: { font: { size: 11 }, color: "#6b6560", boxWidth: 12 },
      },
    },
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
  }));

  // ── Chart data ─────────────────────────────────────────────────────────────

  // Combined Tasks + XP dual-axis chart
  const combinedChartData = computed<ChartData<"line">>(() => ({
    labels: labels.value,
    datasets: [
      {
        label: "Tasks",
        data: dailyStats.value.map((d) => d.tasksCompleted),
        borderColor: "#c2622a",
        backgroundColor: "rgba(194,98,42,0.08)",
        fill: true,
        yAxisID: "tasks",
      },
      {
        label: "XP",
        data: dailyStats.value.map((d) => d.xpEarned),
        borderColor: "#7c5cbf",
        backgroundColor: "rgba(124,92,191,0.06)",
        fill: true,
        yAxisID: "xp",
      },
    ],
  }));

  const pomodoroChartData = computed<ChartData<"line">>(() => ({
    labels: labels.value,
    datasets: [
      {
        data: dailyStats.value.map((d) => d.pomodoroSessions),
        borderColor: "#10b981",
        backgroundColor: "rgba(16,185,129,0.08)",
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
        // Highlight peak bar
        backgroundColor: weekdayStats.value.map((_, i) =>
          i === peakDayIndex.value
            ? "rgba(194,98,42,1)"
            : "rgba(194,98,42,0.4)",
        ),
      },
      {
        label: "Pomodoros",
        data: weekdayStats.value.map((d) => d.pomodoroSessions),
        backgroundColor: weekdayStats.value.map((_, i) =>
          i === peakDayIndex.value
            ? "rgba(16,185,129,1)"
            : "rgba(16,185,129,0.4)",
        ),
      },
    ],
  }));

  return {
    combinedChartData,
    combinedLineOptions,
    pomodoroChartData,
    productivityChartData,
    productivityBarOptions,
    baseLineOptions,
    peakDayLabel,
  };
};

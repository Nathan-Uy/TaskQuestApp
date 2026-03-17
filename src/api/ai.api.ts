import api from "./axios";
import type {
  TaskDescriptionResult,
  TriagedTask,
  GoalSuggestion,
  StreakCoach,
  ReportData,
} from "@/types/ai.types";

export type {
  TaskDescriptionResult,
  TriagedTask,
  GoalSuggestion,
  StreakCoach,
  ReportData,
};

export const aiApi = {
  generateTaskDescription: (title: string) =>
    api
      .post<TaskDescriptionResult>("/ai/task-description", { title })
      .then((r) => r.data),

  triageOverdueTasks: () =>
    api.get<{ triaged: TriagedTask[] }>("/ai/triage").then((r) => r.data),

  suggestGoalTitle: (input: string) =>
    api.post<GoalSuggestion>("/ai/suggest-goal", { input }).then((r) => r.data),

  getStreakCoach: () =>
    api.get<StreakCoach>("/ai/streak-coach").then((r) => r.data),

  getReport: () => api.get<ReportData>("/ai/report").then((r) => r.data),

  downloadReportPdf: () =>
    api.get("/ai/report/download", { responseType: "blob" }).then((r) => {
      const url = window.URL.createObjectURL(new Blob([r.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `taskquest-report-${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    }),
};

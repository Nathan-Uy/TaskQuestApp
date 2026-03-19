import api from "@/api/axios";
import type {
  Goal,
  CreateGoalPayload,
  CompleteGoalResponse,
} from "./goals.types";

export const goalsService = {
  getAll: (): Promise<Goal[]> => api.get("/goals").then((r) => r.data),

  create: (payload: CreateGoalPayload): Promise<Goal> =>
    api.post("/goals", payload).then((r) => r.data),

  complete: (id: string): Promise<CompleteGoalResponse> =>
    api.patch(`/goals/${id}/complete`).then((r) => r.data),

  remove: (id: string): Promise<void> =>
    api.delete(`/goals/${id}`).then((r) => r.data),

  linkTask: (goalId: string, taskId: string): Promise<Goal> =>
    api.patch(`/goals/${goalId}/link-task`, { taskId }).then((r) => r.data),

  unlinkTask: (goalId: string, taskId: string): Promise<Goal> =>
    api.patch(`/goals/${goalId}/unlink-task`, { taskId }).then((r) => r.data),
};

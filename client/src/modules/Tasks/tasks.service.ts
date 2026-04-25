import api from "@/api/axios";
import type {
  Task,
  CreateTaskPayload,
  CompleteTaskResponse,
} from "./tasks.type";

export const tasksService = {
  getAll: (): Promise<Task[]> => api.get("/personal-tasks").then((r) => r.data),

  create: (payload: CreateTaskPayload): Promise<Task> =>
    api.post("/personal-tasks", payload).then((r) => r.data),

  complete: (id: string): Promise<CompleteTaskResponse> =>
    api.patch(`/personal-tasks/${id}/complete`).then((r) => r.data),

  update: (id: string, patch: Partial<Task>): Promise<Task> =>
    api.put(`/personal-tasks/${id}`, patch).then((r) => r.data),

  remove: (id: string): Promise<void> =>
    api.delete(`/personal-tasks/${id}`).then((r) => r.data),
};

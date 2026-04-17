import api from "@/api/axios";
import type { Task, CreateTaskDto, UpdateTaskDto } from "./tasks.types";

export const taskApi = {
  getTasks: (sprintId: string) => api.get<Task[]>(`/tasks/sprint/${sprintId}`),
  createTask: (sprintId: string, data: CreateTaskDto) =>
    api.post<Task>(`/tasks/sprint/${sprintId}`, data),
  updateTask: (taskId: string, data: UpdateTaskDto) =>
    api.put<Task>(`/tasks/${taskId}`, data),
  deleteTask: (taskId: string) => api.delete(`/tasks/${taskId}`),
};

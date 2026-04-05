import { Request, Response } from "express";
import Task from "../models/Task";
import { getSprintWithAuth, sendAuthError } from "../middleware/workspace.auth";
import { param } from "../middleware/params";
import type { CreateTaskBody, UpdateTaskBody } from "../types/tasks.types";

interface AuthRequest extends Request {
  userId?: string;
}

export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const sprintId = param(req, "sprintId");
    const result = await getSprintWithAuth(sprintId, userId);
    if (!result.ok) return sendAuthError(res, result);
    const tasks = await Task.find({ sprintId }).sort({ createdAt: 1 });
    res.json(tasks);
  } catch {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
};

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const sprintId = param(req, "sprintId");
    const result = await getSprintWithAuth(sprintId, userId);
    if (!result.ok) return sendAuthError(res, result);
    const body = req.body as CreateTaskBody;
    if (!body.title?.trim())
      return res.status(400).json({ error: "Task title required" });
    const task = await Task.create({
      sprintId,
      teamId: result.data.sprint.teamId,
      title: body.title.trim(),
      description: body.description?.trim() ?? "",
      taskType: body.taskType ?? "",
      priority: body.priority ?? "medium",
      status: body.status ?? "todo",
      assignedTo: body.assignedTo ?? null,
      createdBy: userId,
      duration: body.duration ?? null,
      dueDate: body.dueDate ? new Date(body.dueDate as string) : null,
    });
    res.status(201).json(task);
  } catch {
    res.status(500).json({ error: "Failed to create task" });
  }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const taskId = param(req, "taskId");
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ error: "Task not found" });
    const result = await getSprintWithAuth(task.sprintId, userId);
    if (!result.ok) return sendAuthError(res, result);
    const body = req.body as UpdateTaskBody;
    if (body.title !== undefined) task.title = body.title.trim() || task.title;
    if (body.description !== undefined)
      task.description = body.description.trim();
    if (body.taskType !== undefined) task.taskType = body.taskType;
    if (body.status !== undefined) task.status = body.status;
    if (body.priority !== undefined) task.priority = body.priority;
    if (body.assignedTo !== undefined)
      task.assignedTo = body.assignedTo ?? null;
    if (body.duration !== undefined) task.duration = body.duration ?? null;
    if (body.dueDate !== undefined)
      task.dueDate = body.dueDate ? new Date(body.dueDate as string) : null;
    await task.save();
    res.json(task);
  } catch {
    res.status(500).json({ error: "Failed to update task" });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const taskId = param(req, "taskId");
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ error: "Task not found" });
    const result = await getSprintWithAuth(task.sprintId, userId);
    if (!result.ok) return sendAuthError(res, result);
    await Task.findByIdAndDelete(taskId);
    res.json({ message: "Task deleted" });
  } catch {
    res.status(500).json({ error: "Failed to delete task" });
  }
};

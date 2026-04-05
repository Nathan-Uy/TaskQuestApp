import { Request, Response } from "express";
import Task from "../models/Task";
import Sprint from "../models/Sprint";
import Team from "../models/Team";
import Project from "../models/Project";
import type { CreateTaskBody, UpdateTaskBody } from "../types/tasks.types";

interface AuthRequest extends Request {
  userId?: string;
}

interface AuthError {
  error: string;
  status: number;
}

interface AuthSuccess {
  sprint: any;
  team: any;
  project: any;
}

type AuthProjectResult = AuthError | AuthSuccess;

const getAuthorizedProject = async (
  sprintId: string,
  userId: string,
): Promise<AuthProjectResult> => {
  const sprint = await Sprint.findById(sprintId);
  if (!sprint) return { error: "Sprint not found", status: 404 };

  const team = await Team.findById(sprint.teamId);
  if (!team) return { error: "Team not found", status: 404 };

  const project = await Project.findById(team.projectId);
  if (!project || project.owner !== userId) {
    return { error: "Not authorized", status: 403 };
  }

  return { sprint, team, project };
};

export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const rawSprintId = req.params.sprintId;
    const sprintId = typeof rawSprintId === "string" ? rawSprintId : undefined;
    const userId = req.userId;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    if (!sprintId) {
      return res.status(400).json({ error: "Sprint ID is required" });
    }

    const auth = await getAuthorizedProject(sprintId, userId);
    if ("error" in auth) {
      return res.status(auth.status ?? 500).json({ error: auth.error });
    }

    const tasks = await Task.find({ sprintId }).sort({ createdAt: 1 });
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
};

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const rawSprintId = req.params.sprintId;
    const sprintId = typeof rawSprintId === "string" ? rawSprintId : undefined;
    const userId = req.userId;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    if (!sprintId) {
      return res.status(400).json({ error: "Sprint ID is required" });
    }

    const auth = await getAuthorizedProject(sprintId, userId);
    if ("error" in auth) {
      return res.status(auth.status ?? 500).json({ error: auth.error });
    }

    const {
      title,
      description,
      taskType,
      priority,
      assignedTo,
      duration,
      status,
      dueDate,
    } = req.body as CreateTaskBody;

    if (!title?.trim()) {
      return res.status(400).json({ error: "Task title required" });
    }

    const durationValue =
      typeof duration === "number" && !isNaN(duration) ? duration : null;

    const task = new Task({
      sprintId,
      teamId: auth.sprint.teamId,
      title: title.trim(),
      description: description?.trim() ?? "",
      taskType: taskType ?? "",
      priority: priority ?? "medium",
      status: status ?? "todo",
      assignedTo: assignedTo ?? null,
      createdBy: userId,
      duration: durationValue,
      dueDate: dueDate ? new Date(dueDate) : null,
    });

    await task.save();
    res.status(201).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create task" });
  }
};
export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const taskId = req.params.taskId;
    const userId = req.userId;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    if (!taskId) return res.status(400).json({ error: "Task ID is required" });

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ error: "Task not found" });

    const auth = await getAuthorizedProject(task.sprintId, userId);
    if ("error" in auth) {
      return res.status(auth.status ?? 500).json({ error: auth.error });
    }

    const {
      title,
      description,
      taskType,
      status,
      priority,
      assignedTo,
      duration,
      dueDate,
    } = req.body as UpdateTaskBody;

    if (title !== undefined) task.title = title.trim() || task.title;
    if (description !== undefined) task.description = description.trim();
    if (taskType !== undefined) task.taskType = taskType;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (assignedTo !== undefined) task.assignedTo = assignedTo ?? null;

    if (duration !== undefined) {
      task.duration =
        typeof duration === "number" && !isNaN(duration) ? duration : null;
    }

    if (dueDate !== undefined) {
      task.dueDate = dueDate ? new Date(dueDate) : null;
    }

    await task.save();
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update task" });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const taskId = req.params.taskId;
    const userId = req.userId;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    if (!taskId) return res.status(400).json({ error: "Task ID is required" });

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ error: "Task not found" });

    const auth = await getAuthorizedProject(task.sprintId, userId);
    if ("error" in auth) {
      return res.status(auth.status ?? 500).json({ error: auth.error });
    }

    await Task.findByIdAndDelete(taskId);
    res.json({ message: "Task deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete task" });
  }
};

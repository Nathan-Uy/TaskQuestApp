// controllers/task.controller.ts
import { Request, Response } from "express";
import Task from "../models/Task";
import PersonalTask from "../models/PersonalTask";
import { User } from "../models/User";
import { getSprintWithAuth, sendAuthError } from "../middleware/workspace.auth";
import { param } from "../middleware/params";

interface AuthRequest extends Request {
  userId?: string;
}

const XP_MAP: Record<string, number> = { low: 10, medium: 20, high: 35 };

export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const sprintId = param(req, "sprintId");
    const result = await getSprintWithAuth(sprintId, userId);
    if (!result.ok) return sendAuthError(res, result);
    const tasks = await Task.find({ sprintId }).sort({ createdAt: -1 });
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

    const {
      title,
      description,
      taskType,
      priority,
      assignedTo,
      duration,
      dueDate,
    } = req.body;
    if (!title?.trim())
      return res.status(400).json({ error: "Title required" });

    const task = await Task.create({
      sprintId,
      teamId: result.data.sprint.teamId,
      title: title.trim(),
      description: description?.trim() ?? "",
      taskType: taskType ?? "",
      priority: priority ?? "medium",
      assignedTo: assignedTo ?? null,
      createdBy: userId,
      duration: duration ?? null,
      dueDate: dueDate ? new Date(dueDate) : null,
    });

    // ── Mirror to personal tasks if assigned ──────────────────────
    if (assignedTo) {
      await _mirrorToPersonalTask(task, assignedTo);
    }

    res.status(201).json(task);
  } catch (err) {
    console.error(err);
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

    const prevAssignedTo = task.assignedTo;
    const {
      title,
      description,
      status,
      priority,
      assignedTo,
      duration,
      dueDate,
      taskType,
    } = req.body;

    if (title !== undefined) task.title = title.trim() || task.title;
    if (description !== undefined) task.description = description.trim();
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;
    if (duration !== undefined) task.duration = duration;
    if (taskType !== undefined) task.taskType = taskType;
    if (dueDate !== undefined)
      task.dueDate = dueDate ? new Date(dueDate) : null;

    await task.save();

    // ── Sync personal task mirrors ────────────────────────────────
    const newAssignedTo = task.assignedTo;

    if (newAssignedTo && newAssignedTo !== prevAssignedTo) {
      // Newly assigned — remove old mirror if existed, create new one
      if (prevAssignedTo) {
        await PersonalTask.deleteOne({
          sprintTaskId: taskId,
          userId: prevAssignedTo,
        });
      }
      await _mirrorToPersonalTask(task, newAssignedTo);
    } else if (!newAssignedTo && prevAssignedTo) {
      // Unassigned — remove mirror
      await PersonalTask.deleteOne({
        sprintTaskId: taskId,
        userId: prevAssignedTo,
      });
    } else if (newAssignedTo) {
      // Still assigned — update existing mirror
      await PersonalTask.findOneAndUpdate(
        { sprintTaskId: taskId, userId: newAssignedTo },
        {
          title: task.title,
          notes: task.description,
          priority: task.priority,
          duration: task.duration ?? 1500,
          dueDate: task.dueDate,
          // sync completion status
          ...(status === "done"
            ? { status: "completed", completedAt: new Date() }
            : {}),
          ...(status !== "done" && status !== undefined
            ? { status: "active", completedAt: null }
            : {}),
        },
      );
    }

    // ── If marked done, award XP to assignee ─────────────────────
    if (status === "done" && task.assignedTo) {
      const xp = XP_MAP[task.priority] ?? 20;
      const user = await User.findByIdAndUpdate(
        task.assignedTo,
        { $inc: { currentXP: xp, totalXP: xp, tasksCompleted: 1 } },
        { returnDocument: "after" },
      );
      if (user && user.currentXP >= user.xpToNextLevel) {
        user.level++;
        user.currentXP -= user.xpToNextLevel;
        user.xpToNextLevel = Math.floor(user.xpToNextLevel * 1.5);
        await user.save();
      }
    }

    res.json(task);
  } catch (err) {
    console.error(err);
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

    // Remove personal task mirror if exists
    if (task.assignedTo) {
      await PersonalTask.deleteOne({
        sprintTaskId: taskId,
        userId: task.assignedTo,
      });
    }

    await Task.findByIdAndDelete(taskId);
    res.json({ message: "Task deleted" });
  } catch {
    res.status(500).json({ error: "Failed to delete task" });
  }
};

async function _mirrorToPersonalTask(task: any, assignedTo: string) {
  const existing = await PersonalTask.findOne({
    sprintTaskId: task._id.toString(),
  });
  if (existing) return; // already mirrored

  const xpReward = XP_MAP[task.priority] ?? 20;
  await PersonalTask.create({
    userId: assignedTo,
    title: task.title,
    notes: task.description ?? "",
    priority: task.priority,
    status: task.status === "done" ? "completed" : "active",
    duration: task.duration ?? 1500,
    xpReward,
    dueDate: task.dueDate ?? null,
    completedAt: task.status === "done" ? new Date() : null,
    sprintTaskId: task._id.toString(),
    sprintId: task.sprintId,
    teamId: task.teamId,
    isSprintTask: true,
  });
}

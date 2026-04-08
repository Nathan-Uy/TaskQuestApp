import { Request, Response } from "express";
import PersonalTask from "../models/PersonalTask";
import { User } from "../models/User";
import {
  CreatePersonalTaskDto,
  UpdatePersonalTaskDto,
} from "../types/personalTask.types";

interface AuthRequest extends Request {
  userId?: string;
}

const XP_MAP: Record<string, number> = { low: 10, medium: 20, high: 35 };

export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const tasks = await PersonalTask.find({ userId }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
};

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { title, notes, priority, duration, dueDate } =
      req.body as CreatePersonalTaskDto;
    if (!title?.trim())
      return res.status(400).json({ error: "Title required" });

    const p = priority || "medium";
    const xpReward = XP_MAP[p] ?? 20;

    const task = new PersonalTask({
      userId,
      title: title.trim(),
      notes: notes?.trim() || "",
      priority: p,
      duration: duration || 1500,
      xpReward,
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
    const { id } = req.params;
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const updates = req.body as UpdatePersonalTaskDto;
    const task = await PersonalTask.findOne({ _id: id, userId });
    if (!task) return res.status(404).json({ error: "Task not found" });

    if (updates.title !== undefined)
      task.title = updates.title.trim() || task.title;
    if (updates.notes !== undefined) task.notes = updates.notes.trim();
    if (updates.status !== undefined) task.status = updates.status;
    if (updates.priority !== undefined) {
      task.priority = updates.priority;
      task.xpReward = XP_MAP[updates.priority] ?? task.xpReward;
    }
    if (updates.duration !== undefined) task.duration = updates.duration;
    if (updates.dueDate !== undefined)
      task.dueDate = updates.dueDate ? new Date(updates.dueDate) : null;

    await task.save();
    res.json(task);
  } catch {
    res.status(500).json({ error: "Failed to update task" });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const task = await PersonalTask.findOneAndDelete({ _id: id, userId });
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json({ message: "Task deleted" });
  } catch {
    res.status(500).json({ error: "Failed to delete task" });
  }
};

export const completeTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const task = await PersonalTask.findOne({ _id: id, userId });
    if (!task) return res.status(404).json({ error: "Task not found" });

    task.status = "completed";
    task.completedAt = new Date();
    await task.save();

    // Award XP to user
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $inc: {
          currentXP: task.xpReward,
          totalXP: task.xpReward,
          tasksCompleted: 1,
        },
      },
      { returnDocument: "after" },
    );

    // Handle level up
    if (user && user.currentXP >= user.xpToNextLevel) {
      user.level++;
      user.currentXP = user.currentXP - user.xpToNextLevel;
      user.xpToNextLevel = Math.floor(user.xpToNextLevel * 1.5);
      await user.save();
    }

    res.json({
      task,
      user: user
        ? {
            level: user.level,
            currentXP: user.currentXP,
            xpToNextLevel: user.xpToNextLevel,
            totalXP: user.totalXP,
            tasksCompleted: user.tasksCompleted,
          }
        : null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to complete task" });
  }
};

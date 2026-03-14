import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { Task } from "../models/Task";
import { User } from "../models/User";

export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const tasks = await Task.find({ userId: req.userId }).sort({
      createdAt: -1,
    });
    res.json(tasks);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const { title, notes, priority, duration, dueDate } = req.body;
    if (!title) return res.status(400).json({ message: "Title is required" });

    const xpReward = Math.max(10, Math.floor((duration || 1500) / 60));
    const task = await Task.create({
      userId: req.userId,
      title,
      notes,
      priority: priority || "medium",
      duration: duration || 1500,
      xpReward,
      dueDate,
    });
    res.status(201).json(task);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { returnDocument: "after" },
    );
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const completeTask = async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { status: "completed", completedAt: new Date() },
      { returnDocument: "after" },
    );
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Award XP and increment tasksCompleted
    const user = await User.findById(req.userId);
    if (user) {
      user.currentXP += task.xpReward;
      user.totalXP += task.xpReward;
      user.tasksCompleted += 1;

      // Level up logic
      while (user.currentXP >= user.xpToNextLevel) {
        user.currentXP -= user.xpToNextLevel;
        user.level += 1;
        user.xpToNextLevel = Math.floor(user.xpToNextLevel * 1.5);
      }

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
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    await Task.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ message: "Deleted" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

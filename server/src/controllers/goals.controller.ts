import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { Goal } from "../models/Goal";
import { User } from "../models/User";

export const getGoals = async (req: AuthRequest, res: Response) => {
  try {
    const goals = await Goal.find({ userId: req.userId }).sort({
      createdAt: -1,
    });
    res.json(goals);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const createGoal = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, timeframe, xpReward, deadline } = req.body;
    if (!title) return res.status(400).json({ message: "Title is required" });

    const goal = await Goal.create({
      userId: req.userId,
      title,
      description,
      timeframe: timeframe || "weekly",
      xpReward: xpReward || 100,
      deadline,
    });
    res.status(201).json(goal);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const completeGoal = async (req: AuthRequest, res: Response) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { status: "completed", completedAt: new Date() },
      { new: true },
    );
    if (!goal) return res.status(404).json({ message: "Goal not found" });

    const user = await User.findById(req.userId);
    if (user) {
      user.currentXP += goal.xpReward;
      user.totalXP += goal.xpReward;

      while (user.currentXP >= user.xpToNextLevel) {
        user.currentXP -= user.xpToNextLevel;
        user.level += 1;
        user.xpToNextLevel = Math.floor(user.xpToNextLevel * 1.5);
      }

      await user.save();
    }

    res.json({
      goal,
      user: user
        ? {
            level: user.level,
            currentXP: user.currentXP,
            xpToNextLevel: user.xpToNextLevel,
            totalXP: user.totalXP,
          }
        : null,
    });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const linkTask = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.body;
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $addToSet: { linkedTaskIds: taskId } },
      { new: true },
    );
    if (!goal) return res.status(404).json({ message: "Goal not found" });
    res.json(goal);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const unlinkTask = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.body;
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $pull: { linkedTaskIds: taskId } },
      { new: true },
    );
    if (!goal) return res.status(404).json({ message: "Goal not found" });
    res.json(goal);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteGoal = async (req: AuthRequest, res: Response) => {
  try {
    await Goal.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ message: "Deleted" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

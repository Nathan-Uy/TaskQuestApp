import { Request, Response } from "express";
import Task from "../models/Task";
import Sprint from "../models/Sprint";
import Team from "../models/Team";
import { CreateTaskBody, UpdateTaskBody } from "../types/tasks.types";

interface AuthRequest extends Request {
  userId?: string;
}

export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const { sprintId } = req.params;
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const sprint = await Sprint.findById(sprintId);
    if (!sprint) return res.status(404).json({ error: "Sprint not found" });
    const team = await Team.findById(sprint.teamId);
    if (!team) return res.status(404).json({ error: "Team not found" });
    const project = await require("../models/Project").default.findById(
      team.projectId,
    );
    if (project?.owner !== userId)
      return res.status(403).json({ error: "Not authorized" });

    const tasks = await Task.find({ sprintId }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
};

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const { sprintId } = req.params;
    const { title, description, priority, assignedTo, duration } =
      req.body as CreateTaskBody;
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const sprint = await Sprint.findById(sprintId);
    if (!sprint) return res.status(404).json({ error: "Sprint not found" });
    const team = await Team.findById(sprint.teamId);
    if (!team) return res.status(404).json({ error: "Team not found" });
    const project = await require("../models/Project").default.findById(
      team.projectId,
    );
    if (project?.owner !== userId)
      return res.status(403).json({ error: "Not authorized" });

    if (!title?.trim())
      return res.status(400).json({ error: "Task title required" });

    const task = new Task({
      sprintId,
      teamId: sprint.teamId,
      title: title.trim(),
      description: description?.trim() || "",
      priority: priority || "medium",
      assignedTo: assignedTo || null,
      createdBy: userId,
      duration: duration ?? null,
    });
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create task" });
  }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    const updates = req.body as UpdateTaskBody;
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ error: "Task not found" });
    const sprint = await Sprint.findById(task.sprintId);
    if (!sprint) return res.status(404).json({ error: "Sprint not found" });
    const team = await Team.findById(sprint.teamId);
    if (!team) return res.status(404).json({ error: "Team not found" });
    const project = await require("../models/Project").default.findById(
      team.projectId,
    );
    if (project?.owner !== userId)
      return res.status(403).json({ error: "Not authorized" });

    Object.assign(task, updates);
    await task.save();
    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update task" });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ error: "Task not found" });
    const sprint = await Sprint.findById(task.sprintId);
    if (!sprint) return res.status(404).json({ error: "Sprint not found" });
    const team = await Team.findById(sprint.teamId);
    if (!team) return res.status(404).json({ error: "Team not found" });
    const project = await require("../models/Project").default.findById(
      team.projectId,
    );
    if (project?.owner !== userId)
      return res.status(403).json({ error: "Not authorized" });

    await Task.findByIdAndDelete(taskId);
    res.json({ message: "Task deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete task" });
  }
};

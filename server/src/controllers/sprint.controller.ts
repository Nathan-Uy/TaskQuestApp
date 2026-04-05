import { Request, Response } from "express";
import Sprint from "../models/Sprint";
import Task from "../models/Task";
import {
  getTeamWithAuth,
  getSprintWithAuth,
  sendAuthError,
} from "../middleware/workspace.auth";
import { param } from "../middleware/params";
import type { CreateSprintBody, UpdateSprintBody } from "../types/sprint.types";

interface AuthRequest extends Request {
  userId?: string;
}

export const getSprints = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const teamId = param(req, "teamId");
    const result = await getTeamWithAuth(teamId, userId);
    if (!result.ok) return sendAuthError(res, result);
    const sprints = await Sprint.find({ teamId }).sort({ startDate: -1 });
    res.json(sprints);
  } catch {
    res.status(500).json({ error: "Failed to fetch sprints" });
  }
};

export const getSprint = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const result = await getSprintWithAuth(param(req, "sprintId"), userId);
    if (!result.ok) return sendAuthError(res, result);
    res.json(result.data.sprint);
  } catch {
    res.status(500).json({ error: "Failed to fetch sprint" });
  }
};

export const createSprint = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const teamId = param(req, "teamId");
    const result = await getTeamWithAuth(teamId, userId);
    if (!result.ok) return sendAuthError(res, result);
    const body = req.body as CreateSprintBody;
    if (!body.name?.trim())
      return res.status(400).json({ error: "Sprint name required" });
    if (!body.startDate || !body.endDate)
      return res.status(400).json({ error: "Start and end dates required" });
    const sprint = await Sprint.create({
      teamId,
      name: body.name.trim(),
      description: body.description?.trim() ?? "",
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      status: body.status ?? "planning",
    });
    res.status(201).json(sprint);
  } catch {
    res.status(500).json({ error: "Failed to create sprint" });
  }
};

export const updateSprint = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const result = await getSprintWithAuth(param(req, "sprintId"), userId);
    if (!result.ok) return sendAuthError(res, result);
    const body = req.body as UpdateSprintBody;
    const sprint = result.data.sprint;
    if (body.name?.trim()) sprint.name = body.name.trim();
    if (body.description != null) sprint.description = body.description.trim();
    if (body.status) sprint.status = body.status;
    if (body.startDate) sprint.startDate = new Date(body.startDate);
    if (body.endDate) sprint.endDate = new Date(body.endDate);
    await sprint.save();
    res.json(sprint);
  } catch {
    res.status(500).json({ error: "Failed to update sprint" });
  }
};

export const deleteSprint = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const sprintId = param(req, "sprintId");
    const result = await getSprintWithAuth(sprintId, userId);
    if (!result.ok) return sendAuthError(res, result);
    await Task.deleteMany({ sprintId });
    await Sprint.findByIdAndDelete(sprintId);
    res.json({ message: "Sprint deleted" });
  } catch {
    res.status(500).json({ error: "Failed to delete sprint" });
  }
};

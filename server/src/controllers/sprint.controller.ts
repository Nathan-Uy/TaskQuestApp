import { Request, Response } from "express";
import Sprint from "../models/Sprint";
import Team from "../models/Team";
import Task from "../models/Task";
import { CreateSprintBody, UpdateSprintBody } from "../types/sprint.types";

interface AuthRequest extends Request {
  userId?: string;
}

export const getSprints = async (req: AuthRequest, res: Response) => {
  try {
    const { teamId } = req.params;
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ error: "Team not found" });
    const project = await require("../models/Project").default.findById(
      team.projectId,
    );
    if (project?.owner !== userId)
      return res.status(403).json({ error: "Not authorized" });

    const sprints = await Sprint.find({ teamId }).sort({ startDate: -1 });
    res.json(sprints);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch sprints" });
  }
};

export const getSprint = async (req: AuthRequest, res: Response) => {
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

    res.json(sprint);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch sprint" });
  }
};

export const createSprint = async (req: AuthRequest, res: Response) => {
  try {
    const { teamId } = req.params;
    const { name, description, startDate, endDate, status } =
      req.body as CreateSprintBody;
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ error: "Team not found" });
    const project = await require("../models/Project").default.findById(
      team.projectId,
    );
    if (project?.owner !== userId)
      return res.status(403).json({ error: "Not authorized" });

    if (!name?.trim())
      return res.status(400).json({ error: "Sprint name required" });
    if (!startDate || !endDate)
      return res.status(400).json({ error: "Start and end dates required" });

    const sprint = new Sprint({
      teamId,
      name: name.trim(),
      description: description?.trim() || "",
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: status || "planning",
    });
    await sprint.save();
    res.status(201).json(sprint);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create sprint" });
  }
};

export const updateSprint = async (req: AuthRequest, res: Response) => {
  try {
    const { sprintId } = req.params;
    const updates = req.body as UpdateSprintBody;
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

    Object.assign(sprint, updates);
    await sprint.save();
    res.json(sprint);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update sprint" });
  }
};

export const deleteSprint = async (req: AuthRequest, res: Response) => {
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

    await Task.deleteMany({ sprintId });
    await Sprint.findByIdAndDelete(sprintId);
    res.json({ message: "Sprint deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete sprint" });
  }
};

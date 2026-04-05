import { Request, Response } from "express";
import Project from "../models/Project";
import Team from "../models/Team";
import Sprint from "../models/Sprint";
import Task from "../models/Task";
import { getProject, sendAuthError } from "../middleware/workspace.auth";
import { param } from "../middleware/params";
import type {
  CreateProjectBody,
  UpdateProjectBody,
} from "../types/project.types";

interface AuthRequest extends Request {
  userId?: string;
}

export const getProjects = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const projects = await Project.find({ owner: userId }).sort({
      createdAt: -1,
    });
    res.json(projects);
  } catch {
    res.status(500).json({ error: "Failed to fetch projects" });
  }
};

export const getProjectById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const result = await getProject(param(req, "projectId"), userId);
    if (!result.ok) return sendAuthError(res, result);
    res.json(result.data);
  } catch {
    res.status(500).json({ error: "Failed to fetch project" });
  }
};

export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const body = req.body as CreateProjectBody;
    if (!body.name?.trim())
      return res.status(400).json({ error: "Project name required" });
    const project = await Project.create({
      name: body.name.trim(),
      description: body.description?.trim() ?? "",
      owner: userId,
    });
    res.status(201).json(project);
  } catch {
    res.status(500).json({ error: "Failed to create project" });
  }
};

export const updateProject = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const result = await getProject(param(req, "projectId"), userId);
    if (!result.ok) return sendAuthError(res, result);
    const body = req.body as UpdateProjectBody;
    const project = result.data;
    if (body.name?.trim()) project.name = body.name.trim();
    if (body.description != null) project.description = body.description.trim();
    await project.save();
    res.json(project);
  } catch {
    res.status(500).json({ error: "Failed to update project" });
  }
};

export const deleteProject = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const result = await getProject(param(req, "projectId"), userId);
    if (!result.ok) return sendAuthError(res, result);
    const projectId = result.data._id.toString();
    const teams = await Team.find({ projectId });
    const teamIds = teams.map((t) => t._id.toString());
    const sprints = await Sprint.find({ teamId: { $in: teamIds } });
    const sprintIds = sprints.map((s) => s._id.toString());
    await Task.deleteMany({ sprintId: { $in: sprintIds } });
    await Sprint.deleteMany({ teamId: { $in: teamIds } });
    await Team.deleteMany({ projectId });
    await Project.findByIdAndDelete(projectId);
    res.json({ message: "Project deleted successfully" });
  } catch {
    res.status(500).json({ error: "Failed to delete project" });
  }
};

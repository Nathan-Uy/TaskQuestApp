import { Request, Response } from "express";
import Project from "../models/Project";
import Team from "../models/Team";
import Sprint from "../models/Sprint";
import Task from "../models/Task";
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
};

export const getProject = async (req: AuthRequest, res: Response) => {
  try {
    const projectId = req.params.projectId;
    const userId = req.userId;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    if (!projectId) {
      return res.status(400).json({ error: "Project ID is required" });
    }

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });

    if (project.owner !== userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch project" });
  }
};

export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { name, description } = req.body as CreateProjectBody;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    if (!name?.trim()) {
      return res.status(400).json({ error: "Project name required" });
    }

    const project = new Project({
      name: name.trim(),
      description: description?.trim() ?? "",
      owner: userId,
    });

    await project.save();
    res.status(201).json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create project" });
  }
};

export const updateProject = async (req: AuthRequest, res: Response) => {
  try {
    const projectId = req.params.projectId;
    const userId = req.userId;
    const { name, description } = req.body as UpdateProjectBody;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    if (!projectId) {
      return res.status(400).json({ error: "Project ID is required" });
    }

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });

    if (project.owner !== userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    if (name?.trim()) project.name = name.trim();
    if (description !== undefined) project.description = description.trim();

    await project.save();
    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update project" });
  }
};

export const deleteProject = async (req: AuthRequest, res: Response) => {
  try {
    const projectId = req.params.projectId;
    const userId = req.userId;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    if (!projectId) {
      return res.status(400).json({ error: "Project ID is required" });
    }

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });

    if (project.owner !== userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const teams = await Team.find({ projectId });
    const teamIds = teams.map((team) => team._id.toString());

    const sprints = await Sprint.find({ teamId: { $in: teamIds } });
    const sprintIds = sprints.map((sprint) => sprint._id.toString());

    await Task.deleteMany({ sprintId: { $in: sprintIds } });
    await Sprint.deleteMany({ teamId: { $in: teamIds } });
    await Team.deleteMany({ projectId });
    await Project.findByIdAndDelete(projectId);

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete project" });
  }
};

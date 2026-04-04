import { Request, Response } from "express";
import Project from "../models/Project";
import { User } from "../models/User";
import {
  IProject,
  CreateProjectBody,
  UpdateProjectBody,
  AddMemberBody,
} from "../types/project.types";

interface AuthRequest extends Request {
  userId?: string;
}

// Get all projects where user is owner or member
export const getProjects = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const projects = await Project.find({
      $or: [{ owner: userId }, { "members.userId": userId }],
    }).sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
};

// Get single project by ID
export const getProject = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });

    const isMember =
      project.owner === userId ||
      project.members.some((m) => m.userId === userId);
    if (!isMember) return res.status(403).json({ error: "Not authorized" });

    res.json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ error: "Failed to fetch project" });
  }
};

// Create a new project
export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description } = req.body as CreateProjectBody;
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    if (!name?.trim()) {
      return res.status(400).json({ error: "Project name is required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const project = new Project({
      name: name.trim(),
      description: description?.trim() || "",
      owner: userId,
      members: [
        {
          userId,
          email: user.email,
          name: user.displayName || "Unknown",
          role: "owner",
          joinedAt: new Date(),
        },
      ],
    });

    await project.save();
    res.status(201).json(project);
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ error: "Failed to create project" });
  }
};

// Update project (name, description)
export const updateProject = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;
    const { name, description } = req.body as UpdateProjectBody;
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });

    if (project.owner !== userId) {
      return res
        .status(403)
        .json({ error: "Only the project owner can update" });
    }

    if (name?.trim()) project.name = name.trim();
    if (description !== undefined)
      project.description = description?.trim() || "";
    await project.save();

    res.json(project);
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ error: "Failed to update project" });
  }
};

// Delete a project (owner only)
export const deleteProject = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });

    if (project.owner !== userId) {
      return res
        .status(403)
        .json({ error: "Only the project owner can delete" });
    }

    await Project.findByIdAndDelete(projectId);
    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ error: "Failed to delete project" });
  }
};

// Add a member to a project
export const addMember = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;
    const { email, role = "member" } = req.body as AddMemberBody;
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });

    // Check if current user is owner or admin
    const isOwner = project.owner === userId;
    const isAdmin = project.members.some(
      (m) => m.userId === userId && m.role === "admin",
    );
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "Not authorized to add members" });
    }

    if (!email?.trim()) {
      return res.status(400).json({ error: "Email is required" });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const existing = project.members.find((m) => m.email === trimmedEmail);
    if (existing) {
      return res.status(400).json({ error: "Member already in project" });
    }

    const invitedUser = await User.findOne({ email: trimmedEmail });
    if (!invitedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    project.members.push({
      userId: invitedUser._id.toString(),
      email: trimmedEmail,
      name: invitedUser.displayName || "Unknown",
      role: role === "admin" ? "admin" : "member",
      joinedAt: new Date(),
    });

    await project.save();
    res.json(project);
  } catch (error) {
    console.error("Error adding member:", error);
    res.status(500).json({ error: "Failed to add member" });
  }
};

// Remove a member from a project
export const removeMember = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId, userId: memberId } = req.params;
    const currentUserId = req.userId;
    if (!currentUserId) return res.status(401).json({ error: "Unauthorized" });

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });

    const isOwner = project.owner === currentUserId;
    const isAdmin = project.members.some(
      (m) => m.userId === currentUserId && m.role === "admin",
    );
    if (!isOwner && !isAdmin) {
      return res
        .status(403)
        .json({ error: "Not authorized to remove members" });
    }

    const memberIndex = project.members.findIndex((m) => m.userId === memberId);
    if (memberIndex === -1) {
      return res.status(404).json({ error: "Member not found" });
    }

    if (project.members[memberIndex].role === "owner") {
      return res.status(400).json({ error: "Cannot remove the project owner" });
    }

    project.members.splice(memberIndex, 1);
    await project.save();
    res.json(project);
  } catch (error) {
    console.error("Error removing member:", error);
    res.status(500).json({ error: "Failed to remove member" });
  }
};

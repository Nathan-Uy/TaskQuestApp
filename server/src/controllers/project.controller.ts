import { Request, Response } from "express";
import Project from "../models/Project";
import Team from "../models/Team";
import Sprint from "../models/Sprint";
import Task from "../models/Task";
import { User } from "../models/User";
import { getProject, sendAuthError } from "../middleware/workspace.auth";
import { param } from "../middleware/params";
import type {
  CreateProjectBody,
  UpdateProjectBody,
  AddMemberBody,
} from "../types/project.types";
import Invitation from "../models/Invitation";
import { sendInviteEmail } from "../lib/mailer";

interface AuthRequest extends Request {
  userId?: string;
}

export const getProjects = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    // Return projects the user owns OR is a member of
    const projects = await Project.find({
      $or: [
        { owner: userId },
        { "members.userId": userId, "members.inviteStatus": "accepted" },
      ],
    }).sort({ createdAt: -1 });

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

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const project = await Project.create({
      name: body.name.trim(),
      description: body.description?.trim() ?? "",
      owner: userId,
      members: [
        {
          userId: userId,
          email: user.email,
          name: user.displayName ?? "Unknown",
          role: "owner",
          joinedAt: new Date(),
          inviteStatus: "accepted",
        },
      ],
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

export const addMember = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const result = await getProject(param(req, "projectId"), userId);
    if (!result.ok) return sendAuthError(res, result);

    const body = req.body as AddMemberBody;
    if (!body.email?.trim())
      return res.status(400).json({ error: "Email required" });

    const email = body.email.trim().toLowerCase();
    const project = result.data;

    if (project.members.some((m) => m.email === email))
      return res.status(400).json({ error: "Member already in project" });

    const invitedUser = await User.findOne({ email });
    if (!invitedUser) return res.status(404).json({ error: "User not found" });

    const inviter = await User.findById(userId);

    // Check no pending invitation already exists
    const existingInvite = await Invitation.findOne({
      projectId: project._id.toString(),
      inviteeId: invitedUser._id.toString(),
      status: "pending",
    });
    if (existingInvite)
      return res.status(400).json({ error: "Invitation already sent" });

    // Create invitation record
    await Invitation.create({
      projectId: project._id.toString(),
      projectName: project.name,
      inviterId: userId,
      inviterName: inviter?.displayName ?? "Someone",
      inviteeId: invitedUser._id.toString(),
      inviteeEmail: email,
      status: "pending",
    });

    // Send email — fire and forget
    sendInviteEmail({
      to: email,
      inviteeName: invitedUser.displayName ?? "there",
      teamName: project.name,
      projectName: project.name,
      inviterName: inviter?.displayName ?? "A teammate",
      acceptUrl: `${process.env.CLIENT_URL}/taskspace/projects`,
    }).catch((err) => console.error("Invite email failed:", err));

    res.json({ message: "Invitation sent" });
  } catch {
    res.status(500).json({ error: "Failed to send invitation" });
  }
};

export const removeMember = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const result = await getProject(param(req, "projectId"), userId);
    if (!result.ok) return sendAuthError(res, result);

    const memberId = param(req, "userId");
    const project = result.data;
    const memberIndex = project.members.findIndex((m) => m.userId === memberId);

    if (memberIndex === -1)
      return res.status(404).json({ error: "Member not found" });
    if (project.members[memberIndex]?.role === "owner")
      return res.status(400).json({ error: "Cannot remove owner" });

    project.members.splice(memberIndex, 1);
    await project.save();
    res.json(project);
  } catch {
    res.status(500).json({ error: "Failed to remove member" });
  }
};

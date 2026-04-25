import { Request, Response } from "express";
import Team from "../models/Team";
import { User } from "../models/User";
import {
  getProject,
  getTeamWithAuth,
  sendAuthError,
} from "../middleware/workspace.auth";
import { param } from "../middleware/params";
import type {
  CreateTeamBody,
  UpdateTeamBody,
  AddMemberBody,
} from "../types/team.types";

interface AuthRequest extends Request {
  userId?: string;
}

export const getTeams = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const projectId = param(req, "projectId");
    const result = await getProject(projectId, userId);
    if (!result.ok) return sendAuthError(res, result);
    const teams = await Team.find({ projectId }).sort({ createdAt: -1 });
    res.json(teams);
  } catch {
    res.status(500).json({ error: "Failed to fetch teams" });
  }
};

export const getTeam = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const result = await getTeamWithAuth(param(req, "teamId"), userId);
    if (!result.ok) return sendAuthError(res, result);
    res.json(result.data.team);
  } catch {
    res.status(500).json({ error: "Failed to fetch team" });
  }
};

export const createTeam = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const projectId = param(req, "projectId");
    const result = await getProject(projectId, userId);
    if (!result.ok) return sendAuthError(res, result);
    const body = req.body as CreateTeamBody;
    if (!body.name?.trim())
      return res.status(400).json({ error: "Team name required" });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    const team = await Team.create({
      projectId,
      name: body.name.trim(),
      description: body.description?.trim() ?? "",
      owner: userId,
      members: [
        {
          userId: user._id.toString(),
          email: user.email,
          name: user.displayName ?? "Unknown",
          role: "owner",
          joinedAt: new Date(),
          inviteStatus: "accepted",
        },
      ],
    });
    res.status(201).json(team);
  } catch {
    res.status(500).json({ error: "Failed to create team" });
  }
};

export const updateTeam = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const result = await getTeamWithAuth(param(req, "teamId"), userId);
    if (!result.ok) return sendAuthError(res, result);
    const body = req.body as UpdateTeamBody;
    const team = result.data.team;
    if (body.name?.trim()) team.name = body.name.trim();
    if (body.description != null) team.description = body.description.trim();
    await team.save();
    res.json(team);
  } catch {
    res.status(500).json({ error: "Failed to update team" });
  }
};

export const deleteTeam = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const teamId = param(req, "teamId");
    const result = await getTeamWithAuth(teamId, userId);
    if (!result.ok) return sendAuthError(res, result);
    await Team.findByIdAndDelete(teamId);
    res.json({ message: "Team deleted" });
  } catch {
    res.status(500).json({ error: "Failed to delete team" });
  }
};

import { sendInviteEmail } from "../lib/mailer";
import Project from "../models/Project";

export const addTeamMember = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const result = await getTeamWithAuth(param(req, "teamId"), userId);
    if (!result.ok) return sendAuthError(res, result);

    const body = req.body as AddMemberBody;
    if (!body.email?.trim())
      return res.status(400).json({ error: "Email required" });

    const email = body.email.trim().toLowerCase();
    const team = result.data.team;

    if (team.members.some((m) => m.email === email))
      return res.status(400).json({ error: "Member already in team" });

    const invitedUser = await User.findOne({ email });
    if (!invitedUser) return res.status(404).json({ error: "User not found" });

    const inviter = await User.findById(userId);
    const project = await Project.findById(team.projectId);

    team.members.push({
      userId: invitedUser._id.toString(),
      email,
      name: invitedUser.displayName ?? "Unknown",
      role: body.role === "admin" ? "admin" : "member",
      joinedAt: new Date(),
      inviteStatus: "pending",
    });

    await team.save();

    // Send invite email — fire and forget, don't fail the request if email fails
    const acceptUrl = `${process.env.CLIENT_URL}/taskspace`;
    sendInviteEmail({
      to: email,
      inviteeName: invitedUser.displayName ?? "there",
      teamName: team.name,
      projectName: project?.name ?? "TaskQuest",
      inviterName: inviter?.displayName ?? "A teammate",
      acceptUrl,
    }).catch((err) => console.error("Invite email failed:", err));

    res.json(team);
  } catch {
    res.status(500).json({ error: "Failed to add member" });
  }
};

export const removeTeamMember = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const result = await getTeamWithAuth(param(req, "teamId"), userId);
    if (!result.ok) return sendAuthError(res, result);
    const team = result.data.team;
    const memberId = param(req, "userId");
    const memberIndex = team.members.findIndex((m) => m.userId === memberId);
    if (memberIndex === -1)
      return res.status(404).json({ error: "Member not found" });
    if (team.members[memberIndex]?.role === "owner")
      return res.status(400).json({ error: "Cannot remove owner" });
    team.members.splice(memberIndex, 1);
    await team.save();
    res.json(team);
  } catch {
    res.status(500).json({ error: "Failed to remove member" });
  }
};

export const updateTeamCoverPhoto = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const result = await getTeamWithAuth(param(req, "teamId"), userId);
    if (!result.ok) return sendAuthError(res, result);

    const { coverPhoto } = req.body;
    if (coverPhoto && coverPhoto.length > 200 * 1024)
      return res.status(400).json({ error: "Image too large" });

    result.data.team.coverPhoto = coverPhoto ?? null;
    await result.data.team.save();
    res.json(result.data.team);
  } catch {
    res.status(500).json({ error: "Failed to update cover photo" });
  }
};

export const updateTeamColor = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const result = await getTeamWithAuth(param(req, "teamId"), userId);
    if (!result.ok) return sendAuthError(res, result);

    result.data.team.color = req.body.color ?? null;
    await result.data.team.save();
    res.json(result.data.team);
  } catch {
    res.status(500).json({ error: "Failed to update color" });
  }
};

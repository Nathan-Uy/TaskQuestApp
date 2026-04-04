import { Request, Response } from "express";
import Team from "../models/Team";
import Project from "../models/Project";
import { User } from "../models/User";
import {
  CreateTeamBody,
  UpdateTeamBody,
  AddMemberBody,
} from "../types/team.types";

interface AuthRequest extends Request {
  userId?: string;
}

// Get all teams for a project (user must be project owner)
export const getTeams = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });
    if (project.owner !== userId)
      return res.status(403).json({ error: "Not authorized" });

    const teams = await Team.find({ projectId }).sort({ createdAt: -1 });
    res.json(teams);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch teams" });
  }
};

// Get single team
export const getTeam = async (req: AuthRequest, res: Response) => {
  try {
    const { teamId } = req.params;
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ error: "Team not found" });

    const project = await Project.findById(team.projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });
    if (project.owner !== userId)
      return res.status(403).json({ error: "Not authorized" });

    res.json(team);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch team" });
  }
};

// Create team
export const createTeam = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;
    const { name, description } = req.body as CreateTeamBody;
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });
    if (project.owner !== userId)
      return res
        .status(403)
        .json({ error: "Only project owner can create teams" });

    if (!name?.trim())
      return res.status(400).json({ error: "Team name required" });

    // Get the current user to add as owner member
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const newTeam = new Team({
      projectId,
      name: name.trim(),
      description: description?.trim() || "",
      owner: userId,
      members: [
        {
          userId: user._id.toString(),
          email: user.email,
          name: user.displayName || "Unknown",
          role: "owner",
          joinedAt: new Date(),
          inviteStatus: "accepted",
        },
      ],
    });

    await newTeam.save();
    res.status(201).json(newTeam);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create team" });
  }
};

// Update team
export const updateTeam = async (req: AuthRequest, res: Response) => {
  try {
    const { teamId } = req.params;
    const { name, description } = req.body as UpdateTeamBody;
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ error: "Team not found" });

    const project = await Project.findById(team.projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });
    if (project.owner !== userId)
      return res.status(403).json({ error: "Not authorized" });

    if (name?.trim()) team.name = name.trim();
    if (description !== undefined) team.description = description?.trim() || "";
    await team.save();
    res.json(team);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update team" });
  }
};

// Delete team
export const deleteTeam = async (req: AuthRequest, res: Response) => {
  try {
    const { teamId } = req.params;
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ error: "Team not found" });

    const project = await Project.findById(team.projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });
    if (project.owner !== userId)
      return res.status(403).json({ error: "Not authorized" });

    await Team.findByIdAndDelete(teamId);
    res.json({ message: "Team deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete team" });
  }
};

// Add member to team
export const addTeamMember = async (req: AuthRequest, res: Response) => {
  try {
    const { teamId } = req.params;
    const { email, role = "member" } = req.body as AddMemberBody;
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ error: "Team not found" });

    const project = await Project.findById(team.projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });
    if (project.owner !== userId)
      return res
        .status(403)
        .json({ error: "Only project owner can add members" });

    if (!email?.trim())
      return res.status(400).json({ error: "Email required" });
    const trimmedEmail = email.trim().toLowerCase();
    if (team.members.some((m) => m.email === trimmedEmail)) {
      return res.status(400).json({ error: "Member already in team" });
    }

    const invitedUser = await User.findOne({ email: trimmedEmail });
    if (!invitedUser) return res.status(404).json({ error: "User not found" });

    team.members.push({
      userId: invitedUser._id.toString(),
      email: trimmedEmail,
      name: invitedUser.displayName || "Unknown",
      role: role === "admin" ? "admin" : "member",
      joinedAt: new Date(),
      inviteStatus: "pending",
    });
    await team.save();
    res.json(team);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add member" });
  }
};

// Remove member from team
export const removeTeamMember = async (req: AuthRequest, res: Response) => {
  try {
    const { teamId, userId: memberId } = req.params;
    const currentUserId = req.userId;
    if (!currentUserId) return res.status(401).json({ error: "Unauthorized" });

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ error: "Team not found" });

    const project = await Project.findById(team.projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });
    if (project.owner !== currentUserId)
      return res
        .status(403)
        .json({ error: "Only project owner can remove members" });

    const memberIndex = team.members.findIndex((m) => m.userId === memberId);
    if (memberIndex === -1)
      return res.status(404).json({ error: "Member not found" });
    if (team.members[memberIndex].role === "owner")
      return res.status(400).json({ error: "Cannot remove owner" });

    team.members.splice(memberIndex, 1);
    await team.save();
    res.json(team);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to remove member" });
  }
};

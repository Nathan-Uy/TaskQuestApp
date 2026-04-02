import { Request, Response } from "express";
import WorkspaceTeam from "../models/WorkspaceTeam";
import { User } from "../models/User";
import { sendMail } from "../lib/mailer";

interface AuthRequest extends Request {
  userId?: string;
}

// Get all teams for user
export const getTeams = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    // Get teams where user is member or owner
    const teams = await WorkspaceTeam.find({
      $or: [{ owner: userId }, { "members.userId": userId }],
    }).sort({ createdAt: -1 });

    res.json(teams);
  } catch (error) {
    console.error("Error fetching teams:", error);
    res.status(500).json({ error: "Failed to fetch teams" });
  }
};

// Get single team
export const getTeam = async (req: AuthRequest, res: Response) => {
  try {
    const { teamId } = req.params;
    const userId = req.userId;

    const team = await WorkspaceTeam.findById(teamId);

    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    // Check if user is member or owner
    const isMember =
      team.owner === userId || team.members.some((m) => m.userId === userId);

    if (!isMember) {
      return res
        .status(403)
        .json({ error: "Not authorized to view this team" });
    }

    res.json(team);
  } catch (error) {
    console.error("Error fetching team:", error);
    res.status(500).json({ error: "Failed to fetch team" });
  }
};

// Create team
export const createTeam = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description } = req.body;
    const userId = req.userId;

    if (!name?.trim()) {
      return res.status(400).json({ error: "Team name is required" });
    }

    // Get user data for members array
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const team = new WorkspaceTeam({
      name: name.trim(),
      description: description?.trim() || "",
      owner: userId,
      members: [
        {
          userId,
          email: user.email,
          name: user.displayName || "Unknown",
          role: "owner",
          inviteStatus: "accepted",
        },
      ],
    });

    await team.save();
    res.status(201).json(team);
  } catch (error) {
    console.error("Error creating team:", error);
    res.status(500).json({ error: "Failed to create team" });
  }
};

// Update team
export const updateTeam = async (req: AuthRequest, res: Response) => {
  try {
    const { teamId } = req.params;
    const { name, description } = req.body;
    const userId = req.userId;

    const team = await WorkspaceTeam.findById(teamId);

    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    // Only owner can update team
    if (team.owner !== userId) {
      return res.status(403).json({ error: "Only team owner can update team" });
    }

    if (name?.trim()) {
      team.name = name.trim();
    }

    if (description !== undefined) {
      team.description = description?.trim() || "";
    }

    await team.save();
    res.json(team);
  } catch (error) {
    console.error("Error updating team:", error);
    res.status(500).json({ error: "Failed to update team" });
  }
};

// Delete team
export const deleteTeam = async (req: AuthRequest, res: Response) => {
  try {
    const { teamId } = req.params;
    const userId = req.userId;

    const team = await WorkspaceTeam.findById(teamId);

    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    // Only owner can delete team
    if (team.owner !== userId) {
      return res.status(403).json({ error: "Only team owner can delete team" });
    }

    await WorkspaceTeam.findByIdAndDelete(teamId);
    res.json({ message: "Team deleted successfully" });
  } catch (error) {
    console.error("Error deleting team:", error);
    res.status(500).json({ error: "Failed to delete team" });
  }
};

// Invite member to team
export const inviteMember = async (req: AuthRequest, res: Response) => {
  try {
    const { teamId } = req.params;
    const { email } = req.body;
    const userId = req.userId;

    const team = await WorkspaceTeam.findById(teamId);

    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    // Only owner/admin can invite members
    const memberRole: any = team.members.find((m) => m.userId === userId)?.role;

    if (team.owner !== userId && memberRole !== "admin") {
      return res
        .status(403)
        .json({ error: "Not authorized to invite members" });
    }

    if (!email?.trim()) {
      return res.status(400).json({ error: "Email is required" });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Check if member already exists
    if (team.members.some((m) => m.email === trimmedEmail)) {
      return res
        .status(400)
        .json({ error: "Member already invited or in team" });
    }

    // Get user details from User model
    const invitedUser = await User.findOne({ email: trimmedEmail });

    if (!invitedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Add member with pending status
    team.members.push({
      userId: invitedUser._id?.toString() || "",
      email: trimmedEmail,
      name: invitedUser.displayName || "Unknown",
      role: "member",
      inviteStatus: "pending",
    });

    await team.save();

    // Send invitation email
    const inviterUser = await User.findById(userId);
    const teamLink = `${process.env.FRONTEND_URL}/workspace/teams/${teamId}`;

    await sendMail({
      to: trimmedEmail,
      subject: `You're invited to join ${team.name} workspace team`,
      html: `
        <p>Hi ${invitedUser.displayName},</p>
        <p>${inviterUser?.displayName || "A user"} has invited you to join the <strong>${team.name}</strong> team in TaskQuest Workspace.</p>
        <p><a href="${teamLink}">Click here to view the team</a></p>
        <p>Best regards,<br>TaskQuest Team</p>
      `,
    });

    res.json(team);
  } catch (error) {
    console.error("Error inviting member:", error);
    res.status(500).json({ error: "Failed to invite member" });
  }
};

// Remove member from team
export const removeMember = async (req: AuthRequest, res: Response) => {
  try {
    const { teamId, memberId } = req.params;
    const userId = req.userId;

    const team = await WorkspaceTeam.findById(teamId);

    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    // Only owner can remove members
    if (team.owner !== userId) {
      return res
        .status(403)
        .json({ error: "Only team owner can remove members" });
    }

    const memberIndex = team.members.findIndex((m) => m.userId === memberId);

    if (memberIndex === -1) {
      return res.status(404).json({ error: "Member not found in team" });
    }

    // Cannot remove owner
    if (team.members[memberIndex].role === "owner") {
      return res.status(400).json({ error: "Cannot remove team owner" });
    }

    team.members.splice(memberIndex, 1);
    await team.save();

    res.json(team);
  } catch (error) {
    console.error("Error removing member:", error);
    res.status(500).json({ error: "Failed to remove member" });
  }
};

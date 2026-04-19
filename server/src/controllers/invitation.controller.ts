import { Response } from "express";
import Invitation from "../models/Invitation";
import Project from "../models/Project";
import { User } from "../models/User";
import { AuthRequest } from "../middleware/auth";
import { param } from "../middleware/params";
import Team from "../models/Team";

export const getMyInvitations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const invitations = await Invitation.find({
      inviteeId: String(userId),
      status: "pending",
    }).sort({ createdAt: -1 });

    res.json(invitations);
  } catch (err) {
    console.error("getMyInvitations error:", err);
    res.status(500).json({ error: "Failed to fetch invitations" });
  }
};

export const acceptInvitation = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const invitationId = param(req, "invitationId");
    const invitation = await Invitation.findById(invitationId);

    if (!invitation)
      return res.status(404).json({ error: "Invitation not found" });
    if (invitation.inviteeId !== String(userId))
      return res.status(403).json({ error: "Not authorized" });
    if (invitation.status !== "pending")
      return res.status(400).json({ error: "Invitation already used" });

    const project = await Project.findById(invitation.projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // ✅ Add to Project
    const alreadyProjectMember = project.members.some(
      (m) => m.userId === String(userId),
    );
    if (!alreadyProjectMember) {
      project.members.push({
        userId: String(userId),
        email: user.email,
        name: user.displayName ?? "Unknown",
        role: "member",
        joinedAt: new Date(),
        inviteStatus: "accepted",
      });
      await project.save();
    }

    // ✅ Add to ALL teams in the project
    const teams = await Team.find({ projectId: invitation.projectId });
    for (const team of teams) {
      const alreadyTeamMember = team.members.some(
        (m) => m.userId === String(userId),
      );
      if (!alreadyTeamMember) {
        team.members.push({
          userId: String(userId),
          email: user.email,
          name: user.displayName ?? "Unknown",
          role: "member",
          joinedAt: new Date(),
          inviteStatus: "accepted",
        });
        await team.save();
      }
    }

    invitation.status = "accepted";
    await invitation.save();

    res.json({ message: "Invitation accepted", project });
  } catch (err) {
    console.error("acceptInvitation error:", err);
    res.status(500).json({ error: "Failed to accept invitation" });
  }
};

export const rejectInvitation = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const invitationId = param(req, "invitationId");
    const invitation = await Invitation.findById(invitationId);

    if (!invitation)
      return res.status(404).json({ error: "Invitation not found" });
    if (invitation.inviteeId !== String(userId))
      return res.status(403).json({ error: "Not authorized" });
    if (invitation.status !== "pending")
      return res.status(400).json({ error: "Invitation already used" });

    invitation.status = "rejected";
    await invitation.save();

    res.json({ message: "Invitation rejected" });
  } catch (err) {
    console.error("rejectInvitation error:", err);
    res.status(500).json({ error: "Failed to reject invitation" });
  }
};

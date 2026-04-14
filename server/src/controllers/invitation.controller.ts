import { Request, Response } from "express";
import Invitation from "../models/Invitation";
import Project from "../models/Project";
import { User } from "../models/User";
import { AuthRequest } from "../middleware/auth";
import { param } from "../middleware/params";

export const getMyInvitations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const invitations = await Invitation.find({
      inviteeId: userId,
      status: "pending",
    }).sort({ createdAt: -1 });

    res.json(invitations);
  } catch {
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
    if (invitation.inviteeId !== userId)
      return res.status(403).json({ error: "Not authorized" });
    if (invitation.status !== "pending")
      return res.status(400).json({ error: "Invitation already used" });

    const project = await Project.findById(invitation.projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Check not already a member
    const alreadyMember = project.members.some((m) => m.userId === userId);
    if (!alreadyMember) {
      project.members.push({
        userId: userId,
        email: user.email,
        name: user.displayName ?? "Unknown",
        role: "member",
        joinedAt: new Date(),
        inviteStatus: "accepted",
      });
      await project.save();
    }

    invitation.status = "accepted";
    await invitation.save();

    res.json({ message: "Invitation accepted", project });
  } catch {
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
    if (invitation.inviteeId !== userId)
      return res.status(403).json({ error: "Not authorized" });
    if (invitation.status !== "pending")
      return res.status(400).json({ error: "Invitation already used" });

    invitation.status = "rejected";
    await invitation.save();

    res.json({ message: "Invitation rejected" });
  } catch {
    res.status(500).json({ error: "Failed to reject invitation" });
  }
};

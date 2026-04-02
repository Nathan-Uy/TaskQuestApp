import { Request, Response } from 'express';
import WorkspaceChatMessage from '../models/WorkspaceChatMessage';
import WorkspaceTeam from '../models/WorkspaceTeam';

interface AuthRequest extends Request {
  userId?: string;
}

// Get chat messages for team
export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const { teamId } = req.params;
    const userId = req.userId;
    const { limit = 50, page = 1 } = req.query;

    // Check if user is member of team
    const team = await WorkspaceTeam.findById(teamId);

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const isMember =
      team.owner === userId ||
      team.members.some((m) => m.userId === userId);

    if (!isMember) {
      return res
        .status(403)
        .json({ error: 'Not authorized to view team messages' });
    }

    const pageNum = parseInt(page as string) || 1;
    const limitNum = Math.min(parseInt(limit as string) || 50, 100);
    const skip = (pageNum - 1) * limitNum;

    const messages = await WorkspaceChatMessage.find({ teamId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Reverse to get chronological order
    messages.reverse();

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

// Send chat message
export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { teamId } = req.params;
    const { message } = req.body;
    const userId = req.userId;

    if (!message?.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    // Check if user is member of team
    const team = await WorkspaceTeam.findById(teamId);

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const isMember =
      team.owner === userId ||
      team.members.some((m) => m.userId === userId);

    if (!isMember) {
      return res
        .status(403)
        .json({ error: 'Not authorized to send message in this team' });
    }

    // Get member info
    const member = team.members.find((m) => m.userId === userId);

    if (!member) {
      return res.status(400).json({ error: 'User is not a team member' });
    }

    const chatMessage = new WorkspaceChatMessage({
      teamId,
      userId,
      userName: member.name,
      userEmail: member.email,
      message: message.trim(),
    });

    await chatMessage.save();
    res.status(201).json(chatMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

// Delete message (own messages only or team owner)
export const deleteMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { messageId, teamId } = req.params;
    const userId = req.userId;

    const message = await WorkspaceChatMessage.findById(messageId);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Check authorization
    const team = await WorkspaceTeam.findById(teamId);

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Can delete own messages or team owner can delete any
    const isOwner = message.userId === userId;
    const isTeamOwner = team.owner === userId;

    if (!isOwner && !isTeamOwner) {
      return res
        .status(403)
        .json({ error: 'Not authorized to delete this message' });
    }

    await WorkspaceChatMessage.findByIdAndDelete(messageId);
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
};

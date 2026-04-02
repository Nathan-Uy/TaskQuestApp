import { Request, Response } from 'express';
import WorkspaceSprint from '../models/WorkspaceSprint';
import WorkspaceTeam from '../models/WorkspaceTeam';

interface AuthRequest extends Request {
  userId?: string;
}

// Get sprints by team
export const getSprints = async (req: AuthRequest, res: Response) => {
  try {
    const { teamId } = req.params;
    const userId = req.userId;
    const { status } = req.query;

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
        .json({ error: 'Not authorized to view team sprints' });
    }

    // Build query
    const query: any = { teamId };

    if (status) {
      query.status = status;
    }

    const sprints = await WorkspaceSprint.find(query).sort({
      createdAt: -1,
    });

    res.json(sprints);
  } catch (error) {
    console.error('Error fetching sprints:', error);
    res.status(500).json({ error: 'Failed to fetch sprints' });
  }
};

// Get single sprint
export const getSprint = async (req: AuthRequest, res: Response) => {
  try {
    const { sprintId } = req.params;
    const userId = req.userId;

    const sprint = await WorkspaceSprint.findById(sprintId);

    if (!sprint) {
      return res.status(404).json({ error: 'Sprint not found' });
    }

    // Check if user is member of team
    const team = await WorkspaceTeam.findById(sprint.teamId);

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const isMember =
      team.owner === userId ||
      team.members.some((m) => m.userId === userId);

    if (!isMember) {
      return res
        .status(403)
        .json({ error: 'Not authorized to view this sprint' });
    }

    res.json(sprint);
  } catch (error) {
    console.error('Error fetching sprint:', error);
    res.status(500).json({ error: 'Failed to fetch sprint' });
  }
};

// Create sprint
export const createSprint = async (req: AuthRequest, res: Response) => {
  try {
    const { teamId } = req.params;
    const { name, description, startDate, endDate } = req.body;
    const userId = req.userId;

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
        .json({ error: 'Not authorized to create sprint in this team' });
    }

    if (!name?.trim()) {
      return res.status(400).json({ error: 'Sprint name is required' });
    }

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ error: 'Start date and end date are required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return res
        .status(400)
        .json({ error: 'Start date must be before end date' });
    }

    const sprint = new WorkspaceSprint({
      teamId,
      name: name.trim(),
      description: description?.trim() || '',
      startDate: start,
      endDate: end,
    });

    await sprint.save();
    res.status(201).json(sprint);
  } catch (error) {
    console.error('Error creating sprint:', error);
    res.status(500).json({ error: 'Failed to create sprint' });
  }
};

// Update sprint
export const updateSprint = async (req: AuthRequest, res: Response) => {
  try {
    const { sprintId } = req.params;
    const { name, description, startDate, endDate, status } = req.body;
    const userId = req.userId;

    const sprint = await WorkspaceSprint.findById(sprintId);

    if (!sprint) {
      return res.status(404).json({ error: 'Sprint not found' });
    }

    // Check if user is member of team
    const team = await WorkspaceTeam.findById(sprint.teamId);

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const isMember =
      team.owner === userId ||
      team.members.some((m) => m.userId === userId);

    if (!isMember) {
      return res
        .status(403)
        .json({ error: 'Not authorized to update this sprint' });
    }

    if (name?.trim()) {
      sprint.name = name.trim();
    }

    if (description !== undefined) {
      sprint.description = description?.trim() || '';
    }

    if (startDate) {
      sprint.startDate = new Date(startDate);
    }

    if (endDate) {
      sprint.endDate = new Date(endDate);
    }

    if (status && ['planning', 'active', 'completed'].includes(status)) {
      sprint.status = status;
    }

    // Validate dates
    if (sprint.startDate >= sprint.endDate) {
      return res
        .status(400)
        .json({ error: 'Start date must be before end date' });
    }

    await sprint.save();
    res.json(sprint);
  } catch (error) {
    console.error('Error updating sprint:', error);
    res.status(500).json({ error: 'Failed to update sprint' });
  }
};

// Delete sprint
export const deleteSprint = async (req: AuthRequest, res: Response) => {
  try {
    const { sprintId } = req.params;
    const userId = req.userId;

    const sprint = await WorkspaceSprint.findById(sprintId);

    if (!sprint) {
      return res.status(404).json({ error: 'Sprint not found' });
    }

    // Check if user is member of team (and team owner/admin for deletion)
    const team = await WorkspaceTeam.findById(sprint.teamId);

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Only owner can delete sprint
    if (team.owner !== userId) {
      return res
        .status(403)
        .json({ error: 'Only team owner can delete sprint' });
    }

    await WorkspaceSprint.findByIdAndDelete(sprintId);
    res.json({ message: 'Sprint deleted successfully' });
  } catch (error) {
    console.error('Error deleting sprint:', error);
    res.status(500).json({ error: 'Failed to delete sprint' });
  }
};

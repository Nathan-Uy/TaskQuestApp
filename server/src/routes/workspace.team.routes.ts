import { Router } from 'express';
import { protect } from '../middleware/auth';
import {
  getTeams,
  getTeam,
  createTeam,
  updateTeam,
  deleteTeam,
  inviteMember,
  removeMember,
} from '../controllers/workspace.team.controller';

const router = Router();

// All routes require authentication
router.use(protect);

// Team routes
router.get('/', getTeams); // Get all teams for user
router.post('/', createTeam); // Create new team
router.get('/:teamId', getTeam); // Get single team
router.put('/:teamId', updateTeam); // Update team
router.delete('/:teamId', deleteTeam); // Delete team

// Team member routes
router.post('/:teamId/members/invite', inviteMember); // Invite member
router.delete('/:teamId/members/:memberId', removeMember); // Remove member

export default router;

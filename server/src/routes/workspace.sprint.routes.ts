import { Router } from 'express';
import { protect } from '../middleware/auth';
import {
  getSprints,
  getSprint,
  createSprint,
  updateSprint,
  deleteSprint,
} from '../controllers/workspace.sprint.controller';

const router = Router();

// All routes require authentication
router.use(protect);

// Sprint routes
router.get('/team/:teamId', getSprints); // Get sprints by team
router.post('/team/:teamId', createSprint); // Create sprint for team
router.get('/:sprintId', getSprint); // Get single sprint
router.put('/:sprintId', updateSprint); // Update sprint
router.delete('/:sprintId', deleteSprint); // Delete sprint

export default router;

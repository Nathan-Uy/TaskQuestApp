import { Router } from 'express';
import { protect } from '../middleware/auth';
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/workspace.task.controller';

const router = Router();

// All routes require authentication
router.use(protect);

// Task routes
router.get('/sprint/:sprintId', getTasks); // Get tasks by sprint
router.post('/sprint/:sprintId', createTask); // Create task in sprint
router.get('/:taskId', getTask); // Get single task
router.put('/:taskId', updateTask); // Update task
router.delete('/:taskId', deleteTask); // Delete task

export default router;

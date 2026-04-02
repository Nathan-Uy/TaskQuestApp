import { Router } from 'express';
import { protect } from '../middleware/auth';
import {
  getMessages,
  sendMessage,
  deleteMessage,
} from '../controllers/workspace.chat.controller';

const router = Router();

// All routes require authentication
router.use(protect);

// Chat routes
router.get('/team/:teamId', getMessages); // Get messages for team
router.post('/team/:teamId', sendMessage); // Send message to team
router.delete('/:messageId/team/:teamId', deleteMessage); // Delete message

export default router;

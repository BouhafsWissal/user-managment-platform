import express from 'express';
import { createInvite, respondToInvite } from '../controllers/inviteController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/courses/:courseId/invite', authenticateToken, createInvite);
router.post('/:inviteId/respond', authenticateToken, respondToInvite);

export default router;
import { Router } from 'express';
import { ChatController } from '../controllers/ChatController.js';
import { chatLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/', chatLimiter, ChatController.sendMessage);

export default router;

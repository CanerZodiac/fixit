import { Router } from 'express';
import { AuthController } from '../controllers/AuthController.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

// Public auth routes
router.post('/register',      authLimiter, AuthController.register);
router.post('/verify-email',               AuthController.verifyEmail);
router.post('/forgot-password', authLimiter, AuthController.forgotPassword);
router.post('/verify-reset',               AuthController.verifyReset);
router.post('/reset-password',             AuthController.resetPassword);
router.post('/login',         authLimiter, AuthController.login);

// Protected route
router.get('/me', verifyToken, AuthController.me);

export default router;

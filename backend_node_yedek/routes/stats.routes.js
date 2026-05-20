import { Router } from 'express';
import { StatsController } from '../controllers/StatsController.js';

const router = Router();

router.get('/', StatsController.getStats);

export default router;

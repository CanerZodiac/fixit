import { Router } from 'express';
import authRoutes    from './auth.routes.js';
import userRoutes    from './user.routes.js';
import ticketRoutes  from './ticket.routes.js';
import assetRoutes   from './asset.routes.js';
import articleRoutes from './article.routes.js';
import statsRoutes   from './stats.routes.js';
import chatRoutes    from './chat.routes.js';
import mailRoutes    from './mail.routes.js';

/**
 * Ana router — tüm alt router'ları birleştirir.
 * Yeni bir modül eklemek için buraya bir satır eklemek yeterli.
 */

const router = Router();

router.use('/auth',     authRoutes);
router.use('/users',    userRoutes);
router.use('/tickets',  ticketRoutes);
router.use('/assets',   assetRoutes);
router.use('/articles', articleRoutes);
router.use('/stats',    statsRoutes);
router.use('/chat',     chatRoutes);
router.use('/mail',     mailRoutes);

export default router;

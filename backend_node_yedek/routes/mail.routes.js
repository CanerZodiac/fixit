import { Router } from 'express';
import { MailController } from '../controllers/MailController.js';

const router = Router();

router.post('/send',                MailController.send);
router.post('/ticket-notification', MailController.ticketNotification);
router.get('/config',               MailController.getConfig);

export default router;

import { Router } from 'express';
import { TicketController } from '../controllers/TicketController.js';

const router = Router();

router.get('/',                    TicketController.getAll);
router.get('/:id',                 TicketController.getById);
router.post('/',                   TicketController.create);
router.put('/:id/status',          TicketController.updateStatus);
router.put('/:id/assign',          TicketController.assign);
router.post('/:id/messages',       TicketController.addMessage);

export default router;

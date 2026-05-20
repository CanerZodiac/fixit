import { Router } from 'express';
import { UserController } from '../controllers/UserController.js';

const router = Router();

router.get('/',           UserController.getAll);
router.get('/:id',        UserController.getById);
router.get('/role/:role', UserController.getByRole);

export default router;

import { Router } from 'express';
import { AssetController } from '../controllers/AssetController.js';

const router = Router();

router.get('/',      AssetController.getAll);
router.post('/',     AssetController.create);
router.put('/:id',   AssetController.update);
router.delete('/:id', AssetController.remove);

export default router;

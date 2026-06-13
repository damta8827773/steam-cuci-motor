import { Router } from 'express';
import { getPrices, updatePrices } from '../controllers/prices';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', getPrices);
router.put('/', requireAuth, updatePrices);

export default router;

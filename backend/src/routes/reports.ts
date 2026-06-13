import { Router } from 'express';
import { sendReport } from '../controllers/reports';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/send', requireAuth, sendReport);

export default router;

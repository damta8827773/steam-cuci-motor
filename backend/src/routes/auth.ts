import { Router } from 'express';
import { login, verifyToken } from '../controllers/auth';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/login', login);
router.get('/verify', requireAuth, verifyToken);

export default router;

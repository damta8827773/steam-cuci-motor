import { Router } from 'express';
import { getEmployees, updateEmployee } from '../controllers/employees';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', getEmployees);
router.put('/:id', requireAuth, updateEmployee);

export default router;

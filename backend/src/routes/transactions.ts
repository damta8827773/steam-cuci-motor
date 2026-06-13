import { Router } from 'express';
import {
  createTransaction,
  getTodayTransactions,
  getDailyStats,
  getHourlyData,
  getEmployeeStats,
  getWeeklyData,
} from '../controllers/transactions';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/', createTransaction);
router.get('/', getTodayTransactions);
router.get('/stats', requireAuth, getDailyStats);
router.get('/hourly', requireAuth, getHourlyData);
router.get('/employee-stats', requireAuth, getEmployeeStats);
router.get('/weekly', requireAuth, getWeeklyData);

export default router;

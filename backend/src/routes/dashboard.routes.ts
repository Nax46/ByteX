import { Router } from 'express';
import { getDashboardHandler } from '../controllers/dashboard.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// All dashboard endpoints require authentication
router.use(requireAuth);

// GET /api/dashboard
router.get('/', getDashboardHandler);

export default router;

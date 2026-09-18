import { Router } from 'express';
import {
  getPersonalizedSummaryHandler,
  getSkillExplanationHandler,
  askAIMentorHandler,
} from '../controllers/aiPersonalization.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

// Protect AI personalization endpoints with authentication
router.use(requireAuth);

// GET /api/intelligence/ai/personalized-summary OR /api/v1/intelligence/ai/personalized-summary
router.get('/personalized-summary', getPersonalizedSummaryHandler);

// GET /api/intelligence/ai/explain-skill/:skillSlug OR /api/v1/intelligence/ai/explain-skill/:skillSlug
router.get('/explain-skill/:skillSlug', getSkillExplanationHandler);

// POST /api/intelligence/ai/mentor-ask OR /api/v1/intelligence/ai/mentor-ask
router.post('/mentor-ask', askAIMentorHandler);

export default router;

import { Router } from 'express';
import {
  getQuestionsHandler,
  startAssessmentHandler,
  submitAssessmentHandler,
  getAttemptHandler,
  getHistoryHandler,
} from '../controllers/assessment.controller';
import {
  validateAttemptParams,
  validateHistoryQuery,
} from '../validators/assessment.validator';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// All assessment endpoints require authentication
router.use(requireAuth);

// GET /api/assessment/questions
router.get('/questions', getQuestionsHandler);

// POST /api/assessment/start
router.post('/start', startAssessmentHandler);

// GET /api/assessment/history (declared before /:attemptId to prevent route collision)
router.get('/history', validateHistoryQuery, getHistoryHandler);

// GET /api/assessment/:attemptId
router.get('/:attemptId', validateAttemptParams, getAttemptHandler);

// POST /api/assessment/:attemptId/submit
router.post('/:attemptId/submit', validateAttemptParams, submitAssessmentHandler);

export default router;

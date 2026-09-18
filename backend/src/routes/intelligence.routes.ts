import { Router } from 'express';
import { getSkillGapPriorityHandler } from '../controllers/intelligence.controller.js';
import {
  getRoadmapProgressHandler,
  startModuleProgressHandler,
  updateModuleProgressHandler,
  completeModuleProgressHandler,
} from '../controllers/roadmapProgress.controller.js';
import {
  getReassessmentSummaryHandler,
  submitReassessmentHandler,
} from '../controllers/reassessment.controller.js';
import { generateAdaptiveRoadmapHandler } from '../controllers/adaptiveRoadmap.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

import resourceRoutes from './resource.routes.js';
import projectRoutes from './project.routes.js';
import aiRoutes from './ai.routes.js';

import { getCurrentRoadmapHandler, generateRoadmapHandler } from '../controllers/roadmap.controller.js';

const router = Router();

// Protect intelligence endpoints with authentication
router.use(requireAuth);

// GET /api/intelligence/skill-gap-priority (or /api/v1/intelligence/skill-gap-priority)
router.get('/skill-gap-priority', getSkillGapPriorityHandler);

// Resource, Project, and AI Endpoints
router.use('/resources', resourceRoutes);
router.use('/projects', projectRoutes);
router.use('/ai', aiRoutes);

// Roadmap Base Endpoints
router.get('/roadmap/current', getCurrentRoadmapHandler);
router.post('/roadmap/generate', generateRoadmapHandler);

// Roadmap Progress Endpoints
router.get('/roadmap/progress', getRoadmapProgressHandler);
router.get('/roadmap/:roadmapId/progress', getRoadmapProgressHandler);
router.post('/roadmap/modules/:moduleId/start', startModuleProgressHandler);
router.patch('/roadmap/modules/:moduleId/progress', updateModuleProgressHandler);
router.post('/roadmap/modules/:moduleId/complete', completeModuleProgressHandler);

// Reassessment Endpoints
router.get('/reassessment/summary', getReassessmentSummaryHandler);
router.post('/reassessment/:assessmentId/submit', submitReassessmentHandler);

// Adaptive Roadmap Endpoint
router.post('/roadmap/adaptive', generateAdaptiveRoadmapHandler);

export default router;




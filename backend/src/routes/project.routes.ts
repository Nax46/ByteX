import { Router } from 'express';
import {
  getProjectsHandler,
  getProjectByIdHandler,
  getRecommendedProjectsHandler,
} from '../controllers/project.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

// Protect project endpoints with authentication
router.use(requireAuth);

// GET /api/projects/recommended OR /api/intelligence/projects/recommended
router.get('/recommended', getRecommendedProjectsHandler);

// GET /api/projects OR /api/intelligence/projects
router.get('/', getProjectsHandler);

// GET /api/projects/:id OR /api/intelligence/projects/:id
router.get('/:id', getProjectByIdHandler);

export default router;

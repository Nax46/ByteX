import { Router } from 'express';
import {
  getResourcesHandler,
  getResourceByIdHandler,
  getRecommendedResourcesHandler,
} from '../controllers/resource.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

// Protect resource endpoints with authentication
router.use(requireAuth);

// GET /api/resources/recommended OR /api/intelligence/resources/recommended
router.get('/recommended', getRecommendedResourcesHandler);
router.get('/recommendations', getRecommendedResourcesHandler);

// GET /api/resources OR /api/intelligence/resources
router.get('/', getResourcesHandler);

// GET /api/resources/:id OR /api/intelligence/resources/:id
router.get('/:id', getResourceByIdHandler);

export default router;

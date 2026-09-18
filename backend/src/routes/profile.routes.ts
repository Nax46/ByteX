import { Router } from 'express';
import { getProfile, onboarding, updateProfile } from '../controllers/profile.controller';
import {
  validateProfileBody,
  onboardingSchema,
  updateProfileSchema,
} from '../validators/profile.validator';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// All profile endpoints are protected
router.use(requireAuth);

// GET /api/profile
router.get('/', getProfile);

// POST /api/profile/onboarding
router.post('/onboarding', validateProfileBody(onboardingSchema), onboarding);

// PUT /api/profile
router.put('/', validateProfileBody(updateProfileSchema), updateProfile);

export default router;

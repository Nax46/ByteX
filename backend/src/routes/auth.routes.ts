import { Router } from 'express';
import { register, login, me } from '../controllers/auth.controller';
import { validateBody, registerSchema, loginSchema } from '../validators/auth.validator';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// Public Authentication Routes
router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);

// Protected Authentication Route
router.get('/me', requireAuth, me);

export default router;

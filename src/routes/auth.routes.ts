import { Router } from 'express';
import { register, login, demoLogin, googleLogin, me, updateProfile, updateInterests } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/demo-login', demoLogin);
router.post('/google', googleLogin);
router.get('/me', requireAuth, me);
router.patch('/me/profile', requireAuth, updateProfile);
router.patch('/me/interests', requireAuth, updateInterests);

export default router;

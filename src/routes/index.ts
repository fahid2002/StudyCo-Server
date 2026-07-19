import { Router } from 'express';
import authRoutes from './auth.routes';
import sessionRoutes from './session.routes';
import aiRoutes from './ai.routes';
import activityRoutes from './activity.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/sessions', sessionRoutes);
router.use('/ai', aiRoutes);
router.use('/activity', activityRoutes);

export default router;

import { Router } from 'express';
import authRoutes from './auth.routes';
import sessionRoutes from './session.routes';
import aiRoutes from './ai.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/sessions', sessionRoutes);
router.use('/ai', aiRoutes);

export default router;

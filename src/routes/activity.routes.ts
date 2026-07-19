import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { clearActivities, deleteActivity, listActivities } from '../controllers/activity.controller';

const router = Router();

router.get('/', requireAuth, listActivities);
router.delete('/', requireAuth, clearActivities);
router.delete('/:id', requireAuth, deleteActivity);

export default router;

import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { activityStats, clearActivities, deleteActivity, listActivities, recordAiDownload } from '../controllers/activity.controller';

const router = Router();

router.get('/', requireAuth, listActivities);
router.get('/stats', requireAuth, activityStats);
router.post('/ai-download', requireAuth, recordAiDownload);
router.delete('/', requireAuth, clearActivities);
router.delete('/:id', requireAuth, deleteActivity);

export default router;

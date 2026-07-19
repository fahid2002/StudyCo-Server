import { Router } from 'express';
import {
  listSessions,
  getSession,
  createSession,
  mySessions,
  deleteSession,
  reserveSeat,
  addReview,
} from '../controllers/session.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', listSessions);
router.get('/mine', requireAuth, mySessions);
router.get('/:id', getSession);
router.post('/', requireAuth, createSession);
router.delete('/:id', requireAuth, deleteSession);
router.post('/:id/reserve', requireAuth, reserveSeat);
router.post('/:id/reviews', requireAuth, addReview);

export default router;

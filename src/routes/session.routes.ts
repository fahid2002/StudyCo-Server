import { Router } from 'express';
import {
  listSessions,
  getSession,
  createSession,
  mySessions,
  bookedSessions,
  updateBooking,
  cancelBooking,
  deleteSession,
  reserveSeat,
  addReview,
} from '../controllers/session.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', listSessions);
router.get('/mine', requireAuth, mySessions);
router.get('/booked', requireAuth, bookedSessions);
router.get('/:id', requireAuth, getSession);
router.post('/', requireAuth, createSession);
router.delete('/:id', requireAuth, deleteSession);
router.post('/:id/reserve', requireAuth, reserveSeat);
router.patch('/:id/booking', requireAuth, updateBooking);
router.delete('/:id/booking', requireAuth, cancelBooking);
router.post('/:id/reviews', requireAuth, addReview);

export default router;

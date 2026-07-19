import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  createNote,
  createQuizScore,
  createTimetableItem,
  deleteNote,
  deleteTimetableItem,
  listBookmarks,
  listNotes,
  listQuizScores,
  listTimetable,
  toggleBookmark,
} from '../controllers/study.controller';

const router = Router();

router.get('/notes', requireAuth, listNotes);
router.post('/notes', requireAuth, createNote);
router.delete('/notes/:id', requireAuth, deleteNote);
router.get('/bookmarks', requireAuth, listBookmarks);
router.post('/bookmarks/:sessionId', requireAuth, toggleBookmark);
router.get('/timetable', requireAuth, listTimetable);
router.post('/timetable', requireAuth, createTimetableItem);
router.delete('/timetable/:id', requireAuth, deleteTimetableItem);
router.get('/quiz-scores', requireAuth, listQuizScores);
router.post('/quiz-scores', requireAuth, createQuizScore);

export default router;

import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { getChatHistory, postChatMessage } from '../controllers/ai.chat.controller';
import { generateContent, listGeneratedContent } from '../controllers/ai.generator.controller';
import { getMyRecommendations, postFeedback } from '../controllers/ai.recommend.controller';
import { analyzeDocument } from '../controllers/ai.document.controller';

const router = Router();

// AI Chat Assistant
router.get('/chat', requireAuth, getChatHistory);
router.post('/chat', requireAuth, postChatMessage);

// AI Content Generator
router.post('/generate', requireAuth, generateContent);
router.get('/generate', requireAuth, listGeneratedContent);

// AI Smart Recommendations
router.get('/recommendations', requireAuth, getMyRecommendations);
router.post('/recommendations/feedback', requireAuth, postFeedback);

// AI Document Intelligence
router.post('/document', requireAuth, upload.single('file'), analyzeDocument);

export default router;

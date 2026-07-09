import express from 'express';
import { attemptQuiz, createQuiz, getAttempts, getQuizzes, getQuizById } from '../controllers/quizController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', protect, getQuizzes);
router.get('/attempts/all', protect, getAttempts);
router.get('/:id', protect, getQuizById);
router.post('/', protect, authorize('faculty', 'teacher', 'admin'), createQuiz);
router.post('/:id/attempt', protect, authorize('student'), attemptQuiz);

export default router;

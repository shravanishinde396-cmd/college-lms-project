import express from 'express';
import { createNotice, deleteNotice, getNotices } from '../controllers/noticeController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
const router = express.Router();
router.get('/', protect, getNotices);
router.post('/', protect, authorize('admin', 'faculty', 'teacher'), createNotice);
router.delete('/:id', protect, authorize('admin', 'faculty', 'teacher'), deleteNotice);
export default router;

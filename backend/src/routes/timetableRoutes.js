import express from 'express';
import { createTimetableEntry, deleteTimetableEntry, getTimetable } from '../controllers/timetableController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
const router = express.Router();
router.get('/', protect, getTimetable);
router.post('/', protect, authorize('admin'), createTimetableEntry);
router.delete('/:id', protect, authorize('admin'), deleteTimetableEntry);
export default router;

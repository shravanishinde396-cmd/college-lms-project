import express from 'express';
import { getAttendance, markAttendance, getMonthlyReport } from '../controllers/attendanceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
const router = express.Router();
router.get('/', protect, getAttendance);
router.get('/monthly-report', protect, getMonthlyReport);
router.post('/', protect, authorize('faculty', 'teacher', 'admin'), markAttendance);
export default router;

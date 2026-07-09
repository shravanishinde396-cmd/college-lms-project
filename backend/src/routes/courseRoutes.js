import express from 'express';
import { addMaterial, createCourse, deleteCourse, enrollCourse, getCourseById, getCourses, myCourses, updateCourse } from '../controllers/courseController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import upload from '../utils/upload.js';

const router = express.Router();

router.get('/', getCourses);
router.get('/my-courses', protect, myCourses);
router.get('/:id', protect, getCourseById);
router.post('/', protect, authorize('admin', 'faculty', 'teacher'), upload.single('thumbnail'), createCourse);
router.post('/:id/enroll', protect, authorize('student'), enrollCourse);
router.post('/:id/materials', protect, authorize('faculty', 'teacher', 'admin'), addMaterial);
router.put('/:id', protect, authorize('admin', 'faculty', 'teacher'), upload.single('thumbnail'), updateCourse);
router.delete('/:id', protect, authorize('admin', 'faculty', 'teacher'), deleteCourse);

export default router;

import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';
import QuizAttempt from '../models/QuizAttempt.js';
import Notice from '../models/Notice.js';
import Attendance from '../models/Attendance.js';
import Enrollment from '../models/Enrollment.js';
import { isFacultyRole, normalizeRole } from '../utils/roleHelpers.js';

export const getDashboardStats = asyncHandler(async (req, res) => {
  const notices = await Notice.find().sort({ createdAt: -1 }).limit(5);
  const role = normalizeRole(req.user.role);

  if (role === 'admin') {
    const [students, faculty, courses, assignments] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: { $in: ['faculty', 'teacher'] } }),
      Course.countDocuments(),
      Assignment.countDocuments(),
    ]);
    res.json({ success: true, stats: { students, faculty, courses, assignments }, notices });
    return;
  }

  if (isFacultyRole(role)) {
    const myCourses = await Course.find({ teacher: req.user._id });
    const myAssignments = await Assignment.find({ teacher: req.user._id }).distinct('_id');
    const courseIds = myCourses.map(c => c._id);
    const [assignments, submissions, attendance] = await Promise.all([
      Assignment.countDocuments({ teacher: req.user._id }),
      Submission.countDocuments({ assignment: { $in: myAssignments } }),
      Attendance.countDocuments({ course: { $in: courseIds } }),
    ]);
    res.json({ success: true, stats: { myCourses: myCourses.length, assignments, submissions, attendance }, notices });
    return;
  }

  const [courses, submissions, attempts, attendanceRecords] = await Promise.all([
    Enrollment.countDocuments({ student: req.user._id, status: 'approved' }),
    Submission.countDocuments({ student: req.user._id }),
    QuizAttempt.find({ student: req.user._id }),
    Attendance.find({ student: req.user._id }),
  ]);
  const present = attendanceRecords.filter(a => a.status === 'present').length;
  const attendancePercentage = attendanceRecords.length ? Math.round((present / attendanceRecords.length) * 100) : 0;
  const averageQuiz = attempts.length ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length) : 0;
  res.json({ success: true, stats: { enrolledCourses: courses, submissions, quizzesTaken: attempts.length, attendancePercentage, averageQuiz }, notices });
});

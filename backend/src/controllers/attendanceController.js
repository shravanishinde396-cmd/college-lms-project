import asyncHandler from 'express-async-handler';
import Attendance from '../models/Attendance.js';
import Course from '../models/Course.js';
import { isFacultyRole, normalizeRole } from '../utils/roleHelpers.js';

export const markAttendance = asyncHandler(async (req, res) => {
  const { course, date, records = [] } = req.body;
  if (!course || !date || !Array.isArray(records) || !records.length) {
    res.status(400);
    throw new Error('Course, date and attendance records are required');
  }

  if (isFacultyRole(req.user.role)) {
    const ownCourse = await Course.findOne({ _id: course, teacher: req.user._id });
    if (!ownCourse) {
      res.status(403);
      throw new Error('You can only mark attendance for your assigned courses');
    }
  }

  const saved = [];
  for (const record of records) {
    const attendance = await Attendance.findOneAndUpdate(
      { course, student: record.student, date },
      { course, student: record.student, date, status: record.status, markedBy: req.user._id },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    saved.push(attendance);
  }

  res.status(201).json({ success: true, records: saved });
});

export const getAttendance = asyncHandler(async (req, res) => {
  const filter = {};
  const role = normalizeRole(req.user.role);
  if (role === 'student') filter.student = req.user._id;
  if (req.query.course) filter.course = req.query.course;
  if (req.query.student) filter.student = req.query.student;

  if (isFacultyRole(role) && req.query.course) {
    const ownCourse = await Course.findOne({ _id: req.query.course, teacher: req.user._id });
    if (!ownCourse) {
      res.status(403);
      throw new Error('You can only view attendance for your assigned courses');
    }
  }

  const attendance = await Attendance.find(filter)
    .populate('course', 'title code')
    .populate('student', 'name email')
    .sort({ date: -1 });
  res.json({ success: true, attendance });
});

export const getMonthlyReport = asyncHandler(async (req, res) => {
  const { course, month, year } = req.query;
  
  if (!course || !month || !year) {
    res.status(400);
    throw new Error('course, month, and year query params are required');
  }

  const startDate = new Date(Number(year), Number(month) - 1, 1);
  const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59);

  const attendance = await Attendance.find({
    course,
    date: { $gte: startDate, $lte: endDate }
  })
    .populate('student', 'name email')
    .sort({ date: 1, student: 1 });

  // Build per-student summary
  const summary = {};
  for (const record of attendance) {
    const sid = record.student?._id?.toString();
    if (!sid) continue;
    if (!summary[sid]) {
      summary[sid] = {
        student: record.student,
        present: 0,
        absent: 0,
        total: 0,
      };
    }
    summary[sid].total++;
    if (record.status === 'present') summary[sid].present++;
    else summary[sid].absent++;
  }

  const report = Object.values(summary).map(s => ({
    ...s,
    percentage: s.total ? Math.round((s.present / s.total) * 100) : 0,
  }));

  res.json({ success: true, report, raw: attendance });
});

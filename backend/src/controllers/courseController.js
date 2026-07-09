import asyncHandler from 'express-async-handler';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import { isFacultyRole } from '../utils/roleHelpers.js';

export const getCourses = asyncHandler(async (_req, res) => {
  const courses = await Course.find().populate('teacher department').sort({ createdAt: -1 });
  res.json({ success: true, courses });
});

export const getCourseById = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id).populate('teacher department');
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  const enrollments = await Enrollment.find({ course: req.params.id }).populate('student', 'name email role department');
  res.json({ success: true, course, enrollments });
});

export const createCourse = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  if (isFacultyRole(req.user.role)) body.teacher = req.user._id;
  if (!body.teacher) delete body.teacher;
  
  if (req.file) {
    body.thumbnail = `/uploads/${req.file.filename}`;
  }

  const course = await Course.create(body);
  res.status(201).json({ success: true, course });
});

export const updateCourse = asyncHandler(async (req, res) => {
  const updates = { ...req.body };
  if (Object.prototype.hasOwnProperty.call(updates, 'teacher') && !updates.teacher) updates.teacher = null;
  
  if (req.file) {
    updates.thumbnail = `/uploads/${req.file.filename}`;
  }

  const course = await Course.findByIdAndUpdate(req.params.id, updates, { new: true });
  res.json({ success: true, course });
});

export const deleteCourse = asyncHandler(async (req, res) => {
  await Course.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Course deleted' });
});

export const enrollCourse = asyncHandler(async (req, res) => {
  const exists = await Enrollment.findOne({ student: req.user._id, course: req.params.id });
  if (exists) {
    res.status(400);
    throw new Error('Already enrolled');
  }
  const enrollment = await Enrollment.create({ student: req.user._id, course: req.params.id, status: 'approved' });
  res.status(201).json({ success: true, enrollment });
});

export const myCourses = asyncHandler(async (req, res) => {
  if (isFacultyRole(req.user.role)) {
    const courses = await Course.find({ teacher: req.user._id }).populate('department teacher');
    res.json({ success: true, courses });
    return;
  }
  const enrollments = await Enrollment.find({ student: req.user._id, status: 'approved' }).populate({ path: 'course', populate: ['teacher', 'department'] });
  res.json({
    success: true,
    courses: enrollments
      .filter((enrollment) => enrollment.course)
      .map((enrollment) => ({ ...enrollment.course.toObject(), progress: enrollment.progress })),
  });
});

export const addMaterial = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  course.materials.push(req.body);
  await course.save();
  res.json({ success: true, course });
});

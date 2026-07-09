import asyncHandler from 'express-async-handler';
import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';

export const getAssignments = asyncHandler(async (req, res) => {
  const filter = req.query.course ? { course: req.query.course } : {};
  const assignments = await Assignment.find(filter).populate('course teacher').sort({ createdAt: -1 });
  res.json({ success: true, assignments });
});

export const createAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.create({ ...req.body, teacher: req.user._id, attachment: req.file ? `/uploads/${req.file.filename}` : '' });
  res.status(201).json({ success: true, assignment });
});

export const submitAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);
  const submission = await Submission.create({
    assignment: assignment._id,
    student: req.user._id,
    fileUrl: req.file ? `/uploads/${req.file.filename}` : '',
    text: req.body.text || '',
    isLate: new Date() > new Date(assignment.dueDate),
  });
  res.status(201).json({ success: true, submission });
});

export const getSubmissions = asyncHandler(async (req, res) => {
  const submissions = await Submission.find(req.query.assignment ? { assignment: req.query.assignment } : {})
    .populate('student', 'name email')
    .populate('assignment');
  res.json({ success: true, submissions });
});

export const gradeSubmission = asyncHandler(async (req, res) => {
  const submission = await Submission.findById(req.params.id);
  submission.marks = req.body.marks;
  submission.feedback = req.body.feedback;
  submission.status = 'graded';
  await submission.save();
  res.json({ success: true, submission });
});

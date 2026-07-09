import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import StudentProfile from '../models/StudentProfile.js';
import TeacherProfile from '../models/TeacherProfile.js';
import { normalizeRole, isFacultyRole } from '../utils/roleHelpers.js';

export const getUsers = asyncHandler(async (req, res) => {
  const requesterRole = normalizeRole(req.user.role);
  if (requesterRole !== 'admin') {
    res.status(403);
    throw new Error('Only admin can view all users');
  }
  const role = req.query.role ? normalizeRole(req.query.role) : undefined;
  const filter = role ? { role } : {};
  const users = await User.find(filter).populate('department').select('-password').sort({ createdAt: -1 });
  res.json({ success: true, users });
});

export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role = 'student', department, semester } = req.body;
  const safeRole = normalizeRole(role);
  const normalizedEmail = String(email || '').trim().toLowerCase();

  if (!name || !normalizedEmail || !password) {
    res.status(400);
    throw new Error('Name, email and password are required');
  }

  const exists = await User.findOne({ email: normalizedEmail });
  if (exists) {
    res.status(400);
    throw new Error('Email already registered');
  }

  const user = await User.create({ name, email: normalizedEmail, password, role: safeRole, department: department || undefined });

  if (safeRole === 'student') {
    await StudentProfile.create({ user: user._id, rollNumber: `STU-${Date.now().toString().slice(-6)}`, semester: Number(semester) || 1 });
  }
  if (isFacultyRole(safeRole)) {
    await TeacherProfile.create({ user: user._id, designation: 'Assistant Professor' });
  }

  const safeUser = await User.findById(user._id).populate('department').select('-password');
  res.status(201).json({ success: true, user: safeUser });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.name = req.body.name || user.name;
  user.avatar = req.body.avatar || user.avatar;
  await user.save();
  const safeUser = await User.findById(user._id).populate('department').select('-password');
  res.json({ success: true, user: safeUser });
});

export const deleteUser = asyncHandler(async (req, res) => {
  await Promise.all([
    User.findByIdAndDelete(req.params.id),
    StudentProfile.findOneAndDelete({ user: req.params.id }),
    TeacherProfile.findOneAndDelete({ user: req.params.id })
  ]);
  res.json({ success: true, message: 'User deleted' });
});

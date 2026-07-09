import asyncHandler from 'express-async-handler';
import Notice from '../models/Notice.js';
import { normalizeRole } from '../utils/roleHelpers.js';

export const getNotices = asyncHandler(async (req, res) => {
  const role = normalizeRole(req.user.role);
  const filter = role === 'student'
    ? { audience: { $in: ['all', 'students'] } }
    : role === 'faculty'
      ? { audience: { $in: ['all', 'teachers'] } }
      : {};

  const notices = await Notice.find(filter).populate('postedBy', 'name role').sort({ createdAt: -1 });
  res.json({ success: true, notices });
});

export const createNotice = asyncHandler(async (req, res) => {
  const notice = await Notice.create({ ...req.body, postedBy: req.user._id });
  res.status(201).json({ success: true, notice });
});

export const deleteNotice = asyncHandler(async (req, res) => {
  await Notice.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Notice deleted' });
});

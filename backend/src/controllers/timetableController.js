import asyncHandler from 'express-async-handler';
import Timetable from '../models/Timetable.js';

export const getTimetable = asyncHandler(async (_req, res) => {
  const entries = await Timetable.find().populate('course department').sort({ day: 1, startTime: 1 });
  res.json({ success: true, entries });
});

export const createTimetableEntry = asyncHandler(async (req, res) => {
  const entry = await Timetable.create(req.body);
  res.status(201).json({ success: true, entry });
});

export const deleteTimetableEntry = asyncHandler(async (req, res) => {
  await Timetable.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Timetable entry deleted' });
});
